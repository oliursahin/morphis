import { For, Show } from "solid-js";

export interface ThreadRow {
  id: string;
  subject: string;
  snippet: string;
  fromName: string;
  fromEmail: string;
  date: string;
  isRead: boolean;
  messageCount: number;
}

export const MOCK_THREADS: ThreadRow[] = [
  {
    id: "1", fromName: "Vercel", fromEmail: "notifications@vercel.com",
    subject: "Failed preview deployment on team 'Oliur Sahin's projects'",
    snippet: "", date: "5:58 PM", isRead: false, messageCount: 1,
  },
  {
    id: "2", fromName: "Vercel", fromEmail: "notifications@vercel.com",
    subject: "3 domains need configuration on team 'Oliur Sahin's projects'",
    snippet: "", date: "12:35 PM", isRead: true, messageCount: 1,
  },
  {
    id: "3", fromName: "Farza from Farza's Newsletter", fromEmail: "farza@newsletter.com",
    subject: "me and skrillex at the club crying to scatman drinking lychee tea",
    snippet: "", date: "1:03 AM", isRead: true, messageCount: 1,
  },
  {
    id: "4", fromName: "Sieoud Rizwan", fromEmail: "sieoud@example.com",
    subject: "Announcing Cline Kanban for multi-agent orchestration",
    snippet: "", date: "12:02 AM", isRead: true, messageCount: 1,
  },
  {
    id: "5", fromName: "me .. me", fromEmail: "me@example.com",
    subject: "can't access billing page",
    snippet: "", date: "Apr 2", isRead: true, messageCount: 6,
  },
  {
    id: "6", fromName: "Dan Koe", fromEmail: "dan@dankoe.com",
    subject: "I'm begging you to write more essays",
    snippet: "", date: "Apr 2", isRead: true, messageCount: 1,
  },
  {
    id: "7", fromName: "a]16c speedrun", fromEmail: "speedrun@example.com",
    subject: "Liquid Death's Mike Cessario on Building a Brand That Can't Be Copied",
    snippet: "", date: "Apr 2", isRead: true, messageCount: 1,
  },
  {
    id: "8", fromName: "Paul Sangiki-Ferrierie", fromEmail: "paul@example.com",
    subject: "cubic March update: #1 on Code Review Benchmark, faster reviews & Confluence/Notion",
    snippet: "", date: "Apr 2", isRead: true, messageCount: 1,
  },
  {
    id: "9", fromName: "Google", fromEmail: "no-reply@google.com",
    subject: "Security alert",
    snippet: "", date: "Apr 2", isRead: true, messageCount: 3,
  },
  {
    id: "10", fromName: "Google", fromEmail: "no-reply@google.com",
    subject: "Security alert for sahin@zestral.ai",
    snippet: "", date: "Apr 2", isRead: true, messageCount: 1,
  },
  {
    id: "11", fromName: "Sajda Kabir", fromEmail: "sajda@example.com",
    subject: "https://github.com/InisForge/InisForge/security",
    snippet: "", date: "Apr 2", isRead: true, messageCount: 1,
  },
  {
    id: "12", fromName: "Superhuman", fromEmail: "team@superhuman.com",
    subject: "Meet Superhuman Go, the shortcut to done",
    snippet: "", date: "Apr 1", isRead: true, messageCount: 1,
  },
  {
    id: "13", fromName: "Brian from Small Bets", fromEmail: "brian@smallbets.com",
    subject: "The IRS basically rewards angel investors... if you know this rule",
    snippet: "", date: "Apr 1", isRead: true, messageCount: 1,
  },
  {
    id: "14", fromName: "Sajda Kabir", fromEmail: "sajda@example.com",
    subject: ".md file stuck",
    snippet: "", date: "Apr 1", isRead: true, messageCount: 1,
  },
];

