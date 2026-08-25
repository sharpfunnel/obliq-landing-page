"use client";

import { useMemo, useState } from "react";

type Point = { date: string; visitors: number; sessions: number; leads: number };

const SERIES: Array<{ key: keyof Point; color: string; label: string }> = [
  { key: "visitors", color: "#4a6390", label: "Visitors" },
  { key: "sessions", color: "#d19a47", label: "Sessions" },
  { key: "leads", color: "#16a34a", label: "Leads" },
];

const WIDTH = 800;
const HEIGHT = 240;
const PADDING = 32;

export default function TimeSeriesChart({ data }: { data: Point[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const max = useMemo(
    () => Math.max(1, ...data.flatMap((d) => [d.visitors, d.sessions, d.leads])),
    [data]
  );

  const stepX = data.length > 1 ? (WIDTH - PADDING * 2) / (data.length - 1) : 0;

  function toXY(index: number, value: number) {
    const x = PADDING + index * stepX;
    const y = HEIGHT - PADDING - (value / max) * (HEIGHT - PADDING * 2);
    return [x, y];
  }

  function pathFor(key: keyof Point) {
    return data
      .map((d, i) => {
        const [x, y] = toXY(i, d[key] as number);
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }

  return (
    <div className="relative">
      <div className="mb-3 flex gap-4">
        {SERIES.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5 text-xs font-medium text-navy-600">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label}
          </span>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        onMouseLeave={() => setHoverIndex(null)}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const relX = ((e.clientX - rect.left) / rect.width) * WIDTH;
          const index = Math.round((relX - PADDING) / stepX);
          if (index >= 0 && index < data.length) setHoverIndex(index);
        }}
      >
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1={PADDING}
            x2={WIDTH - PADDING}
            y1={HEIGHT - PADDING - f * (HEIGHT - PADDING * 2)}
            y2={HEIGHT - PADDING - f * (HEIGHT - PADDING * 2)}
            stroke="#e2e8f0"
            strokeWidth={1}
          />
        ))}

        {SERIES.map((s) => (
          <path key={s.key} d={pathFor(s.key)} fill="none" stroke={s.color} strokeWidth={2} />
        ))}

        {hoverIndex !== null && (
          <>
            <line
              x1={PADDING + hoverIndex * stepX}
              x2={PADDING + hoverIndex * stepX}
              y1={PADDING}
              y2={HEIGHT - PADDING}
              stroke="#cbd5e1"
              strokeDasharray="3,3"
            />
            {SERIES.map((s) => {
              const [x, y] = toXY(hoverIndex, data[hoverIndex][s.key] as number);
              return <circle key={s.key} cx={x} cy={y} r={3.5} fill={s.color} />;
            })}
          </>
        )}
      </svg>

      {hoverIndex !== null && data[hoverIndex] && (
        <div className="pointer-events-none absolute top-0 rounded-lg border border-navy-200 bg-white px-3 py-2 text-xs shadow-lg" style={{ left: `${(hoverIndex / Math.max(1, data.length - 1)) * 90}%` }}>
          <p className="font-semibold text-navy-900">{data[hoverIndex].date}</p>
          {SERIES.map((s) => (
            <p key={s.key} style={{ color: s.color }}>
              {s.label}: {data[hoverIndex][s.key]}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
