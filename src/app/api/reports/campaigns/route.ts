import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth/dal";
import { resolveReportRange } from "@/lib/admin/reports";
import { getCampaignPerformance } from "@/lib/meta/queries";
import { buildCsv } from "@/lib/reports/csv";
import { buildWorkbookBuffer } from "@/lib/reports/excel";

export const runtime = "nodejs";

const HEADERS = [
  "Campaign",
  "Status",
  "Account",
  "Spend",
  "Impressions",
  "Clicks",
  "Meta Results",
  "On-Site Sessions",
  "On-Site Leads",
  "True Cost / Lead",
];

export async function GET(request: NextRequest) {
  await verifyAdminSession();

  const searchParams = request.nextUrl.searchParams;
  const format = searchParams.get("format") ?? "csv";
  const range = resolveReportRange(searchParams);
  const days = Math.max(1, Math.round((range.to.getTime() - range.from.getTime()) / 86400_000));

  const campaigns = await getCampaignPerformance(days);
  const rows = campaigns.map((c) => [
    c.name,
    c.status ?? "",
    c.accountName ?? "",
    c.spend,
    c.impressions,
    c.clicks,
    c.metaResults,
    c.onSiteSessions,
    c.onSiteLeads,
    c.trueCostPerLead ?? "",
  ]);

  const filenameBase = `campaigns_${range.label}`;

  if (format === "xlsx") {
    const buffer = await buildWorkbookBuffer("Campaigns", HEADERS, rows);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filenameBase}.xlsx"`,
      },
    });
  }

  const csv = buildCsv(HEADERS, rows);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filenameBase}.csv"`,
    },
  });
}
