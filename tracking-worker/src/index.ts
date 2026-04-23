interface Env {
  DB: D1Database;
  API_KEY: string;
}

// 1x1 transparent PNG (68 bytes)
const PIXEL = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
  0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
  0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x62, 0x00, 0x00, 0x00, 0x02,
  0x00, 0x01, 0xe2, 0x21, 0xbc, 0x33, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45,
  0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
]);

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // GET /t/:tracking_id.png — log open, return pixel
    const pixelMatch = url.pathname.match(/^\/t\/([a-zA-Z0-9_-]+)\.png$/);
    if (pixelMatch && request.method === "GET") {
      const trackingId = pixelMatch[1];
      const ip = request.headers.get("CF-Connecting-IP") || null;
      const userAgent = request.headers.get("User-Agent") || null;

      // Best-effort insert — never fail the pixel response
      try {
        await env.DB.prepare(
          "INSERT INTO opens (tracking_id, ip, user_agent) VALUES (?, ?, ?)"
        )
          .bind(trackingId, ip, userAgent)
          .run();
      } catch {
        // Swallow DB errors — always return the pixel
      }

      return new Response(PIXEL, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      });
    }

    // GET /api/opens?ids=a,b,c — return open events
    if (url.pathname === "/api/opens" && request.method === "GET") {
      const apiKey = request.headers.get("X-API-Key");
      if (!apiKey || apiKey !== env.API_KEY) {
        return Response.json({ error: "unauthorized" }, { status: 401 });
      }

      const idsParam = url.searchParams.get("ids") || "";
      const ids = idsParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (ids.length === 0) {
        return Response.json({ opens: {} });
      }

      // Cap to 100 IDs per request
      const capped = ids.slice(0, 100);
      const placeholders = capped.map(() => "?").join(",");
      const rows = await env.DB.prepare(
        `SELECT tracking_id, opened_at, ip, user_agent FROM opens WHERE tracking_id IN (${placeholders}) ORDER BY opened_at ASC`
      )
        .bind(...capped)
        .all<{
          tracking_id: string;
          opened_at: string;
          ip: string | null;
          user_agent: string | null;
        }>();

      const opens: Record<
        string,
        { openedAt: string; ip: string | null; userAgent: string | null }[]
      > = {};
      for (const id of capped) {
        opens[id] = [];
      }
      for (const row of rows.results) {
        opens[row.tracking_id]?.push({
          openedAt: row.opened_at,
          ip: row.ip,
          userAgent: row.user_agent,
        });
      }

      return Response.json({ opens });
    }

    return new Response("Not found", { status: 404 });
  },
};
