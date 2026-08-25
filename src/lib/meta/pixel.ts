declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export function trackPixelPageView() {
  if (!META_PIXEL_ID) return;
  window.fbq?.("trackSingle", META_PIXEL_ID, "PageView");
}

/**
 * Fires the browser half of a Lead conversion.
 *
 * `eventId` MUST be the lead row's database id — the same value the server sender
 * puts in `event_id`. Meta collapses the two into one conversion when the pair
 * matches; if they diverge, every lead is counted twice.
 */
export function trackPixelLead(eventId: string) {
  if (!META_PIXEL_ID) return;
  window.fbq?.("trackSingle", META_PIXEL_ID, "Lead", {}, { eventID: eventId });
}
