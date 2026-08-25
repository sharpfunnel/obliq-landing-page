import "server-only";

import { waitUntil as vercelWaitUntil } from "@vercel/functions";

/**
 * Keeps a fire-and-forget promise alive after the response is sent. Uses Vercel's
 * `waitUntil` when deployed there; falls back to a detached, logged promise otherwise
 * so this still works on any other host.
 */
export function runBackground(promise: Promise<unknown>) {
  const logged = promise.catch((err) => {
    console.error("Background task failed:", err);
  });

  try {
    vercelWaitUntil(logged);
  } catch {
    // Not running on Vercel's request context — the detached promise above still runs.
  }
}
