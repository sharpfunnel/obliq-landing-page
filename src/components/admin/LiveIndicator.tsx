"use client";

import { useEffect, useState } from "react";

const POLL_INTERVAL_MS = 15_000;

export default function LiveIndicator({ initialCount }: { initialCount: number }) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/admin/live-count", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { count: number };
        if (!cancelled) setCount(data.count);
      } catch {
        // Transient network hiccup — next poll will retry.
      }
    }

    const timer = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  return (
    <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
      {count} live now
    </span>
  );
}
