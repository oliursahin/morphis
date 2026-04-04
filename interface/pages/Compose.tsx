import { createSignal, Show } from "solid-js";

interface ComposeViewProps {
  onClose: () => void;
}

export default function ComposeView(props: ComposeViewProps) {
  const [to, setTo] = createSignal("");
  const [subject, setSubject] = createSignal("");
  const [body, setBody] = createSignal("");
  const [showCc, setShowCc] = createSignal(false);
  const [cc, setCc] = createSignal("");
  const [bcc, setBcc] = createSignal("");

  const handleSend = () => {
    props.onClose();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div class="h-full flex flex-col bg-white" onKeyDown={handleKeyDown}>
      {/* Toolbar */}
      <div class="flex items-center gap-2 px-20 pt-5 pb-2 flex-shrink-0">
        <button
          onClick={props.onClose}
          class="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 12L6 8l4-4" />
          </svg>
        </button>
        <span class="text-[13px] text-zinc-400">New Message</span>

        <div class="flex-1" />

        <span class="text-[11px] text-zinc-400 mr-2">⌘ Enter to send</span>
      </div>

      {/* Compose area */}
      <div class="flex-1 overflow-y-auto px-20">
        {/* To */}
        <div class="flex items-center gap-3 py-2">
          <label class="text-[13px] text-zinc-400 w-10">To</label>
          <input
            type="text"
            value={to()}
            onInput={(e) => setTo(e.currentTarget.value)}
            class="flex-1 bg-transparent text-[14px] text-zinc-800 outline-none placeholder:text-zinc-300"
            placeholder="recipient@example.com"
            autofocus
          />
          <button
            onClick={() => setShowCc(!showCc())}
            class="text-[12px] text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            Cc/Bcc
          </button>
        </div>

        <Show when={showCc()}>
          <div class="flex items-center gap-3 py-2">
            <label class="text-[13px] text-zinc-400 w-10">Cc</label>
            <input
              type="text"
              value={cc()}
              onInput={(e) => setCc(e.currentTarget.value)}
              class="flex-1 bg-transparent text-[14px] text-zinc-800 outline-none placeholder:text-zinc-300"
            />
          </div>
          <div class="flex items-center gap-3 py-2">
            <label class="text-[13px] text-zinc-400 w-10">Bcc</label>
            <input
              type="text"
              value={bcc()}
              onInput={(e) => setBcc(e.currentTarget.value)}
              class="flex-1 bg-transparent text-[14px] text-zinc-800 outline-none placeholder:text-zinc-300"
            />
          </div>
        </Show>

        {/* Subject */}
        <div class="py-2">
          <input
            type="text"
            value={subject()}
            onInput={(e) => setSubject(e.currentTarget.value)}
            class="w-full bg-transparent text-[20px] font-semibold text-zinc-900 outline-none placeholder:text-zinc-300"
            placeholder="Subject"
          />
        </div>

        {/* Body */}
        <textarea
          value={body()}
          onInput={(e) => setBody(e.currentTarget.value)}
          class="w-full min-h-[300px] mt-4 bg-transparent text-[14px] text-zinc-800 leading-[1.7] outline-none resize-none placeholder:text-zinc-300"
          placeholder="Write your message..."
        />
      </div>
    </div>
  );
}
