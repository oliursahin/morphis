import { createSignal, onMount, For, Show } from "solid-js";
import { invoke } from "@tauri-apps/api/core";

interface GmailLabel {
  id: string;
  name: string;
  type?: string;
}

interface LabelPickerProps {
  mode: "apply-label" | "remove-label" | "move-to";
  threadId: string;
  onClose: () => void;
}

export default function LabelPicker(props: LabelPickerProps) {
  const [labels, setLabels] = createSignal<GmailLabel[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [query, setQuery] = createSignal("");
  const [selectedIndex, setSelectedIndex] = createSignal(0);

  const title = () => {
    switch (props.mode) {
      case "apply-label": return "Apply label";
      case "remove-label": return "Remove label";
      case "move-to": return "Move to";
    }
  };

  onMount(async () => {
    try {
      const result = await invoke<GmailLabel[]>("list_labels");
      // Only show user-created labels
      setLabels(result.filter((l) => l.type === "user"));
    } catch (e) {
      console.error("Failed to load labels:", e);
    } finally {
      setLoading(false);
    }
  });

  const filtered = () => {
    const q = query().toLowerCase();
    if (!q) return labels();
    return labels().filter((l) => l.name.toLowerCase().includes(q));
  };

  const handleSelect = async (label: GmailLabel) => {
    try {
      if (props.mode === "apply-label") {
        await invoke("modify_thread_labels", {
          threadId: props.threadId,
          addLabelIds: [label.id],
          removeLabelIds: [],
        });
      } else if (props.mode === "remove-label") {
        await invoke("modify_thread_labels", {
          threadId: props.threadId,
          addLabelIds: [],
          removeLabelIds: [label.id],
        });
      } else if (props.mode === "move-to") {
        await invoke("modify_thread_labels", {
          threadId: props.threadId,
          addLabelIds: [label.id],
          removeLabelIds: ["INBOX"],
        });
      }
    } catch (e) {
      console.error("Label operation failed:", e);
    }
    props.onClose();
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
      handleSelect(filtered()[selectedIndex()]);
    } else if (e.key === "Escape") {
      props.onClose();
    }
  };

  return (
    <div class="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={props.onClose}>
      <div class="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      <div
        class="relative w-full max-w-[400px] bg-white/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/30 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div class="flex items-center gap-3 px-4 py-3 border-b border-black/[0.06]">
          <span class="text-[12px] font-medium text-black/50">{title()}</span>
          <input
            type="text"
            value={query()}
            onInput={(e) => { setQuery(e.currentTarget.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            class="flex-1 bg-transparent text-[14px] text-black/80 outline-none placeholder:text-black/30"
            placeholder="Search labels..."
            autofocus
          />
        </div>
        <div class="max-h-[30vh] overflow-y-auto py-1">
          <Show when={!loading()} fallback={<div class="px-4 py-3 text-[13px] text-black/40">Loading labels...</div>}>
            <Show when={filtered().length > 0} fallback={<div class="px-4 py-3 text-[13px] text-black/40">No labels found</div>}>
              <For each={filtered()}>
                {(label, i) => (
                  <button
                    class={`w-full flex items-center px-4 py-2 text-left text-[13px] text-black/70 transition-colors ${
                      selectedIndex() === i() ? "bg-black/[0.04]" : "hover:bg-black/[0.03]"
                    }`}
                    onClick={() => handleSelect(label)}
                  >
                    {label.name}
                  </button>
                )}
              </For>
            </Show>
          </Show>
        </div>
      </div>
    </div>
  );
}
