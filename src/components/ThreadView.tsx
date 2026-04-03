import { createSignal, For, Show } from "solid-js";

interface Message {
  id: string;
  fromName: string;
  fromEmail: string;
  to: string;
  date: string;
  body: string;
  isCollapsed?: boolean;
}

interface ThreadViewProps {
  threadId: string;
  subject: string;
  onBack: () => void;
  replyOpen?: boolean;
  onReplyOpen?: () => void;
  onReplyClose?: () => void;
}

const MOCK_MESSAGES: Record<string, Message[]> = {
  "1": [
    {
      id: "m1", fromName: "Vercel", fromEmail: "notifications@vercel.com",
      to: "oliursahin@gmail.com", date: "Today, 5:58 PM",
      body: `<p>Hey Oliur,</p>
<p>A deployment on your team <strong>"Oliur Sahin's projects"</strong> has failed.</p>
<p><strong>Project:</strong> march-app<br/><strong>Branch:</strong> preview<br/><strong>Commit:</strong> fix: update auth middleware</p>
<p>The build failed with exit code 1. Check the deployment logs for more details.</p>
<p style="margin-top:16px"><a href="#" style="color:#3b82f6">View Deployment</a></p>`,
    },
  ],
  "5": [
    {
      id: "m1", fromName: "me", fromEmail: "oliursahin@gmail.com",
      to: "support@example.com", date: "Apr 1, 3:22 PM",
      body: "<p>Hi, I can't access the billing page. It just shows a blank screen after logging in.</p>",
      isCollapsed: true,
    },
    {
      id: "m2", fromName: "Support", fromEmail: "support@example.com",
      to: "oliursahin@gmail.com", date: "Apr 1, 4:15 PM",
      body: "<p>Thanks for reaching out. Could you try clearing your browser cache and trying again?</p>",
      isCollapsed: true,
    },
    {
      id: "m3", fromName: "me", fromEmail: "oliursahin@gmail.com",
      to: "support@example.com", date: "Apr 1, 5:00 PM",
      body: "<p>Tried that, still not working. I'm on Chrome 124 on macOS.</p>",
      isCollapsed: true,
    },
    {
      id: "m4", fromName: "Support", fromEmail: "support@example.com",
      to: "oliursahin@gmail.com", date: "Apr 2, 9:30 AM",
      body: "<p>We've identified the issue — it was a permissions bug on our end affecting a subset of accounts. It should be fixed now. Can you try again?</p>",
      isCollapsed: true,
    },
    {
      id: "m5", fromName: "me", fromEmail: "oliursahin@gmail.com",
      to: "support@example.com", date: "Apr 2, 10:45 AM",
      body: "<p>Works now, thank you!</p>",
      isCollapsed: true,
    },
    {
      id: "m6", fromName: "Support", fromEmail: "support@example.com",
      to: "oliursahin@gmail.com", date: "Apr 2, 11:00 AM",
      body: `<p>Glad to hear it's working! Let us know if you run into anything else.</p>
<p>Best,<br/>Support Team</p>`,
    },
  ],
  "9": [
    {
      id: "m1", fromName: "Google", fromEmail: "no-reply@accounts.google.com",
      to: "oliursahin@gmail.com", date: "Apr 1, 2:00 PM",
      body: "<p>A new sign-in was detected on your Google account from a new device.</p><p><strong>Device:</strong> MacBook Pro<br/><strong>Location:</strong> Toronto, Canada</p><p>If this was you, you can ignore this message.</p>",
      isCollapsed: true,
    },
    {
      id: "m2", fromName: "Google", fromEmail: "no-reply@accounts.google.com",
      to: "oliursahin@gmail.com", date: "Apr 1, 8:00 PM",
      body: "<p>Your recovery phone number was recently confirmed.</p>",
      isCollapsed: true,
    },
    {
      id: "m3", fromName: "Google", fromEmail: "no-reply@accounts.google.com",
      to: "oliursahin@gmail.com", date: "Apr 2, 10:00 AM",
      body: `<p><strong>Security alert</strong></p>
<p>We noticed a new sign-in to your Google Account on a Windows device. If this was you, you don't need to do anything. If not, we'll help you secure your account.</p>
<p style="margin-top:12px"><a href="#" style="color:#3b82f6">Check activity</a></p>`,
    },
  ],
};

function getMessages(threadId: string): Message[] {
  return MOCK_MESSAGES[threadId] ?? [
    {
      id: "default", fromName: "Sender", fromEmail: "sender@example.com",
      to: "oliursahin@gmail.com", date: "Today",
      body: "<p>This is a sample email message. The thread view is working.</p>",
    },
  ];
}


function PrintIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 6V2h8v4" />
      <rect x="2" y="6" width="12" height="6" rx="1" />
      <path d="M4 12v2h8v-2" />
    </svg>
  );
}

function UnreadIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="3" width="12" height="10" rx="1.5" />
    </svg>
  );
}

function LabelIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2 4a1 1 0 011-1h4.586a1 1 0 01.707.293l5.414 5.414a1 1 0 010 1.414l-3.586 3.586a1 1 0 01-1.414 0L3.293 8.293A1 1 0 013 7.586V4z" />
      <circle cx="5.5" cy="5.5" r="1" fill="currentColor" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="3" cy="8" r="1" fill="currentColor" />
      <circle cx="8" cy="8" r="1" fill="currentColor" />
      <circle cx="13" cy="8" r="1" fill="currentColor" />
    </svg>
  );
}

