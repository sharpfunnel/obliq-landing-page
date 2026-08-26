"use client";

import { useEffect, useRef, useState } from "react";

export default function HeatmapOverlay({
  path,
  points,
}: {
  path: string;
  points: Array<{ xPct: number; yPct: number }>;
}) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  // Sized to the iframe's actual document height so there's no scroll context inside the
  // iframe — the whole thing scrolls as part of the normal page flow, keeping the dot
  // overlay (positioned in the parent document) aligned with the content underneath it.
  const [height, setHeight] = useState(800);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let observer: ResizeObserver | null = null;

    function measure(doc: Document) {
      const h = Math.max(doc.documentElement.scrollHeight, doc.body?.scrollHeight ?? 0);
      if (h > 0) setHeight(h);
    }

    function onLoad() {
      try {
        const doc = iframe!.contentDocument;
        if (!doc?.documentElement) return;
        measure(doc);
        observer = new ResizeObserver(() => measure(doc));
        observer.observe(doc.documentElement);
      } catch {
        // Cross-origin — nothing we can measure, keep the fallback height.
      }
    }

    iframe.addEventListener("load", onLoad);
    return () => {
      iframe.removeEventListener("load", onLoad);
      observer?.disconnect();
    };
  }, [path]);

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-navy-200 bg-white">
      <iframe
        ref={iframeRef}
        src={path}
        title="Heatmap target page"
        scrolling="no"
        className="block w-full"
        style={{ height }}
      />
      <div className="pointer-events-none absolute inset-0" style={{ height }}>
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
