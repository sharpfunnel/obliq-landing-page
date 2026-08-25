import Link from "next/link";
import PageHeader from "@/components/admin/PageHeader";
import ConversionFunnel from "@/components/admin/ConversionFunnel";
import { getFunnelStats } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function AdminFunnelsPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string }>;
}) {
  const { source: sourceParam } = await searchParams;
  const source = sourceParam === "meta" ? "meta" : "all";
  const funnel = await getFunnelStats(30, source);

  return (
    <div>
      <PageHeader title="Funnels" description="Ad click → page view → scroll → CTA → form → lead, last 30 days." />

      <div className="mb-4 flex gap-1 rounded-full bg-white p-1 ring-1 ring-navy-200" style={{ width: "fit-content" }}>
        {(["all", "meta"] as const).map((s) => (
          <Link
            key={s}
            href={`/admin/funnels?source=${s}`}
            className={`rounded-full px-4 py-1.5 text-xs font-medium capitalize transition ${
              source === s ? "bg-navy-900 text-white" : "text-navy-500 hover:text-navy-900"
            }`}
          >
            {s === "all" ? "All Traffic" : "Meta Ads Only"}
          </Link>
        ))}
      </div>

      <div className="max-w-2xl rounded-xl border border-navy-200 bg-white p-6">
        <ConversionFunnel stages={funnel.stages} />
      </div>
    </div>
  );
}