export default function ThreadView(props: ThreadViewProps) {
  const messages = () => getMessages(props.threadId);
  const [replyBody, setReplyBody] = createSignal("");
  const lastMsg = () => messages()[messages().length - 1];

  return (
    <div class="h-full flex flex-col bg-white">
      {/* Scrollable content */}
      <div class="flex-1 overflow-y-auto px-20">
        {/* Actions row — back aligned with split tabs */}
        <div class="flex items-center mb-4">
          <button
            onClick={props.onBack}
            class="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10 12L6 8l4-4" />
            </svg>
          </button>
          <div class="flex-1" />
          <div class="flex items-center gap-1">
            <button class="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors" title="Print">
              <PrintIcon />
            </button>
            <button class="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors" title="Mark as unread">
              <UnreadIcon />
            </button>
            <button class="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors" title="Add label">
              <LabelIcon />
            </button>
            <button class="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors" title="More (spam, report)">
              <MoreIcon />
            </button>
          </div>
        </div>

        {/* Subject */}
        <h1 class="text-[20px] font-semibold text-zinc-900 leading-tight">
          {props.subject}
        </h1>

        <div>
          {/* Guide hint */}
          <div class="mt-2 mb-6 flex items-center gap-3 opacity-60">
            <span class="text-[12px] text-zinc-400">
              Hit <kbd class="px-1 py-0.5 rounded bg-zinc-100 text-[11px] font-mono text-zinc-500">R</kbd> to reply
            </span>
            <span class="text-[12px] text-zinc-400">
              <kbd class="px-1 py-0.5 rounded bg-zinc-100 text-[11px] font-mono text-zinc-500">E</kbd> archive
            </span>
            <span class="text-[12px] text-zinc-400">
              <kbd class="px-1 py-0.5 rounded bg-zinc-100 text-[11px] font-mono text-zinc-500">Esc</kbd> back
            </span>
          </div>

          {/* Messages */}
          <div class="space-y-5">
            <For each={messages()}>
              {(msg) => (
                <MessageBubble message={msg} />
              )}
            </For>
          </div>

          {/* Inline reply */}
          <Show when={props.replyOpen}>
            <div class="mt-5 border-l-2 border-zinc-300 pl-5">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[12px] text-zinc-400">To: {lastMsg()?.fromName}</span>
                <span class="text-[12px] text-zinc-400 ml-auto">&lt;{lastMsg()?.fromEmail}&gt;</span>
              </div>
              <textarea
                ref={(el) => setTimeout(() => el.focus(), 0)}
                value={replyBody()}
                onInput={(e) => setReplyBody(e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    e.stopPropagation();
                    props.onReplyClose?.();
                  }
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                    e.preventDefault();
                    setReplyBody("");
                    props.onReplyClose?.();
                  }
                }}
                placeholder="Write your reply..."
                class="w-full min-h-[120px] text-[14px] text-zinc-800 leading-[1.7] bg-transparent resize-none outline-none placeholder:text-zinc-300"
              />
              <div class="flex items-center gap-3 mt-2 mb-2">
                <span class="text-[11px] text-zinc-400">⌘ Enter to send</span>
                <span class="text-[11px] text-zinc-400">Esc to discard</span>
              </div>
            </div>
          </Show>
        </div>

        <div class="h-8" />
      </div>
    </div>
  );
}

function MessageBubble(props: { message: Message }) {
  const msg = () => props.message;

  return (
    <Show when={!msg().isCollapsed} fallback={
      <div class="cursor-pointer hover:bg-zinc-50 rounded-lg py-2 px-1 transition-colors">
        <div class="flex items-center gap-2">
          <span class="text-[13px] font-semibold text-zinc-700 flex-shrink-0">{msg().fromName}</span>
          <span class="text-[12px] text-zinc-400 truncate flex-1">{msg().body.replace(/<[^>]*>/g, "").slice(0, 80)}</span>
          <span class="text-[12px] text-zinc-400 flex-shrink-0">{msg().date}</span>
        </div>
      </div>
    }>
      <div>
        {/* Sender + date on same line */}
        <div class="flex items-center gap-2">
          <span class="text-[14px] font-semibold text-zinc-900">{msg().fromName}</span>
          <div class="flex-1" />
          <span class="text-[12px] text-zinc-400">{msg().date}</span>
        </div>
        {/* To line */}
        <div class="mt-0.5">
          <span class="text-[12px] text-zinc-400">
            {msg().to === "oliursahin@gmail.com" ? "Me" : msg().fromName} to {msg().to === "oliursahin@gmail.com" ? "me" : msg().to}
          </span>
        </div>

        {/* Body — left border indicator */}
        <div class="mt-4 border-l-2 border-zinc-200 pl-5">
          <div
            class="text-[14px] text-zinc-800 leading-[1.7] [&_a]:text-blue-500 [&_a]:underline [&_p]:mb-3 [&_p:last-child]:mb-0"
            innerHTML={msg().body}
          />
        </div>
      </div>
    </Show>
  );
}
