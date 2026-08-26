import Link from "next/link";
import { Video, FileText, Activity, UserCheck, LogOut, Clock } from "lucide-react";
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
            <Th>Time</Th>
            <Th>Visitor</Th>
            <Th>Location</Th>
            <Th>Source</Th>
            <Th>Pages</Th>
            <Th>Duration</Th>
            <Th>Bounce</Th>
            <Th>Details</Th>
            <Th>Replay</Th>
          </tr>
        </Thead>
        <tbody>
          {sessions.length === 0 && <EmptyState message="No sessions recorded yet." />}
          {sessions.map((s) => (
            <Tr key={s.id}>
              <Td className="whitespace-nowrap text-xs text-navy-500">
                {s.startedAt.toLocaleDateString()} {s.startedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </Td>
              <Td className="text-xs">
                <div className="font-medium text-navy-800">
                  {s.visitor.deviceType ?? "unknown"} · {s.visitor.browser ?? "?"} / {s.visitor.os ?? "?"}
                </div>
                <div className="text-navy-400">{s.visitor.isReturning ? "Returning" : "New"} · {s.ipAddress ?? "—"}</div>
              </Td>
              <Td className="text-xs text-navy-500">
                {[s.visitor.city, s.visitor.region, countryName(s.visitor.country)].filter(Boolean).join(", ") || "—"}
              </Td>
              <Td className="text-xs">
                {s.utmSource ?? (s.referrer ? new URL(s.referrer).hostname : "direct")}
                {s.utmCampaign && <div className="text-navy-400">{s.utmCampaign}</div>}
              </Td>
              <Td className="text-center">{s.pagesViewed}</Td>
              <Td>{fmtDuration(s.totalDuration)}</Td>
              <Td>
                {s.isBounce ? (
                  <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">Bounce</span>
                ) : (
                  <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600">Engaged</span>
                )}
              </Td>
              <Td>
                <Link
                  href={`/admin/sessions/${s.id}`}
                  className="flex items-center gap-1 text-xs font-medium text-navy-500 hover:text-navy-800"
                >
                  <FileText className="h-3.5 w-3.5" /> Details
                </Link>
              </Td>
              <Td>
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
            </Tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
