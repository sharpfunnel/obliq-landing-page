import Link from "next/link";
import { Video, Activity, UserCheck, LogOut, Clock } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import StatTile from "@/components/admin/StatTile";
import RangeSwitcher from "@/components/admin/RangeSwitcher";
import LiveIndicator from "@/components/admin/LiveIndicator";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/admin/Table";
import { getLeadFilterOptions, getLiveVisitorCount, getSessionStats, getSessions } from "@/lib/admin/queries";
import { rangeToDays } from "@/lib/admin/constants";
import { countryName } from "@/lib/geo/country-coords";

export const dynamic = "force-dynamic";

function fmtDuration(seconds: number | null) {
  if (seconds === null) return "—";
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

function fmtTimeAgo(date: Date) {
  const seconds = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function trafficSource(s: { utmSource: string | null; referrer: string | null }) {
  if (s.utmSource) return s.utmSource;
  if (s.referrer) {
    try {
      return new URL(s.referrer).hostname.replace(/^www\./, "");
    } catch {
      return "referral";
    }
  }
  return "Direct";
}

export default async function AdminSessionsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; status?: string; source?: string; country?: string; device?: string }>;
}) {
  const { range, status, source, country, device } = await searchParams;
  const days = rangeToDays(range);

  const [sessions, stats, liveCount, filterOptions] = await Promise.all([
    getSessions({ days, status: status as "all" | "bounced" | "engaged" | undefined, source, country, device }),
    getSessionStats(days),
    getLiveVisitorCount(),
    getLeadFilterOptions(),
  ]);

  return (
    <div>
      <PageHeader
        title="Sessions"
        description="Every visit, with the technical and behavioural context behind it."
        actions={
          <>
            <LiveIndicator initialCount={liveCount} />
            <RangeSwitcher basePath="/admin/sessions" current={range ?? "30d"} />
          </>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile icon={Activity} label="Sessions" value={stats.total} />
        <StatTile
          icon={UserCheck}
          label="Converted"
          value={stats.total > 0 ? `${Math.round((stats.converted / stats.total) * 100)}%` : "0%"}
        />
        <StatTile
          icon={LogOut}
          label="Bounced"
          value={stats.total > 0 ? `${Math.round((stats.bounced / stats.total) * 100)}%` : "0%"}
        />
        <StatTile icon={Clock} label="Avg. Duration" value={fmtDuration(stats.avgDurationSeconds)} />
      </div>

      <form className="mb-4 flex flex-wrap items-center gap-2" method="GET">
        {range && <input type="hidden" name="range" value={range} />}
        <select name="status" defaultValue={status ?? "all"} className="rounded-lg border border-navy-200 px-2 py-1.5 text-xs">
          <option value="all">Status: All</option>
          <option value="engaged">Engaged</option>
          <option value="bounced">Bounced</option>
        </select>
        <select name="source" defaultValue={source ?? "all"} className="rounded-lg border border-navy-200 px-2 py-1.5 text-xs">
          <option value="all">Source: All</option>
          {filterOptions.sources.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select name="country" defaultValue={country ?? "all"} className="rounded-lg border border-navy-200 px-2 py-1.5 text-xs">
          <option value="all">Country: All</option>
          {filterOptions.countries.map((c) => (
            <option key={c} value={c}>
              {countryName(c)}
            </option>
          ))}
        </select>
        <select name="device" defaultValue={device ?? "all"} className="rounded-lg border border-navy-200 px-2 py-1.5 text-xs">
          <option value="all">Device: All</option>
          {filterOptions.devices.map((d) => (
            <option key={d} value={d} className="capitalize">
              {d}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-lg bg-navy-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy-800">
          Filter
        </button>
      </form>

      <Table>
        <Thead>
          <tr>
            <Th>Replay</Th>
            <Th>Status</Th>
            <Th>Date</Th>
            <Th>Time</Th>
            <Th>Time Ago</Th>
            <Th>Campaign</Th>
            <Th>Traffic Source</Th>
            <Th>UTM Source</Th>
            <Th>UTM Medium</Th>
            <Th>UTM Content</Th>
            <Th>Placement</Th>
            <Th>Referrer</Th>
            <Th>Visitor Type</Th>
            <Th>Landing Page</Th>
            <Th>Current Page</Th>
            <Th>Pages Viewed</Th>
            <Th>Duration</Th>
            <Th>Form Started</Th>
            <Th>Form Submitted</Th>
            <Th>CTA Clicked</Th>
            <Th>Bounce</Th>
            <Th>Avg Scroll %</Th>
            <Th>Max Scroll %</Th>
            <Th>Mouse Clicks</Th>
            <Th>Mouse Movements</Th>
            <Th>Country</Th>
            <Th>City</Th>
            <Th>Region</Th>
            <Th>Timezone</Th>
            <Th>Device</Th>
            <Th>Operating System</Th>
            <Th>Browser</Th>
            <Th>Screen Resolution</Th>
            <Th>Language</Th>
            <Th>Network</Th>
            <Th>IP Address</Th>
            <Th>Session ID</Th>
            <Th>Visitor ID</Th>
          </tr>
        </Thead>
        <tbody>
          {sessions.length === 0 && <EmptyState message="No sessions recorded yet." />}
          {sessions.map((s) => {
            const network = s.visitor.connectionType
              ? `${s.visitor.connectionType}${s.visitor.connectionDownlink ? ` ${s.visitor.connectionDownlink}Mbps` : ""}`
              : "—";
            return (
              <Tr key={s.id}>
                <Td className="whitespace-nowrap">
                  {s._count.replays > 0 ? (
                    <Link
                      href={`/admin/sessions/${s.id}/replay`}
                      className="flex items-center gap-1 text-xs font-medium text-gold-600 hover:text-gold-700"
                    >
                      <Video className="h-3.5 w-3.5" /> Watch
                    </Link>
                  ) : (
                    <span className="text-xs text-navy-300">—</span>
                  )}
                </Td>
                <Td className="whitespace-nowrap">
                  {s.isBounce ? (
                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">Bounced</span>
                  ) : (
                    <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600">Completed</span>
                  )}
                </Td>
                <Td className="whitespace-nowrap text-xs text-navy-500">{s.startedAt.toLocaleDateString()}</Td>
                <Td className="whitespace-nowrap text-xs text-navy-500">
                  {s.startedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </Td>
                <Td className="whitespace-nowrap text-xs text-navy-400">{fmtTimeAgo(s.startedAt)}</Td>
                <Td className="whitespace-nowrap text-xs">{s.utmCampaign ?? "—"}</Td>
                <Td className="whitespace-nowrap text-xs">{trafficSource(s)}</Td>
                <Td className="whitespace-nowrap text-xs">{s.utmSource ?? "—"}</Td>
                <Td className="whitespace-nowrap text-xs">{s.utmMedium ?? "—"}</Td>
                <Td className="max-w-[160px] truncate text-xs" title={s.utmContent ?? undefined}>
                  {s.utmContent ?? "—"}
                </Td>
                <Td className="whitespace-nowrap text-xs">{s.placement ?? "—"}</Td>
                <Td className="max-w-[160px] truncate text-xs" title={s.referrer ?? undefined}>
                  {s.referrer ?? "Direct"}
                </Td>
                <Td className="whitespace-nowrap text-xs">{s.visitor.isReturning ? "Returning" : "New"}</Td>
                <Td className="max-w-[160px] truncate text-xs" title={s.entryPath ?? undefined}>
                  {s.entryPath ?? "—"}
                </Td>
                <Td className="max-w-[160px] truncate text-xs" title={s.exitPath ?? s.entryPath ?? undefined}>
                  {s.exitPath ?? s.entryPath ?? "—"}
                </Td>
                <Td className="text-center text-xs">{s.pagesViewed}</Td>
                <Td className="whitespace-nowrap text-xs">{fmtDuration(s.totalDuration)}</Td>
                <Td className="text-center text-xs">{s.formStartedCount}</Td>
                <Td className="text-center text-xs">{s.formSubmittedCount}</Td>
                <Td className="text-center text-xs">{s.ctaClickedCount}</Td>
                <Td className={`whitespace-nowrap text-xs font-medium ${s.isBounce ? "text-red-600" : "text-navy-700"}`}>
                  {s.isBounce ? "Yes" : "No"}
                </Td>
                <Td className="text-center text-xs">{s.avgScrollPct}%</Td>
                <Td className="text-center text-xs">{s.maxScrollPct}%</Td>
                <Td className="text-center text-xs">{s.mouseClickCount}</Td>
                <Td className="text-center text-xs">{s.mouseMoveCount}</Td>
                <Td className="whitespace-nowrap text-xs">{countryName(s.visitor.country) ?? "—"}</Td>
                <Td className="whitespace-nowrap text-xs">{s.visitor.city ?? "—"}</Td>
                <Td className="whitespace-nowrap text-xs">{s.visitor.region ?? "—"}</Td>
                <Td className="whitespace-nowrap text-xs">{s.visitor.timezone ?? "—"}</Td>
                <Td className="whitespace-nowrap text-xs capitalize">{s.visitor.deviceType ?? "—"}</Td>
                <Td className="whitespace-nowrap text-xs">
                  {s.visitor.os ? `${s.visitor.os} ${s.visitor.osVersion ?? ""}`.trim() : "—"}
                </Td>
                <Td className="whitespace-nowrap text-xs">
                  {s.visitor.browser ? `${s.visitor.browser} ${s.visitor.browserVersion ?? ""}`.trim() : "—"}
                </Td>
                <Td className="whitespace-nowrap text-xs">
                  {s.visitor.screenWidth ? `${s.visitor.screenWidth}x${s.visitor.screenHeight}` : "—"}
                </Td>
                <Td className="whitespace-nowrap text-xs">{s.visitor.language ?? "—"}</Td>
                <Td className="whitespace-nowrap text-xs">{network}</Td>
                <Td className="whitespace-nowrap text-xs">{s.ipAddress ?? "—"}</Td>
                <Td className="whitespace-nowrap font-mono text-xs">
                  <Link href={`/admin/sessions/${s.id}`} className="text-gold-600 hover:underline">
                    {s.id}
                  </Link>
                </Td>
                <Td className="whitespace-nowrap font-mono text-xs">{s.visitor.id}</Td>
              </Tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}
