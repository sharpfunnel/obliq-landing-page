import PageHeader from "@/components/admin/PageHeader";
import DonutChart from "@/components/admin/DonutChart";
import BarBreakdown from "@/components/admin/BarBreakdown";
import RangeSwitcher from "@/components/admin/RangeSwitcher";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/admin/Table";
import { getTechStackStats } from "@/lib/admin/queries";
import { rangeToDays } from "@/lib/admin/constants";

export const dynamic = "force-dynamic";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-navy-200 bg-white p-4">
      <h2 className="mb-3 text-sm font-bold text-navy-900">{title}</h2>
      {children}
    </div>
  );
}

function CohortTable({ rows }: { rows: Array<{ label: string; sessions: number; bouncePct: number; leads: number; conversionPct: number }> }) {
  return (
    <Table>
      <Thead>
        <tr>
          <Th>Cohort</Th>
          <Th className="text-right">Sessions</Th>
          <Th className="text-right">Bounce</Th>
          <Th className="text-right">Leads</Th>
          <Th className="text-right">Conversion</Th>
        </tr>
      </Thead>
      <tbody>
        {rows.length === 0 && <EmptyState message="No session data yet." />}
        {rows.map((row) => (
          <Tr key={row.label}>
            <Td>{row.label}</Td>
            <Td className="text-right">{row.sessions}</Td>
            <Td className="text-right">{row.bouncePct}%</Td>
            <Td className="text-right">{row.leads}</Td>
            <Td className="text-right">{row.conversionPct}%</Td>
          </Tr>
        ))}
      </tbody>
    </Table>
  );
}

export default async function AdminTechStackPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range } = await searchParams;
  const days = rangeToDays(range);
  const stats = await getTechStackStats(days);

  return (
    <div>
      <PageHeader
        title="Tech stack"
        description={`What ${stats.totalSessions} sessions actually browsed on, and how each cohort performed.`}
        actions={<RangeSwitcher basePath="/admin/tech-stack" current={range ?? "30d"} />}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card title="Devices">
          <DonutChart data={stats.devices.map((d) => ({ label: d.label, count: d.count }))} />
        </Card>
        <Card title="Browsers">
          <BarBreakdown data={stats.browsers} />
        </Card>
        <Card title="Operating systems">
          <BarBreakdown data={stats.os} />
        </Card>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Card title="Browser versions">
          <BarBreakdown data={stats.browserVersions} />
        </Card>
        <Card title="OS versions">
          <BarBreakdown data={stats.osVersions} />
        </Card>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Card title="Screen resolutions">
          <BarBreakdown data={stats.resolutions} />
        </Card>
        <Card title="Viewport sizes">
          <BarBreakdown data={stats.viewports} />
        </Card>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Card title="Languages">
          <BarBreakdown data={stats.languages} />
        </Card>
        <Card title="Connection quality">
          <BarBreakdown data={stats.connections} />
          <p className="mt-3 text-[11px] text-navy-400">
            Measured via the browser&apos;s Network Information API — only reported by Chromium-based browsers
            (Chrome, Edge, Opera). Safari and Firefox never report this, so their sessions are excluded here.
          </p>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-bold text-navy-900">Performance by browser</h2>
          <CohortTable rows={stats.cohortByBrowser} />
        </div>

        <div>
          <h2 className="mb-3 text-sm font-bold text-navy-900">Performance by OS</h2>
          <CohortTable rows={stats.cohortByOs} />
        </div>
      </div>
    </div>
  );
}
