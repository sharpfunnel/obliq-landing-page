import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/admin/Table";
import LeadStatusSelect from "@/components/admin/LeadStatusSelect";
import ResendCapiButton from "@/components/admin/ResendCapiButton";
import { getLeads } from "@/lib/admin/queries";
import { LEAD_STATUSES } from "@/lib/admin/constants";

export const dynamic = "force-dynamic";

function formatRawParams(raw: unknown): string | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const entries = Object.entries(raw as Record<string, string>);
  if (entries.length === 0) return undefined;
  return entries.map(([k, v]) => `${k}=${v}`).join("\n");
}

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const leads = await getLeads(status);

  return (
    <div>
      <PageHeader title="Leads" description={`${leads.length} lead${leads.length === 1 ? "" : "s"}`} />

      <div className="mb-4 flex flex-wrap gap-2">
        {["all", ...LEAD_STATUSES].map((s) => {
          const active = (status ?? "all") === s;
          return (
            <Link
              key={s}
              href={s === "all" ? "/admin/leads" : `/admin/leads?status=${s}`}
              className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition ${
                active ? "bg-gold-500 text-navy-950" : "bg-white text-navy-600 ring-1 ring-navy-200 hover:bg-navy-50"
              }`}
            >
              {s}
            </Link>
          );
        })}
      </div>

      <Table>
        <Thead>
          <tr>
            <Th>Date</Th>
            <Th>Name</Th>
            <Th>Phone</Th>
            <Th>Details</Th>
            <Th>Attribution</Th>
            <Th>Status</Th>
            <Th>Meta CAPI</Th>
          </tr>
        </Thead>
        <tbody>
          {leads.length === 0 && <EmptyState message="No leads match this filter." />}
          {leads.map((lead) => (
            <Tr key={lead.id}>
              <Td className="whitespace-nowrap text-xs text-navy-500">
                {lead.createdAt.toLocaleDateString()}
                <br />
                {lead.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </Td>
              <Td className="font-medium text-navy-900">{lead.fullName}</Td>
              <Td>
                <a href={`tel:${lead.mobileNumber}`} className="text-gold-600 hover:underline">
                  {lead.mobileNumber}
                </a>
                {lead.email && <div className="text-xs text-navy-400">{lead.email}</div>}
              </Td>
              <Td className="max-w-[220px] text-xs">
                {lead.configuration && <div>Config: {lead.configuration}</div>}
                {lead.budget && <div>Budget: {lead.budget}</div>}
                {lead.message && <div className="truncate text-navy-400" title={lead.message}>{lead.message}</div>}
                {lead.visitor?.city && (
                  <div className="text-navy-400">
                    {lead.visitor.city}
                    {lead.visitor.country ? `, ${lead.visitor.country}` : ""}
                  </div>
                )}
              </Td>
              <Td className="max-w-[200px] text-xs" title={formatRawParams(lead.session?.rawParams)}>
                {lead.session?.utmSource ? (
                  <>
                    <div>
                      {lead.session.utmSource}/{lead.session.utmMedium}
                      {lead.session.utmCampaign && ` · ${lead.session.utmCampaign}`}
                    </div>
                    {(lead.session.utmContent || lead.session.utmTerm) && (
                      <div className="text-navy-400">
                        {lead.session.utmContent && `ad: ${lead.session.utmContent}`}
                        {lead.session.utmContent && lead.session.utmTerm && " · "}
                        {lead.session.utmTerm && `adset: ${lead.session.utmTerm}`}
                      </div>
                    )}
                  </>
                ) : (
                  <span className="text-navy-400">{lead.source ?? "direct"}</span>
                )}
              </Td>
              <Td>
                <LeadStatusSelect leadId={lead.id} status={lead.status} />
              </Td>
              <Td>
                <div className="flex items-center gap-2">
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
                  <ResendCapiButton leadId={lead.id} />
                </div>
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
