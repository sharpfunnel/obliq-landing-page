import { Download } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import StatTile from "@/components/admin/StatTile";
import { Users, Globe, UserCheck, TrendingUp, ArrowDownWideNarrow, MousePointerClick, Clock } from "lucide-react";
import { resolveReportRange, getReportOverview } from "@/lib/admin/reports";

export const dynamic = "force-dynamic";

function fmtDuration(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

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

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function defaultDateRange() {
  const to = new Date();
  const from = new Date(to.getTime() - 29 * 86400_000);
  return { from: toDateInputValue(from), to: toDateInputValue(to) };
}

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const defaults = defaultDateRange();
  const urlParams = new URLSearchParams({
    range: "custom",
    from: params.from ?? defaults.from,
    to: params.to ?? defaults.to,
  });
  const range = resolveReportRange(urlParams);
  const overview = await getReportOverview(range);
  const rangeQuery = urlParams.toString();

  return (
    <div>
      <PageHeader title="Reports" description="Export stats for any date range" />

      <form method="GET" className="mb-6 flex flex-wrap items-end gap-4 rounded-xl border border-navy-200 bg-white p-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-navy-600">From</label>
          <input
            type="date"
            name="from"
            defaultValue={urlParams.get("from") ?? ""}
            className="rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-gold-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-navy-600">To</label>
          <input
            type="date"
            name="to"
            defaultValue={urlParams.get("to") ?? ""}
            className="rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-gold-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-800"
        >
          Apply
        </button>
      </form>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
        <StatTile icon={Users} label="Visitors" value={overview.visitors} />
        <StatTile icon={Globe} label="Sessions" value={overview.sessions} />
        <StatTile icon={UserCheck} label="Leads" value={overview.leads} />
        <StatTile icon={TrendingUp} label="Conversion" value={`${overview.conversionRate}%`} />
        <StatTile icon={ArrowDownWideNarrow} label="Scroll 50%+" value={overview.scrolledHalf} />
        <StatTile icon={MousePointerClick} label="CTA Clicks" value={overview.ctaClicks} />
        <StatTile icon={Clock} label="Avg Time" value={fmtDuration(overview.avgDurationSeconds)} />
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-xl border border-navy-200 bg-white p-4">
          <h2 className="text-sm font-bold text-navy-900">Overview</h2>
          <p className="mb-3 text-xs text-navy-500">Site-wide stats for the selected range.</p>
          <div className="flex flex-wrap gap-2">
            <ExportLink href={`/api/reports/overview?${rangeQuery}&format=csv`} label="CSV" />
            <ExportLink href={`/api/reports/overview?${rangeQuery}&format=xlsx`} label="XLSX" />
            <ExportLink href={`/api/reports/overview?${rangeQuery}&format=pdf`} label="PDF" />
          </div>
        </div>

        <div className="rounded-xl border border-navy-200 bg-white p-4">
          <h2 className="text-sm font-bold text-navy-900">Leads</h2>
          <p className="mb-3 text-xs text-navy-500">Full lead rows for the selected range.</p>
          <div className="flex flex-wrap gap-2">
            <ExportLink href={`/api/reports/leads?${rangeQuery}&format=csv`} label="CSV" />
            <ExportLink href={`/api/reports/leads?${rangeQuery}&format=xlsx`} label="XLSX" />
          </div>
        </div>

        <div className="rounded-xl border border-navy-200 bg-white p-4">
          <h2 className="text-sm font-bold text-navy-900">Campaigns</h2>
          <p className="mb-3 text-xs text-navy-500">Meta Ads campaign performance for the selected range.</p>
          <div className="flex flex-wrap gap-2">
            <ExportLink href={`/api/reports/campaigns?${rangeQuery}&format=csv`} label="CSV" />
            <ExportLink href={`/api/reports/campaigns?${rangeQuery}&format=xlsx`} label="XLSX" />
          </div>
        </div>
      </div>
    </div>
  );
}
