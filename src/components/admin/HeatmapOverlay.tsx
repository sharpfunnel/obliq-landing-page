"use client";

import { useEffect, useRef, useState } from "react";

export default function HeatmapOverlay({
  path,
  points,
}: {
  path: string;
  points: Array<{ xPct: number; yPct: number }>;
}) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 700 });

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setSize((prev) => ({ ...prev, width: entry.contentRect.width }));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full overflow-hidden rounded-xl border border-navy-200 bg-white">
      <iframe src={path} title="Heatmap target page" className="block w-full" style={{ height: size.height }} />
      <div className="pointer-events-none absolute inset-0">
        {points.map((p, i) => (
          <span
            key={i}
            className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              left: `${p.xPct}%`,
              top: `${p.yPct}%`,
              background: "radial-gradient(circle, rgba(217,70,15,0.55) 0%, rgba(217,70,15,0) 70%)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
