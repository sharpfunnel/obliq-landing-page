import { gunzipSync } from "node:zlib";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import ReplayPlayer from "@/components/admin/ReplayPlayer";
import { getSessionReplayMeta } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function SessionReplayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSessionReplayMeta(id);
  if (!session) notFound();

  const events = session.replays.flatMap((chunk) => {
    try {
      const json = gunzipSync(Buffer.from(chunk.data)).toString("utf-8");
      return JSON.parse(json) as unknown[];
    } catch (error) {
      console.error("Failed to decompress replay chunk:", error);
      return [];
    }
  });

  return (
    <div>
      <Link href="/admin/sessions" className="mb-4 flex items-center gap-1 text-xs font-medium text-navy-500 hover:text-navy-900">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to sessions
      </Link>

      <PageHeader
        title="Session Replay"
        description={`${session.visitor.browser ?? "?"} / ${session.visitor.os ?? "?"} · ${session.visitor.city ?? "Unknown"} · Started ${session.startedAt.toLocaleString()}`}
      />

      <ReplayPlayer events={events} />
    </div>
  );
}
