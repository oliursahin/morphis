import { createSignal, For } from "solid-js";

interface Command {
  id: string;
  label: string;
  shortcut?: string;
  section: string;
  icon?: string;
}

interface CommandBarProps {
  onClose: () => void;
  onCommand: (id: string) => void;
}

const COMMANDS: Command[] = [
  { id: "inbox", label: "Go to Inbox", shortcut: "G I", section: "Navigation", icon: "inbox" },
  { id: "sent", label: "Go to Sent", shortcut: "G S", section: "Navigation", icon: "send" },
  { id: "drafts", label: "Go to Drafts", shortcut: "G D", section: "Navigation", icon: "file" },
  { id: "all", label: "Go to All Mail", section: "Navigation", icon: "mail" },
  { id: "settings", label: "Go to Settings", section: "Navigation", icon: "settings" },
  { id: "compose", label: "Compose new email", shortcut: "C", section: "Actions", icon: "edit" },
  { id: "search", label: "Search emails", shortcut: "/", section: "Actions", icon: "search" },
  { id: "shortcuts", label: "Show keyboard shortcuts", shortcut: "?", section: "Help", icon: "help" },
];

function CommandIcon(props: { name: string }) {
  const icons: Record<string, () => any> = {
    inbox: () => (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
        <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
      </svg>
    ),
    send: () => (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
      </svg>
    ),
    file: () => (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
      </svg>
    ),
    mail: () => (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    settings: () => (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
    edit: () => (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
    search: () => (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    help: () => (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  };

  const Icon = icons[props.name];
  return Icon ? <Icon /> : null;
}

export default function CommandBar(props: CommandBarProps) {
  const [query, setQuery] = createSignal("");
  const [selectedIndex, setSelectedIndex] = createSignal(0);

  const filtered = () => {
    const q = query().toLowerCase();
    if (!q) return COMMANDS;
    return COMMANDS.filter((c) => c.label.toLowerCase().includes(q));
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered().length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered().length > 0) {
      e.preventDefault();
      props.onCommand(filtered()[selectedIndex()].id);
      props.onClose();
    } else if (e.key === "Escape") {
      props.onClose();
    }
  };

  const grouped = () => {
    const groups: { section: string; items: (Command & { globalIndex: number })[] }[] = [];
    let globalIndex = 0;
    const items = filtered();

    for (const item of items) {
      let group = groups.find((g) => g.section === item.section);
      if (!group) {
        group = { section: item.section, items: [] };
        groups.push(group);
      }
      group.items.push({ ...item, globalIndex });
      globalIndex++;
    }
    return groups;
  };

  return (
    <div class="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={props.onClose}>
      {/* Backdrop */}
      <div class="absolute inset-0 bg-white/60 backdrop-blur-md" />

      {/* Glassmorphic panel */}
      <div
        class="relative w-full max-w-[480px] bg-white/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/30 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div class="flex items-center gap-3 px-4 py-3 border-b border-black/[0.06]">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="text-black/30 flex-shrink-0"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={query()}
            onInput={(e) => {
              setQuery(e.currentTarget.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            class="flex-1 bg-transparent text-[14px] text-black/80 outline-none placeholder:text-black/30"
            placeholder="Type a command or search..."
            autofocus
          />
        </div>

        {/* Commands list */}
        <div class="max-h-[40vh] overflow-y-auto py-1">
          <For each={grouped()}>
            {(group) => (
              <div>
                <div class="px-4 pt-3 pb-1">
                  <span class="text-[11px] font-medium text-black/35 tracking-wide">
                    {group.section}
                  </span>
                </div>
                <For each={group.items}>
                  {(cmd) => (
                    <button
                      class={`w-full flex items-center justify-between px-4 py-2 text-left transition-colors ${
                        selectedIndex() === cmd.globalIndex
                          ? "bg-black/[0.04]"
                          : "hover:bg-black/[0.03]"
                      }`}
                      onClick={() => {
                        props.onCommand(cmd.id);
                        props.onClose();
                      }}
                    >
                      <div class="flex items-center gap-3">
                        <span class="text-black/40">
                          {cmd.icon && <CommandIcon name={cmd.icon} />}
                        </span>
                        <span class="text-[13px] text-black/70">{cmd.label}</span>
                      </div>
                      {cmd.shortcut && (
                        <kbd class="text-[10px] text-black/30 bg-black/[0.04] border border-black/[0.06] px-1.5 py-0.5 rounded-md font-mono">
                          {cmd.shortcut}
                        </kbd>
                      )}
                    </button>
                  )}
                </For>
              </div>
            )}
          </For>
        </div>
      </div>
    </div>
  );
}
