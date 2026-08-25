import Link from "next/link";
import { DollarSign, Eye, MousePointerClick, Percent, CreditCard, Target, Users, TrendingDown } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import StatTile from "@/components/admin/StatTile";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/admin/Table";
import MetaSyncButton from "@/components/admin/MetaSyncButton";
import MetaDisconnectButton from "@/components/admin/MetaDisconnectButton";
import { getMetaAdAccounts, getMetaSummaryStats, getCampaignPerformance } from "@/lib/meta/queries";

export const dynamic = "force-dynamic";

export default async function AdminCampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const [accounts, stats, campaigns] = await Promise.all([
    getMetaAdAccounts(),
    getMetaSummaryStats(30),
    getCampaignPerformance(30),
  ]);

  const connected = accounts.some((a) => a.accessToken);

  return (
    <div>
      <PageHeader
        title="Campaigns"
        description="Meta Ads spend cross-referenced with real on-site conversions."
        actions={connected ? <MetaSyncButton /> : undefined}
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
      )}

      {!connected && (
        <div className="mb-6 rounded-xl border border-dashed border-navy-300 bg-white p-8 text-center">
          <p className="text-sm font-medium text-navy-700">No Meta Ad Account connected yet.</p>
          <p className="mt-1 text-xs text-navy-400">
            Connect an account to sync campaign spend and cross-reference it with real leads.
          </p>
          <a
            href="/api/meta/oauth/start"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-gold-500 px-4 py-2 text-xs font-semibold text-navy-950 transition hover:bg-gold-400"
          >
            Connect Meta Ad Account
          </a>
        </div>
      )}

      {connected && (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatTile icon={DollarSign} label="Spend" value={`₹${stats.spend.toLocaleString()}`} />
            <StatTile icon={Eye} label="Impressions" value={stats.impressions.toLocaleString()} />
            <StatTile icon={MousePointerClick} label="Clicks" value={stats.clicks.toLocaleString()} />
            <StatTile icon={Percent} label="CTR" value={`${stats.ctr}%`} />
            <StatTile icon={CreditCard} label="CPC" value={`₹${stats.cpc}`} />
            <StatTile icon={Target} label="Meta Leads" value={stats.metaLeads} />
            <StatTile icon={Users} label="On-Site Leads" value={stats.onSiteLeads} />
            <StatTile icon={TrendingDown} label="True CPL" value={stats.trueCostPerLead !== null ? `₹${stats.trueCostPerLead}` : "—"} />
          </div>

          <div className="mb-6 space-y-2">
            {accounts.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-xl border border-navy-200 bg-white px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-navy-900">{a.name ?? a.accountId}</p>
                  <p className="text-xs text-navy-400">
                    {a.currency} · {a.accessToken ? "Connected" : "Disconnected"}
                    {a.lastSyncedAt && ` · Last synced ${a.lastSyncedAt.toLocaleString()}`}
                    {a.lastSyncError && ` · Error: ${a.lastSyncError}`}
                  </p>
                </div>
                {a.accessToken && <MetaDisconnectButton accountId={a.id} />}
              </div>
            ))}
          </div>

          <Table>
            <Thead>
              <tr>
                <Th>Campaign</Th>
                <Th>Status</Th>
                <Th className="text-right">Spend</Th>
                <Th className="text-right">Impressions</Th>
                <Th className="text-right">Clicks</Th>
                <Th className="text-right">Meta Results</Th>
                <Th className="text-right">On-Site Sessions</Th>
                <Th className="text-right">On-Site Leads</Th>
                <Th className="text-right">True CPL</Th>
              </tr>
            </Thead>
            <tbody>
              {campaigns.length === 0 && <EmptyState message="No campaigns synced yet." />}
              {campaigns.map((c) => (
                <Tr key={c.id}>
                  <Td>
                    <Link href={`/admin/campaigns/${c.id}`} className="font-medium text-gold-600 hover:text-gold-700">
                      {c.name}
                    </Link>
                  </Td>
                  <Td className="text-xs capitalize text-navy-500">{c.status?.toLowerCase() ?? "—"}</Td>
                  <Td className="text-right">₹{c.spend.toLocaleString()}</Td>
                  <Td className="text-right">{c.impressions.toLocaleString()}</Td>
                  <Td className="text-right">{c.clicks.toLocaleString()}</Td>
                  <Td className="text-right">{c.metaResults}</Td>
                  <Td className="text-right">{c.onSiteSessions}</Td>
                  <Td className="text-right">{c.onSiteLeads}</Td>
                  <Td className="text-right">{c.trueCostPerLead !== null ? `₹${c.trueCostPerLead}` : "—"}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
    </div>
  );
}
