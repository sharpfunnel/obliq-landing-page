import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth/dal";
import { resolveReportRange } from "@/lib/admin/reports";
import { prisma } from "@/lib/db";
import { buildCsv } from "@/lib/reports/csv";
import { buildWorkbookBuffer } from "@/lib/reports/excel";

export const runtime = "nodejs";

const HEADERS = [
  "Created At",
  "Name",
  "Phone",
  "Email",
  "Configuration",
  "Budget",
  "Status",
  "Source",
  "UTM Source",
  "UTM Campaign",
];

export async function GET(request: NextRequest) {
  await verifyAdminSession();

  const searchParams = request.nextUrl.searchParams;
  const format = searchParams.get("format") ?? "csv";
  const range = resolveReportRange(searchParams);

  const leads = await prisma.lead.findMany({
    where: { createdAt: { gte: range.from, lte: range.to } },
    orderBy: { createdAt: "desc" },
    select: {
      createdAt: true,
      fullName: true,
      mobileNumber: true,
      email: true,
      configuration: true,
      budget: true,
      status: true,
      source: true,
      session: { select: { utmSource: true, utmCampaign: true } },
    },
  });

  const rows = leads.map((l) => [
    l.createdAt.toISOString(),
    l.fullName,
    l.mobileNumber,
    l.email ?? "",
    l.configuration ?? "",
    l.budget ?? "",
    l.status,
    l.source ?? "",
    l.session?.utmSource ?? "",
    l.session?.utmCampaign ?? "",
  ]);

  const filenameBase = `leads_${range.label}`;

  if (format === "xlsx") {
    const buffer = await buildWorkbookBuffer("Leads", HEADERS, rows);
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
