const COLORS = ["#d19a47", "#4a6390", "#16a34a", "#dc2626", "#7c3aed", "#0891b2"];

export type DonutSlice = { label: string; count: number };

export default function DonutChart({ data, size = 140 }: { data: DonutSlice[]; size?: number }) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const radius = size / 2 - 12;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let cumulative = 0;

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#eef1f6" strokeWidth={16} />
        {total > 0 &&
          data.map((d, i) => {
            const fraction = d.count / total;
            const dash = fraction * circumference;
            const offset = -cumulative * circumference;
            cumulative += fraction;
            return (
              <circle
                key={d.label}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={16}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={offset}
                transform={`rotate(-90 ${center} ${center})`}
              />
            );
          })}
        <text x={center} y={center} textAnchor="middle" dominantBaseline="middle" className="fill-navy-900 text-sm font-bold">
          {total}
        </text>
      </svg>
      <ul className="space-y-1.5 text-xs">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
            <span className="text-navy-700">{d.label}</span>
            <span className="text-navy-400">{total > 0 ? Math.round((d.count / total) * 100) : 0}%</span>
          </li>
        ))}
        {data.length === 0 && <li className="text-navy-400">No data yet.</li>}
      </ul>
    </div>
  );
}
