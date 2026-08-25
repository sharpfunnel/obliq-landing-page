import Link from "next/link";
import { Video } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/admin/Table";
import { getSessions } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

function fmtDuration(seconds: number | null) {
  if (seconds === null) return "—";
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

export default async function AdminSessionsPage() {
  const sessions = await getSessions(100);

  return (
    <div>
      <PageHeader title="Sessions" description={`Last ${sessions.length} sessions`} />

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
                {[s.visitor.city, s.visitor.region, s.visitor.country].filter(Boolean).join(", ") || "—"}
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
