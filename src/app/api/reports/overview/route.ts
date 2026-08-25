import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth/dal";
import { getReportOverview, resolveReportRange } from "@/lib/admin/reports";
import { getTrafficSources } from "@/lib/admin/queries";
import { buildCsv } from "@/lib/reports/csv";
import { buildWorkbookBuffer } from "@/lib/reports/excel";
import { buildSummaryPdf } from "@/lib/reports/pdf";
import { SITE } from "@/lib/content";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  await verifyAdminSession();

  const searchParams = request.nextUrl.searchParams;
  const format = searchParams.get("format") ?? "csv";
  const range = resolveReportRange(searchParams);

  const [overview, sources] = await Promise.all([
    getReportOverview(range),
    getTrafficSources(Math.round((range.to.getTime() - range.from.getTime()) / 86400_000)),
  ]);

  const filenameBase = `overview_${range.label}`;

  if (format === "xlsx") {
    const buffer = await buildWorkbookBuffer(
      "Overview",
      ["Source", "Medium", "Campaign", "Sessions", "Leads"],
      sources.map((s) => [s.source, s.medium, s.campaign, s.sessions, s.leads])
    );
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filenameBase}.xlsx"`,
      },
    });
  }

  if (format === "pdf") {
    const buffer = await buildSummaryPdf({
      title: `${SITE.projectName} — Overview Report`,
      subtitle: `Range: ${range.from.toDateString()} – ${range.to.toDateString()}`,
      stats: [
        { label: "Visitors", value: overview.visitors },
        { label: "Sessions", value: overview.sessions },
        { label: "Leads", value: overview.leads },
        { label: "Conversion Rate", value: `${overview.conversionRate}%` },
        { label: "Scrolled 50%+", value: overview.scrolledHalf },
        { label: "CTA Clicks", value: overview.ctaClicks },
      ],
      table: {
        headers: ["Source", "Medium", "Campaign", "Sessions", "Leads"],
        rows: sources.slice(0, 30).map((s) => [s.source, s.medium, s.campaign, s.sessions, s.leads]),
      },
    });
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filenameBase}.pdf"`,
      },
    });
  }

  const csv = buildCsv(
    ["Source", "Medium", "Campaign", "Sessions", "Leads"],
    sources.map((s) => [s.source, s.medium, s.campaign, s.sessions, s.leads])
  );
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filenameBase}.csv"`,
    },
  });
}
