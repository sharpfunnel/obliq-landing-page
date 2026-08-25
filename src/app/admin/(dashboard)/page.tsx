import Link from "next/link";
import { Users, Globe, UserCheck, TrendingUp, MousePointerClick, Clock, ArrowDownWideNarrow } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import StatTile from "@/components/admin/StatTile";
import ConversionFunnel from "@/components/admin/ConversionFunnel";
import TimeSeriesChart from "@/components/admin/TimeSeriesChart";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/admin/Table";
import {
  getDailyTimeSeries,
  getFunnelStats,
  getOverviewStats,
  getRecentLeads,
  getTrafficSources,
} from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

function fmtChange(change: number | null) {
  if (change === null) return null;
  const sign = change > 0 ? "+" : "";
  return `${sign}${change}% vs prior period`;
}

function fmtDuration(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

export default async function AdminOverviewPage() {
  const [stats, series, sources, funnel, recentLeads] = await Promise.all([
    getOverviewStats(30),
    getDailyTimeSeries(30),
    getTrafficSources(30),
    getFunnelStats(30),
    getRecentLeads(6),
  ]);

  return (
    <div>
      <PageHeader title="Overview" description="Last 30 days" />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
        <StatTile icon={Users} label="Visitors" value={stats.visitors} subLabel={fmtChange(stats.visitorsChange) ?? undefined} />
        <StatTile icon={Globe} label="Sessions" value={stats.sessions} subLabel={fmtChange(stats.sessionsChange) ?? undefined} />
        <StatTile icon={UserCheck} label="Leads" value={stats.leads} subLabel={fmtChange(stats.leadsChange) ?? undefined} />
        <StatTile
          icon={TrendingUp}
          label="Conversion"
          value={`${stats.conversionRate}%`}
          subLabel={fmtChange(stats.conversionRateChange) ?? undefined}
        />
        <StatTile icon={ArrowDownWideNarrow} label="Scrolled 50%+" value={stats.scrolledHalf} />
        <StatTile icon={MousePointerClick} label="CTA Clicks" value={stats.ctaClicks} />
        <StatTile icon={Clock} label="Avg Time" value={fmtDuration(stats.avgDurationSeconds)} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-navy-200 bg-white p-4 lg:col-span-2">
          <h2 className="mb-4 text-sm font-bold text-navy-900">Traffic Trend</h2>
          <TimeSeriesChart data={series} />
        </div>

        <div className="rounded-xl border border-navy-200 bg-white p-4">
          <h2 className="mb-4 text-sm font-bold text-navy-900">Conversion Funnel</h2>
          <ConversionFunnel stages={funnel.stages} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-bold text-navy-900">Traffic Sources</h2>
          <Table>
            <Thead>
              <tr>
                <Th>Source</Th>
                <Th>Medium</Th>
                <Th>Campaign</Th>
                <Th className="text-right">Sessions</Th>
                <Th className="text-right">Leads</Th>
              </tr>
            </Thead>
            <tbody>
              {sources.length === 0 && <EmptyState message="No traffic yet." />}
              {sources.slice(0, 10).map((s) => (
                <Tr key={`${s.source}-${s.medium}-${s.campaign}`}>
                  <Td>{s.source}</Td>
                  <Td>{s.medium}</Td>
                  <Td>{s.campaign}</Td>
                  <Td className="text-right">{s.sessions}</Td>
                  <Td className="text-right">{s.leads}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-navy-900">Recent Leads</h2>
            <Link href="/admin/leads" className="text-xs font-medium text-gold-600 hover:text-gold-700">
              View all →
            </Link>
          </div>
          <Table>
            <Thead>
              <tr>
                <Th>Name</Th>
                <Th>Phone</Th>
                <Th>Source</Th>
                <Th>Status</Th>
              </tr>
            </Thead>
            <tbody>
              {recentLeads.length === 0 && <EmptyState message="No leads yet." />}
              {recentLeads.map((lead) => (
                <Tr key={lead.id}>
                  <Td className="font-medium text-navy-900">{lead.fullName}</Td>
                  <Td>{lead.mobileNumber}</Td>
                  <Td>{lead.session?.utmSource ?? lead.source ?? "direct"}</Td>
                  <Td>
                    <span className="rounded-full bg-navy-50 px-2 py-0.5 text-xs font-medium capitalize text-navy-700">
                      {lead.status}
                    </span>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
}
