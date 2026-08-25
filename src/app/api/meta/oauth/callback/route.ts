import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminSession } from "@/lib/auth/dal";
import { prisma } from "@/lib/db";
import { exchangeCodeForToken, exchangeForLongLivedToken, listAdAccounts } from "@/lib/meta/client";

export const runtime = "nodejs";

function redirectTo(request: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, request.url));
}

export async function GET(request: NextRequest) {
  await verifyAdminSession();

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const errorParam = url.searchParams.get("error_description") ?? url.searchParams.get("error");

  if (errorParam) {
    return redirectTo(request, `/admin/campaigns?error=${encodeURIComponent(errorParam)}`);
  }

  const cookieStore = await cookies();
  const expectedState = cookieStore.get("meta_oauth_state")?.value;
  cookieStore.delete("meta_oauth_state");

  if (!code || !state || !expectedState || state !== expectedState) {
    return redirectTo(request, "/admin/campaigns?error=Invalid+OAuth+state");
  }

  try {
    const shortLived = await exchangeCodeForToken(code);
    const longLived = await exchangeForLongLivedToken(shortLived.access_token);
    const accounts = await listAdAccounts(longLived.access_token);

    const tokenExpiresAt = longLived.expires_in ? new Date(Date.now() + longLived.expires_in * 1000) : null;

    await Promise.all(
      accounts.map((acc) =>
        prisma.metaAdAccount.upsert({
          where: { accountId: acc.id },
          update: {
            name: acc.name,
            currency: acc.currency,
            timezoneName: acc.timezone_name,
            accessToken: longLived.access_token,
            tokenExpiresAt,
          },
          create: {
            accountId: acc.id,
            name: acc.name,
            currency: acc.currency,
            timezoneName: acc.timezone_name,
            accessToken: longLived.access_token,
            tokenExpiresAt,
          },
        })
      )
    );

    return redirectTo(request, "/admin/campaigns");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Meta OAuth exchange failed.";
    return redirectTo(request, `/admin/campaigns?error=${encodeURIComponent(message)}`);
  }
}
