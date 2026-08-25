import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminSession } from "@/lib/auth/dal";
import { buildOAuthDialogUrl } from "@/lib/meta/client";

export const runtime = "nodejs";

export async function GET() {
  await verifyAdminSession();

  const state = crypto.randomUUID();
  const cookieStore = await cookies();
  cookieStore.set("meta_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  try {
    return NextResponse.redirect(buildOAuthDialogUrl(state));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Meta OAuth is not configured.";
    return NextResponse.redirect(
      new URL(`/admin/campaigns?error=${encodeURIComponent(message)}`, process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000")
    );
  }
}
