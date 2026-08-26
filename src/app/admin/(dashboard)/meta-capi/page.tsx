import { CheckCircle2, Fingerprint, FlaskConical, KeyRound, XCircle } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import StatTile from "@/components/admin/StatTile";
import CredentialStatusTile from "@/components/admin/CredentialStatusTile";
import ResendCapiButton from "@/components/admin/ResendCapiButton";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/admin/Table";
import { getMetaCapiStats, getLatestLeadForCapiPreview } from "@/lib/admin/queries";
import { resolveSecrets, SETTING_KEYS } from "@/lib/settings";
import { buildManualEventBody } from "@/lib/meta/capi-payload";
import { updateMetaCapiSettings } from "@/lib/meta/actions";

export const dynamic = "force-dynamic";

export default async function AdminMetaCapiPage() {
  const [stats, credentials, latestLead] = await Promise.all([
    getMetaCapiStats(30),
    resolveSecrets([
      { key: SETTING_KEYS.metaPixelId, envVarName: "META_PIXEL_ID" },
      { key: SETTING_KEYS.metaCapiAccessToken, envVarName: "META_CAPI_ACCESS_TOKEN" },
      { key: SETTING_KEYS.metaCapiTestEventCode, envVarName: "META_CAPI_TEST_EVENT_CODE" },
    ]),
    getLatestLeadForCapiPreview(),
  ]);

  const pixelId = credentials[SETTING_KEYS.metaPixelId];
  const accessToken = credentials[SETTING_KEYS.metaCapiAccessToken];
  const testEventCode = credentials[SETTING_KEYS.metaCapiTestEventCode];
  const configured = Boolean(pixelId && accessToken);

  const preview =
    configured && latestLead
      ? buildManualEventBody(latestLead, "***ACCESS_TOKEN***", {
          defaultCountryCode: "91",
          siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
          eventType: "Lead",
          testEventCode,
        })
      : null;

  return (
    <div>
      <PageHeader
        title="Meta Conversions API"
        description="Build and inspect payloads sent directly server-to-server, and see the delivery status of every automatic send."
      />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <CredentialStatusTile icon={KeyRound} label="Pixel ID" configured={Boolean(pixelId)} />
        <CredentialStatusTile icon={Fingerprint} label="Access Token" configured={Boolean(accessToken)} />
        <CredentialStatusTile icon={FlaskConical} label="Test Event Code" configured={Boolean(testEventCode)} />
        <CredentialStatusTile
          icon={CheckCircle2}
          label="Status"
          configured={configured}
          activeLabel="Configured"
          missingLabel="Not configured"
        />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatTile icon={CheckCircle2} label="Leads (30d)" value={stats.totalLeads} />
        <StatTile icon={CheckCircle2} label="Sent" value={stats.sent} />
        <StatTile icon={XCircle} label="Failed" value={stats.failed} />
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-navy-200 bg-white p-4">
          <h2 className="mb-1 text-sm font-bold text-navy-900">Credentials</h2>
          <p className="mb-4 text-xs text-navy-500">
            Saved here take priority over <code>META_PIXEL_ID</code> / <code>META_CAPI_ACCESS_TOKEN</code> /{" "}
            <code>META_CAPI_TEST_EVENT_CODE</code>. Leave Test Event Code blank once you&apos;re done verifying
            in Meta&apos;s Test Events tool — events sent with it never count toward real ad reporting.
          </p>
          <form action={updateMetaCapiSettings} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-navy-600">Pixel ID</label>
              <input
                type="text"
                name="pixelId"
                defaultValue={credentials[SETTING_KEYS.metaPixelId] ?? ""}
                placeholder={process.env.META_PIXEL_ID ? "Using environment variable" : "1234567890123456"}
                className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-gold-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-navy-600">Access token</label>
              <input
                type="password"
                name="accessToken"
                defaultValue={credentials[SETTING_KEYS.metaCapiAccessToken] ?? ""}
                placeholder={process.env.META_CAPI_ACCESS_TOKEN ? "Using environment variable" : "EAAG..."}
                className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-gold-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-navy-600">Test event code</label>
              <input
                type="text"
                name="testEventCode"
                defaultValue={credentials[SETTING_KEYS.metaCapiTestEventCode] ?? ""}
                placeholder="TEST12345"
                className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-gold-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-gold-500 px-4 py-2 text-xs font-semibold text-navy-950 transition hover:bg-gold-400"
            >
              Save
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-navy-200 bg-navy-950 p-4">
          <h2 className="mb-1 text-sm font-bold text-white">Preview</h2>
          <p className="mb-3 text-xs text-navy-400">
            {preview
              ? `The payload that would be sent for the most recent lead (${latestLead?.fullName}).`
              : "Configure Pixel ID + Access Token to preview a live payload."}
          </p>
          <pre className="max-h-80 overflow-auto rounded-lg bg-navy-900 p-3 text-[11px] leading-relaxed text-navy-200">
            {preview ? JSON.stringify(preview, null, 2) : "// no data yet"}
          </pre>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-bold text-navy-900">Delivery log</h2>
        <Table>
          <Thead>
            <tr>
              <Th>Date</Th>
              <Th>Lead</Th>
              <Th>Status</Th>
              <Th>Resend</Th>
            </tr>
          </Thead>
          <tbody>
            {stats.deliveryLog.length === 0 && <EmptyState message="No leads yet." />}
            {stats.deliveryLog.map((lead) => (
              <Tr key={lead.id}>
                <Td className="whitespace-nowrap text-xs text-navy-500">
                  {lead.createdAt.toLocaleDateString()} {lead.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </Td>
                <Td className="font-medium text-navy-900">{lead.fullName}</Td>
                <Td>
                  {lead.metaCapiSentAt ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-green-600" title={lead.metaCapiSentAt.toString()}>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Sent
                    </span>
                  ) : lead.metaCapiError ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-red-600" title={lead.metaCapiError}>
                      <XCircle className="h-3.5 w-3.5" /> Failed
                    </span>
                  ) : (
                    <span className="text-xs text-navy-400">—</span>
                  )}
                </Td>
                <Td>
                  <ResendCapiButton leadId={lead.id} />
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
}
