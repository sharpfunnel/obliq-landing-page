"use client";

import { useEffect, useRef } from "react";
import "rrweb-player/dist/style.css";

export default function ReplayPlayer({ events }: { events: unknown[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<{ $destroy?: () => void } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function mount() {
      if (!containerRef.current || events.length === 0) return;
      const { default: RrwebPlayer } = await import("rrweb-player");
      if (cancelled || !containerRef.current) return;

      containerRef.current.innerHTML = "";
      playerRef.current = new RrwebPlayer({
        target: containerRef.current,
        props: {
          events: events as never,
          width: containerRef.current.clientWidth,
          height: 520,
          autoPlay: false,
        },
      }) as never;
    }

    mount();
    return () => {
      cancelled = true;
      playerRef.current?.$destroy?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events.length]);

  if (events.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-navy-200 bg-white text-sm text-navy-400">
        No replay events recorded for this session.
      </div>
    );
  }

  return <div ref={containerRef} className="overflow-hidden rounded-xl border border-navy-200 bg-white" />;
}
