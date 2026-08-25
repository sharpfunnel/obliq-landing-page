import PageHeader from "@/components/admin/PageHeader";
import { Table, Thead, Th, Tr, Td } from "@/components/admin/Table";
import { getPerformanceStats } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

const UNITS: Record<string, string> = { LCP: "ms", INP: "ms", CLS: "", FCP: "ms", TTFB: "ms" };

export default async function AdminPerformancePage() {
  const stats = await getPerformanceStats(30);

  return (
    <div>
      <PageHeader title="Performance" description="Core Web Vitals across all pages, last 30 days." />

      <Table>
        <Thead>
          <tr>
            <Th>Metric</Th>
            <Th className="text-right">Avg</Th>
            <Th className="text-right">Samples</Th>
            <Th>Distribution</Th>
          </tr>
        </Thead>
        <tbody>
          {stats.map((s) => {
            const total = s.good + s.needsImprovement + s.poor || 1;
            return (
              <Tr key={s.metric}>
                <Td className="font-medium text-navy-900">{s.metric}</Td>
                <Td className="text-right">
                  {s.avg !== null ? `${Math.round(s.avg * 100) / 100}${UNITS[s.metric]}` : "—"}
                </Td>
                <Td className="text-right">{s.sampleCount}</Td>
                <Td>
                  <div className="flex h-3 w-full max-w-xs overflow-hidden rounded-full">
                    <div className="bg-green-500" style={{ width: `${(s.good / total) * 100}%` }} title={`Good: ${s.good}`} />
                    <div
                      className="bg-amber-400"
                      style={{ width: `${(s.needsImprovement / total) * 100}%` }}
                      title={`Needs improvement: ${s.needsImprovement}`}
                    />
                    <div className="bg-red-500" style={{ width: `${(s.poor / total) * 100}%` }} title={`Poor: ${s.poor}`} />
                  </div>
                </Td>
              </Tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}
