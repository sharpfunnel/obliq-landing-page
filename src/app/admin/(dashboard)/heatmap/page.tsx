import Link from "next/link";
import PageHeader from "@/components/admin/PageHeader";
import HeatmapOverlay from "@/components/admin/HeatmapOverlay";
import { getHeatmapPaths, getHeatmapPoints } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function AdminHeatmapPage({
  searchParams,
}: {
  searchParams: Promise<{ path?: string; type?: string }>;
}) {
  const { path: pathParam, type: typeParam } = await searchParams;
  const paths = await getHeatmapPaths();
  const path = pathParam ?? paths[0]?.path ?? "/";
  const type = typeParam === "hover" ? "hover" : "click";

  const points = await getHeatmapPoints(path, type);

  return (
    <div>
      <PageHeader title="Heatmap" description="Click density overlaid on the live page." />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {paths.length === 0 && <span className="text-sm text-navy-400">No heatmap data yet.</span>}
          {paths.map((p) => (
            <Link
              key={p.path}
              href={`/admin/heatmap?path=${encodeURIComponent(p.path)}&type=${type}`}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                p.path === path ? "bg-gold-500 text-navy-950" : "bg-white text-navy-600 ring-1 ring-navy-200 hover:bg-navy-50"
              }`}
            >
              {p.path} ({p.count})
            </Link>
          ))}
        </div>

        <div className="flex gap-1 rounded-full bg-white p-1 ring-1 ring-navy-200">
          {(["click", "hover"] as const).map((t) => (
            <Link
              key={t}
              href={`/admin/heatmap?path=${encodeURIComponent(path)}&type=${t}`}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition ${
                type === t ? "bg-navy-900 text-white" : "text-navy-500 hover:text-navy-900"
              }`}
            >
              {t}
            </Link>
          ))}
        </div>
      </div>

      <HeatmapOverlay path={path} points={points} />
    </div>
  );
}
