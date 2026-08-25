"use client";

import { getTrackingInit } from "./track";

const REPLAY_ENDPOINT = "/api/replay";
const FLUSH_INTERVAL_MS = 8000;

let buffer: unknown[] = [];
let seq = 0;
let started = false;
let stopFn: (() => void) | null = null;

async function flushReplay(isFinal = false) {
  if (buffer.length === 0 && !isFinal) return;
  const events = buffer;
  buffer = [];
  if (events.length === 0) return;

  const init = getTrackingInit();
  const body = JSON.stringify({ sessionId: init.sessionId, seq: seq++, events });

  try {
    const res = await fetch(REPLAY_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
    const data = (await res.json().catch(() => null)) as { retry?: boolean } | null;
    if (data?.retry) {
      // session row not created yet server-side — try again shortly
      setTimeout(() => {
        buffer = [...events, ...buffer];
      }, 1500);
    }
  } catch {
    // drop this chunk rather than growing the buffer unboundedly
  }
}

/** Starts rrweb recording. Dynamically imported so it's not in the main bundle
 *  for visitors whose session never needs replay (e.g. the admin panel itself). */
export async function startSessionReplay() {
  if (started) return;
  started = true;

  const { record } = await import("rrweb");

  stopFn =
    record({
      emit(event) {
        buffer.push(event);
      },
      maskAllInputs: true,
      maskTextSelector: "[data-mask]",
      sampling: { mousemove: false, scroll: 150, input: "last" },
      checkoutEveryNms: 30000,
    }) ?? null;

  const interval = setInterval(() => flushReplay(), FLUSH_INTERVAL_MS);

  window.addEventListener("pagehide", () => {
    clearInterval(interval);
    stopFn?.();
    flushReplay(true);
  });
}
