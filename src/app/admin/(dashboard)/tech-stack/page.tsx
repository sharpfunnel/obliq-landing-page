import PageHeader from "@/components/admin/PageHeader";
import DonutChart from "@/components/admin/DonutChart";
import BarBreakdown from "@/components/admin/BarBreakdown";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/admin/Table";
import { getTechStackStats } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-navy-200 bg-white p-4">
      <h2 className="mb-3 text-sm font-bold text-navy-900">{title}</h2>
      {children}
    </div>
  );
}

export default async function AdminTechStackPage() {
  const stats = await getTechStackStats(30);

  return (
    <div>
      <PageHeader title="Tech stack" description="What OS, browsers and devices your visitors actually get." />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card title="Devices">
          <DonutChart data={stats.devices.map((d) => ({ label: d.label, count: d.count }))} />
        </Card>
        <Card title="Browsers">
          <DonutChart data={stats.browsers.map((d) => ({ label: d.label, count: d.count }))} />
        </Card>
        <Card title="Operating systems">
          <DonutChart data={stats.os.map((d) => ({ label: d.label, count: d.count }))} />
        </Card>
        <Card title="Connection quality">
          <DonutChart data={stats.connections.map((d) => ({ label: d.label, count: d.count }))} />
          <p className="mt-3 text-[11px] text-navy-400">
            Measured via the browser&apos;s Network Information API — only reported by Chromium-based browsers
            (Chrome, Edge, Opera). Safari and Firefox never report this, so their sessions are excluded here.
          </p>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Card title="Browser versions">
          <BarBreakdown data={stats.browserVersions} />
        </Card>
        <Card title="OS versions">
          <BarBreakdown data={stats.osVersions} />
        </Card>
        <Card title="Screen resolutions">
          <BarBreakdown data={stats.resolutions} />
        </Card>
        <Card title="Viewport sizes">
          <BarBreakdown data={stats.viewports} />
        </Card>
        <Card title="Languages">
          <BarBreakdown data={stats.languages} />
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-bold text-navy-900">Performance by browser</h2>
          <Table>
            <Thead>
              <tr>
                <Th>Browser</Th>
                <Th className="text-right">Samples</Th>
                <Th className="text-right">Good LCP</Th>
              </tr>
            </Thead>
            <tbody>
              {stats.perfByBrowser.length === 0 && <EmptyState message="No performance data yet." />}
              {stats.perfByBrowser.map((row) => (
                <Tr key={row.label}>
                  <Td>{row.label}</Td>
                  <Td className="text-right">{row.total}</Td>
                  <Td className="text-right">{row.goodPct}%</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-bold text-navy-900">Performance by OS</h2>
          <Table>
            <Thead>
              <tr>
                <Th>OS</Th>
                <Th className="text-right">Samples</Th>
                <Th className="text-right">Good LCP</Th>
              </tr>
            </Thead>
            <tbody>
              {stats.perfByOs.length === 0 && <EmptyState message="No performance data yet." />}
              {stats.perfByOs.map((row) => (
                <Tr key={row.label}>
                  <Td>{row.label}</Td>
                  <Td className="text-right">{row.total}</Td>
                  <Td className="text-right">{row.goodPct}%</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
}
