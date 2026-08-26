export type BarRow = { label: string; count: number };

export default function BarBreakdown({ data, limit = 6 }: { data: BarRow[]; limit?: number }) {
  const rows = data.slice(0, limit);
  const max = Math.max(1, ...rows.map((r) => r.count));

  if (rows.length === 0) {
    return <p className="text-xs text-navy-400">No data yet.</p>;
  }

  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div key={r.label} className="text-xs">
          <div className="mb-1 flex items-center justify-between text-navy-600">
            <span className="truncate">{r.label}</span>
            <span className="font-semibold text-navy-800">{r.count}</span>
          </div>
          <div className="h-1.5 rounded-full bg-navy-100">
            <div className="h-1.5 rounded-full bg-gold-500" style={{ width: `${(r.count / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
