export default function ConversionFunnel({ stages }: { stages: Array<{ key: string; label: string; count: number }> }) {
  const max = Math.max(1, ...stages.map((s) => s.count));

  return (
    <div className="space-y-3">
      {stages.map((stage, i) => {
        const widthPct = Math.max(4, Math.round((stage.count / max) * 100));
        const pctOfStart = stages[0].count > 0 ? Math.round((stage.count / stages[0].count) * 1000) / 10 : 0;
        const prev = i > 0 ? stages[i - 1].count : null;
        const dropOff = prev !== null && prev > 0 ? Math.round(((prev - stage.count) / prev) * 1000) / 10 : null;

        return (
          <div key={stage.key}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-navy-700">{stage.label}</span>
              <span className="text-navy-400">
                {stage.count.toLocaleString()} · {pctOfStart}%{" "}
                {dropOff !== null && dropOff > 0 && <span className="text-red-500">(-{dropOff}%)</span>}
              </span>
            </div>
            <div className="h-6 w-full overflow-hidden rounded-md bg-navy-50">
              <div
                className="h-full rounded-md bg-gold-500 transition-all"
                style={{ width: `${widthPct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
