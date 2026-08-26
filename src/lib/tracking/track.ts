"use client";

import { getOrCreateSessionEntryMeta, getOrCreateSessionId, getOrCreateVisitorId } from "./ids";
import { detectDevice } from "./device";
import type {
  CtaEventPayload,
  ErrorEventPayload,
  FormEventPayload,
  GenericEventPayload,
  MouseEventPayload,
  PageViewEventPayload,
  PerfEventPayload,
  ScrollEventPayload,
  TrackBatchPayload,
  TrackInitPayload,
} from "./types";

const TRACK_ENDPOINT = "/api/track";
const FLUSH_INTERVAL_MS = 5000;

let cachedInit: TrackInitPayload | null = null;

/** The single source of truth for "how do we identify this visitor/session." */
export function getTrackingInit(): TrackInitPayload {
  if (cachedInit) return cachedInit;
  const [visitorId, isNewVisitor] = getOrCreateVisitorId();
  const [sessionId, isNewSession] = getOrCreateSessionId();
  cachedInit = {
    visitorId,
    isNewVisitor,
    sessionId,
    isNewSession,
    device: detectDevice(),
    entryMeta: getOrCreateSessionEntryMeta(),
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
  };
  return cachedInit;
}

type Queue = {
  pageViews: PageViewEventPayload[];
  scrollEvents: ScrollEventPayload[];
  ctaEvents: CtaEventPayload[];
  formEvents: FormEventPayload[];
  perfMetrics: PerfEventPayload[];
  errors: ErrorEventPayload[];
  mouseEvents: MouseEventPayload[];
  events: GenericEventPayload[];
  mouseClicks: number;
  mouseMoves: number;
};

function emptyQueue(): Queue {
  return {
    pageViews: [],
    scrollEvents: [],
    ctaEvents: [],
    formEvents: [],
    perfMetrics: [],
    errors: [],
    mouseEvents: [],
    events: [],
    mouseClicks: 0,
    mouseMoves: 0,
  };
}

let queue = emptyQueue();
let flushTimer: ReturnType<typeof setInterval> | null = null;
let exitPath: string | undefined;

function isQueueEmpty(q: Queue) {
  const arraysEmpty = [q.pageViews, q.scrollEvents, q.ctaEvents, q.formEvents, q.perfMetrics, q.errors, q.mouseEvents, q.events].every(
    (arr) => arr.length === 0
  );
  return arraysEmpty && q.mouseClicks === 0 && q.mouseMoves === 0;
}

function send(body: TrackBatchPayload, useBeacon: boolean) {
  const json = JSON.stringify(body);
  if (useBeacon && navigator.sendBeacon) {
    const blob = new Blob([json], { type: "application/json" });
    const ok = navigator.sendBeacon(TRACK_ENDPOINT, blob);
    if (ok) return;
  }
  fetch(TRACK_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: json,
    keepalive: true,
  }).catch(() => {});
}

export function flush(opts: { useBeacon?: boolean; isFinal?: boolean } = {}) {
  if (isQueueEmpty(queue) && !opts.isFinal) return;

  const payload: TrackBatchPayload = {
    init: getTrackingInit(),
    ...queue,
    exitPath,
    isFinal: opts.isFinal,
  };
  queue = emptyQueue();
  send(payload, Boolean(opts.useBeacon));
}

export function initTrackingQueue() {
  if (flushTimer) return; // already initialized
  getTrackingInit(); // warm the cache + persist ids/entry meta on first pageview

  flushTimer = setInterval(() => flush(), FLUSH_INTERVAL_MS);

  const onHide = () => {
    if (document.visibilityState === "hidden") flush({ useBeacon: true });
  };
  document.addEventListener("visibilitychange", onHide);
  window.addEventListener("pagehide", () => flush({ useBeacon: true }));
}

export function trackPageView(payload: PageViewEventPayload) {
  queue.pageViews.push(payload);
}

export function trackScroll(payload: ScrollEventPayload) {
  queue.scrollEvents.push(payload);
}

export function trackCta(payload: CtaEventPayload) {
  queue.ctaEvents.push(payload);
}

export function trackForm(payload: FormEventPayload) {
  queue.formEvents.push(payload);
}

export function trackPerf(payload: PerfEventPayload) {
  queue.perfMetrics.push(payload);
}

export function trackMouse(payload: MouseEventPayload) {
  queue.mouseEvents.push(payload);
}

/** Increments this session's raw click counter (distinct from the rage/dead/double-click
 *  anomaly detection in trackMouse) — a plain activity count shown in the Sessions table. */
export function trackMouseClickCount() {
  queue.mouseClicks += 1;
}

export function trackMouseMoveCount() {
  queue.mouseMoves += 1;
}

export function trackGenericEvent(payload: GenericEventPayload) {
  queue.events.push(payload);
}

/** Reports an error and flushes immediately (via sendBeacon) — don't wait for the
 *  periodic flush, since the tab may close right after (e.g. a failed form submit). */
export function trackError(payload: ErrorEventPayload) {
  queue.errors.push(payload);
  flush({ useBeacon: true });
}

export function setExitPath(path: string) {
  exitPath = path;
}
