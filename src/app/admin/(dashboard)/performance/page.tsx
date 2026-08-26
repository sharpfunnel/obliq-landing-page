import PageHeader from "@/components/admin/PageHeader";
import { getPerformanceStats } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

const UNITS: Record<string, string> = { LCP: "ms", INP: "ms", CLS: "", FCP: "ms", TTFB: "ms" };

export default async function AdminPerformancePage() {
  const stats = await getPerformanceStats(30);

  return (
    <div>
      <PageHeader title="Performance" description="Core Web Vitals reported by real visitors, last 30 days." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => {
          const total = s.good + s.needsImprovement + s.poor || 1;
          return (
            <div key={s.metric} className="rounded-xl border border-navy-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-navy-900">{s.metric}</span>
                <span className="text-xs text-navy-400">{s.sampleCount} samples</span>
              </div>
              <p className="mt-2 text-2xl font-extrabold text-navy-900">
                {s.avg !== null ? Math.round(s.avg * 100) / 100 : "—"}
                {UNITS[s.metric] && <span className="ml-1 text-sm font-medium text-navy-400">{UNITS[s.metric]}</span>}
              </p>
              <div className="mt-3 flex h-2 w-full overflow-hidden rounded-full">
                <div className="bg-green-500" style={{ width: `${(s.good / total) * 100}%` }} />
                <div className="bg-amber-400" style={{ width: `${(s.needsImprovement / total) * 100}%` }} />
                <div className="bg-red-500" style={{ width: `${(s.poor / total) * 100}%` }} />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-navy-500">
                <span>
                  {s.good} <span className="text-green-600">good</span>
                </span>
                <span>{s.needsImprovement} needs work</span>
                <span>
                  {s.poor} <span className="text-red-500">poor</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
