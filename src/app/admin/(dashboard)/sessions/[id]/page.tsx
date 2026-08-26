import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Video } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import { getSessionDetail } from "@/lib/admin/queries";
import { countryName } from "@/lib/geo/country-coords";

export const dynamic = "force-dynamic";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-wide text-navy-400">{label}</dt>
      <dd className="mt-0.5 text-sm text-navy-800">{value ?? "—"}</dd>
    </div>
  );
}

function fmtDuration(seconds: number | null) {
  if (seconds === null) return "—";
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

export default async function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getSessionDetail(id);
  if (!detail) notFound();

  const { session, maxScrollPct, avgScrollPct, mouseEventCount, ctaClicks, formStarted, formSubmitted } = detail;
  const { visitor } = session;

  const landingPage = session.pageViews[0]?.path ?? session.entryPath;
  const currentPage = session.pageViews[session.pageViews.length - 1]?.path ?? session.exitPath;

  return (
    <div>
      <Link href="/admin/sessions" className="mb-4 flex items-center gap-1 text-xs font-medium text-navy-500 hover:text-navy-900">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to sessions
      </Link>

      <PageHeader
        title="Session details"
        description={`Started ${session.startedAt.toLocaleString()}`}
        actions={
          session._count.replays > 0 ? (
            <Link
              href={`/admin/sessions/${session.id}/replay`}
              className="flex items-center gap-1.5 rounded-lg bg-navy-900 px-3 py-2 text-xs font-semibold text-white hover:bg-navy-800"
            >
              <Video className="h-3.5 w-3.5" /> Watch replay
            </Link>
          ) : undefined
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-navy-200 bg-white p-4">
          <h2 className="mb-4 text-sm font-bold text-navy-900">Visit</h2>
          <dl className="grid grid-cols-2 gap-4">
            <Field label="Landing page" value={landingPage} />
            <Field label="Current page" value={currentPage} />
            <Field label="Pages viewed" value={session.pagesViewed} />
            <Field label="Duration" value={fmtDuration(session.totalDuration)} />
            <Field label="Bounce" value={session.isBounce ? "Yes" : "No"} />
            <Field label="Referrer" value={session.referrer || "Direct"} />
            <Field label="Visitor type" value={visitor.isReturning ? "Returning" : "New"} />
            <Field label="Avg scroll depth" value={`${avgScrollPct}%`} />
            <Field label="Max scroll depth" value={`${maxScrollPct}%`} />
            <Field label="Mouse events" value={mouseEventCount} />
            <Field label="CTA clicked" value={ctaClicks} />
            <Field label="Form started" value={formStarted ? "Yes" : "No"} />
            <Field label="Form submitted" value={formSubmitted ? "Yes" : "No"} />
          </dl>
        </div>

        <div className="rounded-xl border border-navy-200 bg-white p-4">
          <h2 className="mb-4 text-sm font-bold text-navy-900">Attribution</h2>
          <dl className="grid grid-cols-2 gap-4">
            <Field label="UTM Source" value={session.utmSource} />
            <Field label="UTM Medium" value={session.utmMedium} />
            <Field label="UTM Campaign" value={session.utmCampaign} />
            <Field label="UTM Content" value={session.utmContent} />
            <Field label="UTM Term" value={session.utmTerm} />
            <Field label="Placement" value={session.placement} />
            <Field label="Meta Ad ID" value={session.metaAdId} />
            <Field label="Google Click ID" value={session.gclid} />
            <Field label="Facebook Click ID" value={session.fbclid} />
          </dl>
        </div>

        <div className="rounded-xl border border-navy-200 bg-white p-4">
          <h2 className="mb-4 text-sm font-bold text-navy-900">Device & environment</h2>
          <dl className="grid grid-cols-2 gap-4">
            <Field label="Device" value={visitor.deviceType} />
            <Field label="Browser" value={visitor.browser ? `${visitor.browser} ${visitor.browserVersion ?? ""}`.trim() : null} />
            <Field label="OS" value={visitor.os ? `${visitor.os} ${visitor.osVersion ?? ""}`.trim() : null} />
            <Field label="Screen resolution" value={visitor.screenWidth ? `${visitor.screenWidth}x${visitor.screenHeight}` : null} />
            <Field label="Viewport" value={session.viewportWidth ? `${session.viewportWidth}x${session.viewportHeight}` : null} />
            <Field label="Language" value={visitor.language} />
            <Field label="Timezone" value={visitor.timezone} />
            <Field
              label="Connection"
              value={visitor.connectionType ? `${visitor.connectionType}${visitor.connectionDownlink ? ` · ${visitor.connectionDownlink} Mbps` : ""}` : null}
            />
          </dl>
        </div>

        <div className="rounded-xl border border-navy-200 bg-white p-4">
          <h2 className="mb-4 text-sm font-bold text-navy-900">Identity & location</h2>
          <dl className="grid grid-cols-2 gap-4">
            <Field label="City" value={visitor.city} />
            <Field label="Region" value={visitor.region} />
            <Field label="Country" value={countryName(visitor.country)} />
            <Field label="IP address" value={session.ipAddress} />
            <Field label="Session ID" value={<span className="break-all font-mono text-xs">{session.id}</span>} />
            <Field label="Visitor ID" value={<span className="break-all font-mono text-xs">{visitor.id}</span>} />
          </dl>
        </div>
      </div>

      {session.pageViews.length > 0 && (
        <div className="mt-6 rounded-xl border border-navy-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-bold text-navy-900">Page views</h2>
          <ol className="space-y-2 text-xs">
            {session.pageViews.map((pv, i) => (
              <li key={i} className="flex items-center justify-between border-b border-navy-50 pb-2 last:border-0">
                <span className="font-medium text-navy-800">{pv.path}</span>
                <span className="text-navy-400">
                  {pv.enteredAt.toLocaleTimeString()} {pv.timeOnPage ? `· ${pv.timeOnPage}s` : ""}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
