import { createSignal, onMount, onCleanup, For, Show, createMemo, createEffect, type Accessor, type Setter } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

export interface CalendarEventDto {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  location: string | null;
  description: string | null;
  calendarName: string | null;
  color: string | null;
  organizerEmail: string | null;
  attendees: string[] | null;
  isAllDay: boolean;
}

const HOUR_HEIGHT = 56;
const START_HOUR = 0;
const END_HOUR = 24;
const TOTAL_HOURS = END_HOUR - START_HOUR;

function formatHour(hour: number): string {
  if (hour === 0 || hour === 24) return "12AM";
  if (hour === 12) return "12PM";
  if (hour < 12) return `${hour}AM`;
  return `${hour - 12}PM`;
}

function formatTime12(d: Date): string {
  const h = d.getHours();
  const m = d.getMinutes();
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return m === 0 ? `${h12} ${suffix}` : `${h12}:${m.toString().padStart(2, "0")} ${suffix}`;
}

function formatTimeCompact(d: Date): string {
  const h = d.getHours();
  const m = d.getMinutes();
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return m === 0 ? `${h12} ${suffix}` : `${h12}:${m.toString().padStart(2, "0")} ${suffix}`;
}

function formatDuration(startStr: string, endStr: string): string {
  const totalMins = Math.round((new Date(endStr).getTime() - new Date(startStr).getTime()) / 60000);
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hours === 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}

