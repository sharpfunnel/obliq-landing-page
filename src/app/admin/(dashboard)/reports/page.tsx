import { Download } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import StatTile from "@/components/admin/StatTile";
import { Users, Globe, UserCheck, TrendingUp } from "lucide-react";
import { resolveReportRange, getReportOverview } from "@/lib/admin/reports";

export const dynamic = "force-dynamic";

const RANGES = [
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "90d", label: "Last 90 days" },
];

function ExportLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="flex items-center gap-1.5 rounded-lg border border-navy-200 bg-white px-3 py-2 text-xs font-medium text-navy-600 transition hover:border-gold-400 hover:text-navy-900"
    >
      <Download className="h-3.5 w-3.5" /> {label}
    </a>
  );
}

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range: rangeParam } = await searchParams;
  const params = new URLSearchParams({ range: rangeParam ?? "30d" });
  const range = resolveReportRange(params);
  const overview = await getReportOverview(range);
  const rangeQuery = `range=${params.get("range")}`;

  return (
    <div>
      <PageHeader title="Reports" description="Export overview, leads and campaign performance." />

      <div className="mb-6 flex gap-2">
        {RANGES.map((r) => (
          <a
            key={r.key}
            href={`/admin/reports?range=${r.key}`}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              params.get("range") === r.key ? "bg-gold-500 text-navy-950" : "bg-white text-navy-600 ring-1 ring-navy-200 hover:bg-navy-50"
            }`}
          >
            {r.label}
          </a>
        ))}
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile icon={Users} label="Visitors" value={overview.visitors} />
        <StatTile icon={Globe} label="Sessions" value={overview.sessions} />
        <StatTile icon={UserCheck} label="Leads" value={overview.leads} />
        <StatTile icon={TrendingUp} label="Conversion" value={`${overview.conversionRate}%`} />
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-xl border border-navy-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-bold text-navy-900">Overview</h2>
          <div className="flex flex-wrap gap-2">
            <ExportLink href={`/api/reports/overview?${rangeQuery}&format=csv`} label="CSV" />
            <ExportLink href={`/api/reports/overview?${rangeQuery}&format=xlsx`} label="XLSX" />
            <ExportLink href={`/api/reports/overview?${rangeQuery}&format=pdf`} label="PDF" />
          </div>
        </div>

        <div className="rounded-xl border border-navy-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-bold text-navy-900">Leads</h2>
          <div className="flex flex-wrap gap-2">
            <ExportLink href={`/api/reports/leads?${rangeQuery}&format=csv`} label="CSV" />
            <ExportLink href={`/api/reports/leads?${rangeQuery}&format=xlsx`} label="XLSX" />
          </div>
        </div>

        <div className="rounded-xl border border-navy-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-bold text-navy-900">Campaigns</h2>
          <div className="flex flex-wrap gap-2">
            <ExportLink href={`/api/reports/campaigns?${rangeQuery}&format=csv`} label="CSV" />
            <ExportLink href={`/api/reports/campaigns?${rangeQuery}&format=xlsx`} label="XLSX" />
          </div>
        </div>
      </div>
    </div>
  );
}
