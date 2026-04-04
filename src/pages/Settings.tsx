import { createSignal, For, Show } from "solid-js";

interface SettingsProps {
  onBack: () => void;
}

type Section = "general" | "accounts" | "signature" | "snippets" | "shortcuts" | "appearance" | "notifications";

const NAV: { id: Section; label: string }[] = [
  { id: "general", label: "General" },
  { id: "accounts", label: "Accounts" },
  { id: "signature", label: "Signature" },
  { id: "snippets", label: "Snippets" },
  { id: "shortcuts", label: "Shortcuts" },
  { id: "appearance", label: "Appearance" },
  { id: "notifications", label: "Notifications" },
];

export default function Settings(props: SettingsProps) {
  const [section, setSection] = createSignal<Section>("general");

  return (
    <div class="h-full flex flex-col">
      {/* Toolbar */}
      <div class="flex items-center gap-3 px-20 pt-5 pb-4">
        <button onClick={props.onBack} class="text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <h1 class="text-[16px] font-medium text-zinc-800">Settings</h1>
        <span class="text-[12px] text-zinc-400 ml-auto">Esc to go back</span>
      </div>

      {/* Body */}
      <div class="flex-1 flex overflow-hidden px-20 pb-8">
        {/* Left nav */}
        <nav class="w-44 flex-shrink-0 pr-6 space-y-0.5">
          <For each={NAV}>
            {(item) => (
              <button
                onClick={() => setSection(item.id)}
                class={`w-full text-left px-3 py-1.5 rounded-md text-[13px] transition-colors cursor-pointer ${
                  section() === item.id
                    ? "bg-zinc-100 text-zinc-900 font-medium"
                    : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                {item.label}
              </button>
            )}
          </For>
        </nav>

        {/* Content */}
        <div class="flex-1 min-w-0 overflow-y-auto">
          <Show when={section() === "general"}>
            <GeneralSection />
          </Show>
          <Show when={section() === "accounts"}>
            <AccountsSection />
          </Show>
          <Show when={section() === "signature"}>
            <SignatureSection />
          </Show>
          <Show when={section() === "snippets"}>
            <SnippetsSection />
          </Show>
          <Show when={section() === "shortcuts"}>
            <ShortcutsSection />
          </Show>
          <Show when={section() === "appearance"}>
            <AppearanceSection />
          </Show>
          <Show when={section() === "notifications"}>
            <NotificationsSection />
          </Show>
        </div>
      </div>
    </div>
  );
}

/* ── Section components ── */

function SectionTitle(props: { title: string; description?: string }) {
  return (
    <div class="mb-5">
      <h2 class="text-[15px] font-medium text-zinc-800">{props.title}</h2>
      <Show when={props.description}>
        <p class="text-[13px] text-zinc-400 mt-0.5">{props.description}</p>
      </Show>
    </div>
  );
}

function SettingRow(props: { label: string; description?: string; children: any }) {
  return (
    <div class="flex items-center justify-between py-3 border-b border-zinc-100">
      <div class="min-w-0 mr-4">
        <div class="text-[13px] text-zinc-700">{props.label}</div>
        <Show when={props.description}>
          <div class="text-[12px] text-zinc-400 mt-0.5">{props.description}</div>
        </Show>
      </div>
      <div class="flex-shrink-0">{props.children}</div>
    </div>
  );
}

function Toggle(props: { checked: boolean; onChange?: (v: boolean) => void }) {
  return (
    <button
      onClick={() => props.onChange?.(!props.checked)}
      class={`w-8 h-[18px] rounded-full transition-colors cursor-pointer ${
        props.checked ? "bg-zinc-800" : "bg-zinc-200"
      }`}
    >
      <div
        class={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform mx-0.5 ${
          props.checked ? "translate-x-3.5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function GeneralSection() {
  const [autoAdvance, setAutoAdvance] = createSignal(true);
  const [undoSend, setUndoSend] = createSignal(true);
  const [undoDelay, setUndoDelay] = createSignal("5");

  return (
    <div>
      <SectionTitle title="General" description="Core behavior and email defaults" />
      <SettingRow label="Auto-advance" description="Move to next conversation after archiving">
        <Toggle checked={autoAdvance()} onChange={setAutoAdvance} />
      </SettingRow>
      <SettingRow label="Undo send" description="Allow cancelling sent emails">
        <Toggle checked={undoSend()} onChange={setUndoSend} />
      </SettingRow>
      <Show when={undoSend()}>
        <SettingRow label="Undo send delay" description="Seconds to cancel after sending">
          <select
            value={undoDelay()}
            onChange={(e) => setUndoDelay(e.currentTarget.value)}
            class="text-[13px] text-zinc-700 bg-white border border-zinc-200 rounded-md px-2 py-1 outline-none"
          >
            <option value="5">5s</option>
            <option value="10">10s</option>
            <option value="30">30s</option>
          </select>
        </SettingRow>
      </Show>
      <SettingRow label="Default send behavior" description="Send with Enter or Cmd+Enter">
        <select class="text-[13px] text-zinc-700 bg-white border border-zinc-200 rounded-md px-2 py-1 outline-none">
          <option>⌘ Enter</option>
          <option>Enter</option>
        </select>
      </SettingRow>
    </div>
  );
}

function AccountsSection() {
  return (
    <div>
      <SectionTitle title="Accounts" description="Connected email accounts" />
      <div class="border border-zinc-200 rounded-lg p-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-[12px] font-medium text-zinc-500">G</div>
          <div>
            <div class="text-[13px] text-zinc-700 font-medium">sahin@zestral.ai</div>
            <div class="text-[12px] text-zinc-400">Google · Connected</div>
          </div>
        </div>
        <button class="text-[12px] text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer">Disconnect</button>
      </div>
      <button class="mt-4 text-[13px] text-zinc-500 hover:text-zinc-700 transition-colors cursor-pointer">
        + Add account
      </button>
    </div>
  );
}

function SignatureSection() {
  const [signatures, setSignatures] = createSignal([
    { id: "1", name: "Default", body: "Best,\nOliur Sahin", isDefault: true },
  ]);
  const [editing, setEditing] = createSignal<string | null>(null);
  const [autoInsert, setAutoInsert] = createSignal(true);

  const addSignature = () => {
    const id = String(Date.now());
    setSignatures((prev) => [...prev, { id, name: "", body: "", isDefault: false }]);
    setEditing(id);
  };

  const removeSignature = (id: string) => {
    setSignatures((prev) => prev.filter((s) => s.id !== id));
  };

  const updateSignature = (id: string, field: string, value: string | boolean) => {
    setSignatures((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s));
  };

  const setDefault = (id: string) => {
    setSignatures((prev) => prev.map((s) => ({ ...s, isDefault: s.id === id })));
  };

  return (
    <div>
      <SectionTitle title="Signature" description="Email signatures appended to outgoing messages" />
      <SettingRow label="Auto-insert signature" description="Automatically add signature to new emails and replies">
        <Toggle checked={autoInsert()} onChange={setAutoInsert} />
      </SettingRow>

      <div class="mt-4 space-y-2">
        <For each={signatures()}>
          {(sig) => (
            <div class={`border rounded-lg p-3 ${sig.isDefault ? "border-zinc-300" : "border-zinc-200"}`}>
              <Show when={editing() === sig.id} fallback={
                <div class="flex items-start justify-between">
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2">
                      <span class="text-[13px] font-medium text-zinc-700">{sig.name || "Untitled"}</span>
                      <Show when={sig.isDefault}>
                        <span class="text-[10px] text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded">Default</span>
                      </Show>
                    </div>
                    <pre class="text-[12px] text-zinc-400 mt-1 font-sans whitespace-pre-wrap">{sig.body}</pre>
                  </div>
                  <div class="flex items-center gap-2 flex-shrink-0 ml-3">
                    <Show when={!sig.isDefault}>
                      <button
                        onClick={() => setDefault(sig.id)}
                        class="text-[12px] text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
                      >
                        Set default
                      </button>
                    </Show>
                    <button
                      onClick={() => setEditing(sig.id)}
                      class="text-[12px] text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => removeSignature(sig.id)}
                      class="text-[12px] text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              }>
                <div class="space-y-2">
                  <input
                    value={sig.name}
                    onInput={(e) => updateSignature(sig.id, "name", e.currentTarget.value)}
                    placeholder="Signature name"
                    class="w-full text-[13px] text-zinc-700 bg-white border border-zinc-200 rounded-md px-2 py-1 outline-none focus:border-zinc-400"
                  />
                  <textarea
                    value={sig.body}
                    onInput={(e) => updateSignature(sig.id, "body", e.currentTarget.value)}
                    placeholder="Signature content…"
                    rows={4}
                    class="w-full text-[13px] text-zinc-700 bg-white border border-zinc-200 rounded-md px-2 py-1.5 outline-none focus:border-zinc-400 resize-none"
                  />
                  <button
                    onClick={() => setEditing(null)}
                    class="text-[12px] text-zinc-500 hover:text-zinc-700 transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </Show>
            </div>
          )}
        </For>
      </div>
      <button
        onClick={addSignature}
        class="mt-3 text-[13px] text-zinc-500 hover:text-zinc-700 transition-colors cursor-pointer"
      >
        + Add signature
      </button>
    </div>
  );
}

function SnippetsSection() {
  const [snippets, setSnippets] = createSignal([
    { id: "1", name: "Thanks", shortcut: ";thanks", body: "Thanks for getting back to me. I really appreciate it!" },
    { id: "2", name: "Follow up", shortcut: ";followup", body: "Just following up on this — let me know if you need anything else from my end." },
    { id: "3", name: "Intro", shortcut: ";intro", body: "I'd like to introduce you to {name}. I think you'd really enjoy connecting." },
  ]);
  const [editing, setEditing] = createSignal<string | null>(null);

  const removeSnippet = (id: string) => {
    setSnippets((prev) => prev.filter((s) => s.id !== id));
  };

  const addSnippet = () => {
    const id = String(Date.now());
    setSnippets((prev) => [...prev, { id, name: "", shortcut: ";", body: "" }]);
    setEditing(id);
  };

  const updateSnippet = (id: string, field: string, value: string) => {
    setSnippets((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s));
  };

  return (
    <div>
      <SectionTitle title="Snippets" description="Text shortcuts you can insert while composing. Type the shortcut to expand." />
      <div class="space-y-2">
        <For each={snippets()}>
          {(snippet) => (
            <div class="border border-zinc-200 rounded-lg p-3">
              <Show when={editing() === snippet.id} fallback={
                <div class="flex items-start justify-between">
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2">
                      <span class="text-[13px] font-medium text-zinc-700">{snippet.name || "Untitled"}</span>
                      <kbd class="text-[11px] text-zinc-400 bg-zinc-50 border border-zinc-200 px-1.5 py-0.5 rounded font-mono">
                        {snippet.shortcut}
                      </kbd>
                    </div>
                    <p class="text-[12px] text-zinc-400 mt-1 line-clamp-2">{snippet.body}</p>
                  </div>
                  <div class="flex items-center gap-2 flex-shrink-0 ml-3">
                    <button
                      onClick={() => setEditing(snippet.id)}
                      class="text-[12px] text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => removeSnippet(snippet.id)}
                      class="text-[12px] text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              }>
                <div class="space-y-2">
                  <div class="flex gap-2">
                    <input
                      value={snippet.name}
                      onInput={(e) => updateSnippet(snippet.id, "name", e.currentTarget.value)}
                      placeholder="Name"
                      class="flex-1 text-[13px] text-zinc-700 bg-white border border-zinc-200 rounded-md px-2 py-1 outline-none focus:border-zinc-400"
                    />
                    <input
                      value={snippet.shortcut}
                      onInput={(e) => updateSnippet(snippet.id, "shortcut", e.currentTarget.value)}
                      placeholder=";shortcut"
                      class="w-28 text-[13px] text-zinc-700 bg-white border border-zinc-200 rounded-md px-2 py-1 outline-none focus:border-zinc-400 font-mono"
                    />
                  </div>
                  <textarea
                    value={snippet.body}
                    onInput={(e) => updateSnippet(snippet.id, "body", e.currentTarget.value)}
                    placeholder="Snippet body text…"
                    rows={3}
                    class="w-full text-[13px] text-zinc-700 bg-white border border-zinc-200 rounded-md px-2 py-1.5 outline-none focus:border-zinc-400 resize-none"
                  />
                  <button
                    onClick={() => setEditing(null)}
                    class="text-[12px] text-zinc-500 hover:text-zinc-700 transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </Show>
            </div>
          )}
        </For>
      </div>
      <button
        onClick={addSnippet}
        class="mt-3 text-[13px] text-zinc-500 hover:text-zinc-700 transition-colors cursor-pointer"
      >
        + Add snippet
      </button>
    </div>
  );
}

function ShortcutsSection() {
  const shortcuts = [
    { keys: "J / K", action: "Navigate up / down" },
    { keys: "Enter", action: "Open conversation" },
    { keys: "Escape", action: "Go back" },
    { keys: "C", action: "Compose new email" },
    { keys: "R", action: "Reply" },
    { keys: "E", action: "Archive" },
    { keys: "/", action: "Search" },
    { keys: "⌘ K", action: "Command bar" },
    { keys: "Tab", action: "Next split" },
    { keys: "⇧ Tab", action: "Previous split" },
    { keys: "H", action: "Set reminder" },
    { keys: "?", action: "Show all shortcuts" },
  ];

  return (
    <div>
      <SectionTitle title="Keyboard Shortcuts" description="All available keyboard shortcuts" />
      <div class="space-y-0">
        <For each={shortcuts}>
          {(s) => (
            <div class="flex items-center justify-between py-2.5 border-b border-zinc-100">
              <span class="text-[13px] text-zinc-700">{s.action}</span>
              <kbd class="text-[11px] text-zinc-500 bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded font-mono">
                {s.keys}
              </kbd>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}

function AppearanceSection() {
  const [theme, setTheme] = createSignal("light");

  return (
    <div>
      <SectionTitle title="Appearance" description="Visual preferences" />
      <SettingRow label="Theme">
        <select
          value={theme()}
          onChange={(e) => setTheme(e.currentTarget.value)}
          class="text-[13px] text-zinc-700 bg-white border border-zinc-200 rounded-md px-2 py-1 outline-none"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">System</option>
        </select>
      </SettingRow>
      <SettingRow label="Font size">
        <select class="text-[13px] text-zinc-700 bg-white border border-zinc-200 rounded-md px-2 py-1 outline-none">
          <option>Small</option>
          <option selected>Default</option>
          <option>Large</option>
        </select>
      </SettingRow>
    </div>
  );
}

function NotificationsSection() {
  const [desktop, setDesktop] = createSignal(true);
  const [sound, setSound] = createSignal(false);
  const [badge, setBadge] = createSignal(true);
  const [importantOnly, setImportantOnly] = createSignal(false);
  const [threadReplies, setThreadReplies] = createSignal(true);
  const [snooze, setSnooze] = createSignal(false);
  const [snoozeSchedule, setSnoozeSchedule] = createSignal("off");

  return (
    <div>
      <SectionTitle title="Notifications" description="How Memphis alerts you" />
      <SettingRow label="Desktop notifications" description="Show system notifications for new mail">
        <Toggle checked={desktop()} onChange={setDesktop} />
      </SettingRow>
      <SettingRow label="Sound" description="Play a sound on new mail">
        <Toggle checked={sound()} onChange={setSound} />
      </SettingRow>
      <SettingRow label="Dock badge" description="Show unread count on app icon">
        <Toggle checked={badge()} onChange={setBadge} />
      </SettingRow>
      <SettingRow label="Important only" description="Only notify for emails classified as important">
        <Toggle checked={importantOnly()} onChange={setImportantOnly} />
      </SettingRow>
      <SettingRow label="Thread replies" description="Notify when someone replies to a thread you're in">
        <Toggle checked={threadReplies()} onChange={setThreadReplies} />
      </SettingRow>
      <SettingRow label="Do Not Disturb" description="Pause all notifications on a schedule">
        <Toggle checked={snooze()} onChange={setSnooze} />
      </SettingRow>
      <Show when={snooze()}>
        <SettingRow label="DND schedule" description="Automatically silence during these hours">
          <select
            value={snoozeSchedule()}
            onChange={(e) => setSnoozeSchedule(e.currentTarget.value)}
            class="text-[13px] text-zinc-700 bg-white border border-zinc-200 rounded-md px-2 py-1 outline-none"
          >
            <option value="off">Off</option>
            <option value="evening">6 PM – 8 AM</option>
            <option value="night">10 PM – 7 AM</option>
            <option value="weekend">Weekends</option>
            <option value="custom">Custom</option>
          </select>
        </SettingRow>
      </Show>
    </div>
  );
}
