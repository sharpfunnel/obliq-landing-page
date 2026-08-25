import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/admin/Table";
import { getCampaignDetail } from "@/lib/meta/queries";

export const dynamic = "force-dynamic";

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const campaign = await getCampaignDetail(id, 30);
  if (!campaign) notFound();

  return (
    <div>
      <Link href="/admin/campaigns" className="mb-4 flex items-center gap-1 text-xs font-medium text-navy-500 hover:text-navy-900">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to campaigns
      </Link>

      <PageHeader
        title={campaign.name}
        description={`${campaign.accountName ?? ""} · ${campaign.objective ?? "—"} · Spend: ₹${campaign.spend.toLocaleString()}`}
      />

      {campaign.adSets.map((adSet) => (
        <div key={adSet.id} className="mb-6">
          <h2 className="mb-2 text-sm font-bold text-navy-900">
            {adSet.name} <span className="font-normal text-navy-400">· ₹{adSet.spend.toLocaleString()} spend</span>
          </h2>
          <Table>
            <Thead>
              <tr>
                <Th>Ad</Th>
                <Th className="text-right">Spend</Th>
                <Th className="text-right">Impressions</Th>
                <Th className="text-right">Clicks</Th>
                <Th className="text-right">CTR</Th>
                <Th className="text-right">CPC</Th>
                <Th className="text-right">CPM</Th>
                <Th className="text-right">Results</Th>
              </tr>
            </Thead>
            <tbody>
              {adSet.ads.length === 0 && <EmptyState message="No ads in this ad set." />}
              {adSet.ads.map((ad) => (
                <Tr key={ad.id}>
                  <Td>
                    <div className="flex items-center gap-2">
                      {ad.thumbnailUrl && (
                        <Image src={ad.thumbnailUrl} alt="" width={32} height={32} className="rounded-md object-cover" unoptimized />
                      )}
                      <div>
                        <p className="font-medium text-navy-900">{ad.name}</p>
                        {ad.headline && <p className="text-xs text-navy-400">{ad.headline}</p>}
                      </div>
                    </div>
                  </Td>
                  <Td className="text-right">₹{ad.spend.toLocaleString()}</Td>
                  <Td className="text-right">{ad.impressions.toLocaleString()}</Td>
                  <Td className="text-right">{ad.clicks.toLocaleString()}</Td>
                  <Td className="text-right">{ad.ctr}%</Td>
                  <Td className="text-right">₹{ad.cpc}</Td>
                  <Td className="text-right">₹{ad.cpm}</Td>
                  <Td className="text-right">{ad.results}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </div>
      ))}

      {campaign.adSets.length === 0 && <p className="text-sm text-navy-400">No ad sets synced for this campaign yet.</p>}
    </div>
  );
}
