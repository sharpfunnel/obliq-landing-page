import Link from "next/link";
import PageHeader from "@/components/admin/PageHeader";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/admin/Table";
import LeadStatusSelect from "@/components/admin/LeadStatusSelect";
import { getLeadFilterOptions, getLeads } from "@/lib/admin/queries";
import { LEAD_STATUSES } from "@/lib/admin/constants";
import { countryName } from "@/lib/geo/country-coords";

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
  searchParams: Promise<{ status?: string; search?: string; source?: string; country?: string; device?: string }>;
}) {
  const { status, search, source, country, device } = await searchParams;
  const [leads, filterOptions] = await Promise.all([
    getLeads({ status, search, source, country, device }),
    getLeadFilterOptions(),
  ]);

  return (
    <div>
      <PageHeader title="Leads" description={`${leads.length} lead${leads.length === 1 ? "" : "s"} matching the current filters`} />

      <div className="mb-4 flex flex-wrap gap-2">
        {["all", ...LEAD_STATUSES].map((s) => {
          const active = (status ?? "all") === s;
          const params = new URLSearchParams();
          if (s !== "all") params.set("status", s);
          if (search) params.set("search", search);
          if (source) params.set("source", source);
          if (country) params.set("country", country);
          if (device) params.set("device", device);
          const qs = params.toString();
          return (
            <Link
              key={s}
              href={qs ? `/admin/leads?${qs}` : "/admin/leads"}
              className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition ${
                active ? "bg-gold-500 text-navy-950" : "bg-white text-navy-600 ring-1 ring-navy-200 hover:bg-navy-50"
              }`}
            >
              {s}
            </Link>
          );
        })}
      </div>

      <form className="mb-4 flex flex-wrap items-center gap-2" method="GET">
        {status && <input type="hidden" name="status" value={status} />}
        <input
          type="text"
          name="search"
          defaultValue={search ?? ""}
          placeholder="Name, phone or email…"
          className="rounded-lg border border-navy-200 px-3 py-1.5 text-xs focus:border-gold-500 focus:outline-none"
        />
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
            <Th>Date</Th>
            <Th>Name</Th>
            <Th>Phone</Th>
            <Th>Budget</Th>
            <Th>Config</Th>
            <Th>Location</Th>
            <Th>Source / UTM</Th>
            <Th>Status</Th>
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
              <Td className="font-medium text-navy-900" title={lead.message ?? undefined}>
                {lead.fullName}
              </Td>
              <Td>
                <a href={`tel:${lead.mobileNumber}`} className="text-gold-600 hover:underline">
                  {lead.mobileNumber}
                </a>
                {lead.email && <div className="text-xs text-navy-400">{lead.email}</div>}
              </Td>
              <Td className="text-xs">{lead.budget ?? <span className="text-navy-300">—</span>}</Td>
              <Td className="text-xs">
                {lead.interestedIn && <div className="font-medium text-navy-800">{lead.interestedIn}</div>}
                {lead.configuration && <div className="text-navy-500">{lead.configuration}</div>}
                {!lead.interestedIn && !lead.configuration && <span className="text-navy-300">—</span>}
              </Td>
              <Td className="text-xs">
                {lead.visitor?.city ? (
                  <>
                    {lead.visitor.city}
                    {lead.visitor.country ? `, ${countryName(lead.visitor.country)}` : ""}
                  </>
                ) : (
                  <span className="text-navy-300">—</span>
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
            </Tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
