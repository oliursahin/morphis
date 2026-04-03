import { createSignal, onMount } from "solid-js";
import { invoke } from "@tauri-apps/api/core";

export default function App() {
  const [status, setStatus] = createSignal<string | null>(null);

  onMount(async () => {
    try {
      const result = await invoke<string>("ping");
      setStatus(result);
    } catch (e) {
      setStatus(`Error: ${e}`);
    }
  });

  return (
    <div class="h-screen w-screen bg-zinc-950 text-zinc-100 flex items-center justify-center font-sans">
      <div class="text-center">
        <h1 class="text-2xl font-semibold tracking-tight">memphis</h1>
        <p class="mt-2 text-zinc-500 text-sm">
          {status() === null ? "connecting..." : status()}
        </p>
      </div>
    </div>
  );
}