function groupByDate(threads: ThreadRow[]): { label: string; threads: ThreadRow[] }[] {
  const today: ThreadRow[] = [];
  const yesterday: ThreadRow[] = [];
  const lastWeek: ThreadRow[] = [];
  const older: ThreadRow[] = [];

  for (const t of threads) {
    const d = t.date.toLowerCase();
    if (d.includes("pm") || d.includes("am")) {
      today.push(t);
    } else if (d === "apr 2") {
      yesterday.push(t);
    } else if (d === "apr 1") {
      lastWeek.push(t);
    } else {
      older.push(t);
    }
  }

  const groups: { label: string; threads: ThreadRow[] }[] = [];
  if (today.length) groups.push({ label: "Today", threads: today });
  if (yesterday.length) groups.push({ label: "Yesterday", threads: yesterday });
  if (lastWeek.length) groups.push({ label: "Last 7 days", threads: lastWeek });
  if (older.length) groups.push({ label: "Older", threads: older });
  return groups;
}

interface InboxProps {
  onOpenThread: (thread: { id: string; subject: string }) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function Inbox(props: InboxProps) {
  const groups = () => groupByDate(MOCK_THREADS);

  return (
    <div class="h-full overflow-y-auto pt-3">
      <For each={groups()}>
        {(group) => (
          <div>
            <For each={group.threads}>
              {(thread) => (
                <div
                  class={`group flex items-center gap-3 px-20 py-2.5 cursor-pointer ${
                    props.selectedId === thread.id
                      ? "bg-zinc-100/60"
                      : ""
                  }`}
                  onClick={() => {
                    props.onSelect(thread.id);
                    props.onOpenThread({ id: thread.id, subject: thread.subject });
                  }}
                >
                  {/* Sender */}
                  <div class="w-40 flex-shrink-0 truncate">
                    <span class={`text-[13px] ${!thread.isRead ? "font-semibold text-zinc-900" : "text-zinc-500"}`}>
                      {thread.fromName}
                    </span>
                    <Show when={thread.messageCount > 1}>
                      <span class="text-[11px] text-zinc-400 ml-1.5">{thread.messageCount}</span>
                    </Show>
                  </div>

                  {/* Subject */}
                  <div class="flex-1 min-w-0 truncate">
                    <span class={`text-[13px] ${!thread.isRead ? "font-medium text-zinc-800" : "text-zinc-400"}`}>
                      {thread.subject}
                    </span>
                  </div>

                  {/* Date — hidden on hover */}
                  <div class="text-[12px] text-zinc-400 flex-shrink-0 tabular-nums pl-3 group-hover:hidden">
                    {thread.date}
                  </div>

                  {/* Hover actions */}
                  <div class="hidden group-hover:flex items-center gap-0.5 flex-shrink-0 pl-3" onClick={(e) => e.stopPropagation()}>
                    <button class="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors" title="Star (s)">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M8 1.5l1.85 3.75L14 5.9l-3 2.93.71 4.12L8 10.88l-3.71 2.07.71-4.12-3-2.93 4.15-.65z" />
                      </svg>
                    </button>
                    <button class="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors" title="Done (e)">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3.5 8l3 3 6-6" />
                      </svg>
                    </button>
                    <button class="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors" title="Trash (d)">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M2 4h12M5.33 4V2.67a1.33 1.33 0 011.34-1.34h2.66a1.33 1.33 0 011.34 1.34V4M12.67 4v9.33a1.33 1.33 0 01-1.34 1.34H4.67a1.33 1.33 0 01-1.34-1.34V4" />
                      </svg>
                    </button>
                    <button class="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors" title="Unread (u)">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="2" y="3" width="12" height="10" rx="1.5" />
                        <path d="M2 4.5l6 4 6-4" />
                      </svg>
                    </button>
                    <button class="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors" title="Remind (h)">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="8" cy="8" r="6" />
                        <path d="M8 5v3l2 2" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </For>
          </div>
        )}
      </For>
    </div>
  );
}