function isSameDay(d1: Date, d2: Date): boolean {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

function eventTopAndHeight(ev: CalendarEventDto, vd: Date): { top: number; height: number } {
  const start = new Date(ev.startTime);
  const end = new Date(ev.endTime);

  const dayStart = new Date(vd);
  dayStart.setHours(START_HOUR, 0, 0, 0);
  const dayEnd = new Date(vd);
  dayEnd.setHours(END_HOUR, 0, 0, 0);

  const clampedStart = start < dayStart ? dayStart : start;
  const clampedEnd = end > dayEnd ? dayEnd : end;

  const startMins = (clampedStart.getHours() - START_HOUR) * 60 + clampedStart.getMinutes();
  const endMins = (clampedEnd.getHours() - START_HOUR) * 60 + clampedEnd.getMinutes();

  const top = (startMins / 60) * HOUR_HEIGHT;
  const height = Math.max(((endMins - startMins) / 60) * HOUR_HEIGHT, 20);

  return { top, height };
}

function formatNowLabel(): string {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return m === 0 ? `${h12}${suffix}` : `${h12}:${m.toString().padStart(2, "0")}${suffix}`;
}

const EVENT_BORDER = "#BD8BFF";
const EVENT_BG = "#FEECFF";
const EVENT_BORDER_SELECTED = "#9850FF";
const EVENT_BG_SELECTED = "#F0D4FF";

interface CalendarTimelineProps {
  viewDate: Accessor<Date>;
  selectedEvent: Accessor<CalendarEventDto | null>;
  setSelectedEvent: Setter<CalendarEventDto | null>;
}

export default function CalendarTimeline(props: CalendarTimelineProps) {
  const [events, setEvents] = createSignal<CalendarEventDto[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [nowMinutes, setNowMinutes] = createSignal(0);

  const viewDate = () => props.viewDate();
  const isToday = () => isSameDay(viewDate(), new Date());

  const dayEvents = createMemo(() => {
    const vd = viewDate();
    const vdStr = `${vd.getFullYear()}-${String(vd.getMonth() + 1).padStart(2, "0")}-${String(vd.getDate()).padStart(2, "0")}`;
    return events().filter((ev) => {
      if (ev.isAllDay) return ev.startTime.startsWith(vdStr);
      const start = new Date(ev.startTime);
      const end = new Date(ev.endTime);
      return isSameDay(start, vd) || isSameDay(end, vd) || (start < vd && end > vd);
    });
  });

  const allDayEvents = createMemo(() => dayEvents().filter((ev) => ev.isAllDay));
  const timedEvents = createMemo(() => dayEvents().filter((ev) => !ev.isAllDay));

  // Reset selection when day changes
  createEffect(() => {
    viewDate();
    props.setSelectedEvent(null);
  });

  const updateNow = () => {
    const now = new Date();
    setNowMinutes((now.getHours() - START_HOUR) * 60 + now.getMinutes());
  };

  async function fetchEvents() {
    try {
      const result = await invoke<CalendarEventDto[]>("get_upcoming_events", {
        accountId: "_all",
        days: 7,
      });
      setEvents(result);
    } catch (e) {
      console.warn("Failed to fetch calendar events:", e);
      setEvents([]);
    }
    setLoading(false);
  }

  onMount(() => {
    fetchEvents();
    updateNow();
  });

  const nowTimer = setInterval(updateNow, 60000);
  const unlistenUpdated = listen("calendar:events_updated", () => fetchEvents());
  onCleanup(() => {
    clearInterval(nowTimer);
    unlistenUpdated.then((fn) => fn());
  });

  // Scroll to current time on first load
  let timelineRef: HTMLDivElement | undefined;
  createEffect(() => {
    if (!loading() && timelineRef) {
      const scrollTo = Math.max(((nowMinutes() / 60) * HOUR_HEIGHT) - 100, 0);
      timelineRef.scrollTop = scrollTo;
    }
  });

  // j/k to navigate timed events, Enter to select/deselect
  const handleKeyDown = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;

    const timed = timedEvents();
    if (timed.length === 0) return;

    const currentIdx = () => {
      const sel = props.selectedEvent();
      return sel ? timed.findIndex((ev) => ev.id === sel.id) : -1;
    };

    if (e.key === "j") {
      e.preventDefault();
      const next = Math.min(currentIdx() + 1, timed.length - 1);
      props.setSelectedEvent(timed[next]);
    } else if (e.key === "k") {
      e.preventDefault();
      const prev = Math.max(currentIdx() - 1, 0);
      props.setSelectedEvent(timed[prev]);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (props.selectedEvent()) props.setSelectedEvent(null);
      else if (timed.length > 0) props.setSelectedEvent(timed[0]);
    }
  };

  onMount(() => document.addEventListener("keydown", handleKeyDown));
  onCleanup(() => document.removeEventListener("keydown", handleKeyDown));

  const nowTop = () => (nowMinutes() / 60) * HOUR_HEIGHT;

  return (
    <div class="h-full flex flex-col overflow-hidden select-none bg-white">
      {/* All-day row */}
      <Show when={allDayEvents().length > 0}>
        <div class="flex-shrink-0 border-b border-zinc-100 flex" style={{ "padding-left": "60px" }}>
          <div class="flex-shrink-0 w-[52px] text-[11px] text-zinc-400 py-1.5 pr-2 text-right">All-day</div>
          <div class="flex-1 py-1 flex flex-wrap gap-1 px-1">
            <For each={allDayEvents()}>
              {(ev) => {
                const isSelected = () => props.selectedEvent()?.id === ev.id;
                return (
                <div
                  onClick={() => props.setSelectedEvent((prev) => prev?.id === ev.id ? null : ev)}
                  class="text-[11px] px-2 py-0.5 rounded cursor-pointer truncate max-w-[200px]"
                  style={{
                    "background-color": isSelected() ? EVENT_BG_SELECTED : EVENT_BG,
                    color: isSelected() ? EVENT_BORDER_SELECTED : EVENT_BORDER,
                    "border-left": `3px solid ${isSelected() ? EVENT_BORDER_SELECTED : EVENT_BORDER}`,
                  }}
                >
                  {ev.title}
                </div>
                );
              }}
            </For>
          </div>
        </div>
      </Show>

      {/* Scrollable time grid */}
      <Show when={!loading()} fallback={
        <div class="flex items-center justify-center h-32 text-[13px] text-zinc-400">Loading events...</div>
      }>
        <div ref={timelineRef} class="flex-1 overflow-y-auto relative">
          <div class="relative" style={{ height: `${TOTAL_HOURS * HOUR_HEIGHT}px` }}>
            {/* Hour lines + labels */}
            <For each={Array.from({ length: TOTAL_HOURS }, (_, i) => i + START_HOUR)}>
              {(hour) => (
                <div
                  class="absolute w-full flex"
                  style={{ top: `${(hour - START_HOUR) * HOUR_HEIGHT}px` }}
                >
                  <div class="w-[60px] flex-shrink-0 text-right pr-3 -mt-[7px]">
                    <span class="text-[11px] text-zinc-400">{formatHour(hour)}</span>
                  </div>
                  <div class="flex-1 border-t border-zinc-100" />
                </div>
              )}
            </For>

            {/* Events */}
            <div class="absolute inset-0" style={{ left: "60px", right: "8px" }}>
              <For each={timedEvents()}>
                {(ev) => {
                  const pos = () => eventTopAndHeight(ev, viewDate());
                  const durationMins = () => Math.round((new Date(ev.endTime).getTime() - new Date(ev.startTime).getTime()) / 60000);
                  const isSelected = () => props.selectedEvent()?.id === ev.id;
                  return (
                    <div
                      onClick={() => props.setSelectedEvent((prev) => prev?.id === ev.id ? null : ev)}
                      class="absolute left-1 right-1 rounded-sm px-2.5 py-1 cursor-pointer overflow-hidden"
                      style={{
                        top: `${pos().top}px`,
                        height: `${pos().height}px`,
                        "background-color": isSelected() ? EVENT_BG_SELECTED : EVENT_BG,
                        "border-left": `3px solid ${isSelected() ? EVENT_BORDER_SELECTED : EVENT_BORDER}`,
                      }}
                    >
                      <Show when={durationMins() >= 60} fallback={
                        /* Short events: title + time inline */
                        <div class="text-[12px] truncate" style={{ color: "#7733D2" }}>
                          <span class="font-medium">{ev.title}</span>
                          <span class="ml-1">{formatTimeCompact(new Date(ev.startTime))}</span>
                        </div>
                      }>
                        {/* Longer events: title on first line, time range on second */}
                        <div class="text-[12px] font-medium truncate" style={{ color: "#7733D2" }}>{ev.title}</div>
                        <Show when={pos().height > 30}>
                          <div class="text-[11px] truncate" style={{ color: "#7733D2" }}>
                            {formatTimeCompact(new Date(ev.startTime))} – {formatTimeCompact(new Date(ev.endTime))}
                          </div>
                        </Show>
                      </Show>
                    </div>
                  );
                }}
              </For>
            </div>

            {/* Current time indicator */}
            <Show when={isToday()}>
              <div
                class="absolute pointer-events-none"
                style={{ top: `${nowTop()}px`, left: "0", right: "0" }}
              >
                <div class="flex items-center">
                  <div class="w-[60px] flex-shrink-0 text-right pr-2 -mt-[1px]">
                    <span class="text-[10px] font-semibold text-red-500 bg-white px-0.5">{formatNowLabel()}</span>
                  </div>
                  <div class="w-2.5 h-2.5 rounded-full bg-red-500 -ml-[5px]" />
                  <div class="flex-1 h-[2px] bg-red-500" />
                </div>
              </div>
            </Show>
          </div>
        </div>
      </Show>
    </div>
  );
}

/* ── Detail panel (rendered separately in App.tsx for full-height layout) ── */

interface CalendarDetailPanelProps {
  selectedEvent: Accessor<CalendarEventDto | null>;
}

export function CalendarDetailPanel(props: CalendarDetailPanelProps) {
  return (
    <div class="w-[280px] flex-shrink-0 border-l border-zinc-200 overflow-y-auto bg-[#FDFDFD]">
      <Show when={props.selectedEvent()} fallback={
        <div class="flex items-center justify-center h-full text-[13px] text-zinc-400">
          Select an event
        </div>
      }>
        {(ev) => (
          <>
            <div class="px-4 pt-4 pb-3 flex items-start justify-between">
              <h3 class="text-[15px] font-semibold text-zinc-800 flex-1">{ev().title}</h3>
              <button class="text-zinc-400 hover:text-zinc-600 flex-shrink-0 ml-2 mt-0.5 cursor-pointer">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <circle cx="8" cy="3" r="1.2" />
                  <circle cx="8" cy="8" r="1.2" />
                  <circle cx="8" cy="13" r="1.2" />
                </svg>
              </button>
            </div>
            <div class="px-4 pb-3">

              {/* Time */}
              <div class="flex items-center gap-2 mb-2">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.2" class="text-zinc-400 flex-shrink-0">
                  <circle cx="7" cy="7" r="5.5" />
                  <path d="M7 4V7L9 8.5" stroke-linecap="round" />
                </svg>
                <Show when={!ev().isAllDay} fallback={
                  <span class="text-[13px] text-zinc-600">All day</span>
                }>
                  <div class="text-[13px] text-zinc-600">
                    <span>{formatTime12(new Date(ev().startTime))}</span>
                    <span class="text-zinc-400 mx-1.5">&rarr;</span>
                    <span>{formatTime12(new Date(ev().endTime))}</span>
                    <span class="text-zinc-400 ml-1.5">{formatDuration(ev().startTime, ev().endTime)}</span>
                  </div>
                </Show>
              </div>

              {/* Date */}
              <div class="flex items-center gap-2 mb-2">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.2" class="text-zinc-400 flex-shrink-0">
                  <rect x="1.5" y="2.5" width="11" height="9.5" rx="1" />
                  <path d="M1.5 5.5H12.5" />
                  <path d="M4.5 1V3.5" stroke-linecap="round" />
                  <path d="M9.5 1V3.5" stroke-linecap="round" />
                </svg>
                <span class="text-[13px] text-zinc-600">
                  {new Date(ev().startTime).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                </span>
              </div>

              {/* Location */}
              <Show when={ev().location}>
                <div class="flex items-start gap-2 mb-2">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.2" class="text-zinc-400 flex-shrink-0 mt-0.5">
                    <path d="M7 12.5C7 12.5 11.5 9 11.5 5.5C11.5 3 9.5 1.5 7 1.5C4.5 1.5 2.5 3 2.5 5.5C2.5 9 7 12.5 7 12.5Z" />
                    <circle cx="7" cy="5.5" r="1.5" />
                  </svg>
                  <span class="text-[13px] text-zinc-600">{ev().location}</span>
                </div>
              </Show>

              {/* Description */}
              <Show when={ev().description}>
                <div class="mt-4 pt-3 border-t border-zinc-200">
                  <div class="text-[11px] text-zinc-400 mb-1.5">Description</div>
                  <p class="text-[13px] text-zinc-600 whitespace-pre-wrap break-words">{ev().description}</p>
                </div>
              </Show>

              {/* Calendar */}
              <Show when={ev().calendarName}>
                <div class="mt-4 pt-3 border-t border-zinc-200 flex items-center gap-2">
                  <span class="text-[13px] text-zinc-600">{ev().calendarName}</span>
                </div>
              </Show>

              {/* Organizer */}
              <Show when={ev().organizerEmail}>
                <div class="mt-3 flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.2" class="text-zinc-400 flex-shrink-0">
                    <circle cx="7" cy="4.5" r="2.5" />
                    <path d="M2 12.5C2 10 4 8.5 7 8.5C10 8.5 12 10 12 12.5" stroke-linecap="round" />
                  </svg>
                  <span class="text-[13px] text-zinc-500">{ev().organizerEmail}</span>
                </div>
              </Show>

              {/* Attendees */}
              <Show when={ev().attendees && ev().attendees!.length > 0}>
                <div class="mt-4 pt-3 border-t border-zinc-200">
                  <div class="text-[11px] text-zinc-400 mb-1.5">Participants</div>
                  <For each={ev().attendees!}>
                    {(email) => (
                      <div class="text-[13px] text-zinc-600 py-0.5">{email}</div>
                    )}
                  </For>
                </div>
              </Show>
            </div>
          </>
        )}
      </Show>
    </div>
  );
}
