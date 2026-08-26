import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth/dal";
import { getLiveVisitorCount } from "@/lib/admin/queries";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const count = await getLiveVisitorCount();
  return NextResponse.json({ count });
}
