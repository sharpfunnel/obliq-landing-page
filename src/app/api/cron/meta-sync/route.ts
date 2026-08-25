import { NextRequest, NextResponse } from "next/server";
import { syncAllMetaAdAccounts } from "@/lib/meta/sync";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const result = await syncAllMetaAdAccounts();
  return NextResponse.json({ ok: true, ...result });
}
