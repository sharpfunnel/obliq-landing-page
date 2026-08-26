export default function ConversionFunnel({ stages }: { stages: Array<{ key: string; label: string; count: number }> }) {
  const max = Math.max(1, ...stages.map((s) => s.count));

  return (
    <div className="space-y-1">
      {stages.map((stage, i) => {
        const widthPct = Math.max(2, Math.round((stage.count / max) * 100));
        const pctOfStart = stages[0].count > 0 ? (stage.count / stages[0].count) * 100 : 0;
        const prev = i > 0 ? stages[i - 1].count : null;
        const change = prev !== null && prev > 0 ? ((stage.count - prev) / prev) * 100 : null;

        return (
          <div key={stage.key} className="py-2">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-navy-700">{stage.label}</span>
              <span className="text-navy-500">
                {stage.count.toLocaleString()} · {pctOfStart.toFixed(1)}%{" "}
                {change !== null && change < 0 && <span className="text-red-500">({change.toFixed(0)}% drop-off)</span>}
                {change !== null && change >= 0 && <span className="text-green-600">(+{change.toFixed(0)}%)</span>}
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-navy-100">
              <div className="h-full rounded-full bg-navy-800 transition-all" style={{ width: `${widthPct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
