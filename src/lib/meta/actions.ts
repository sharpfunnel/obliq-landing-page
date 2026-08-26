"use server";

import { revalidatePath } from "next/cache";
import { verifyAdminSession } from "@/lib/auth/dal";
import { prisma } from "@/lib/db";
import { setSetting, SETTING_KEYS } from "@/lib/settings";
import { syncAllMetaAdAccounts } from "./sync";
import { sendManualConversionEvent, type ManualCapiOptions, type ManualCapiResult } from "./capi";

export async function triggerMetaSync() {
  await verifyAdminSession();
  const result = await syncAllMetaAdAccounts();
  revalidatePath("/admin/campaigns");
  return result;
}

export async function disconnectMetaAdAccount(accountId: string) {
  await verifyAdminSession();
  await prisma.metaAdAccount.update({
    where: { id: accountId },
    data: { accessToken: null, tokenExpiresAt: null },
  });
  revalidatePath("/admin/campaigns");
}

export async function resendLeadCapiEvent(leadId: string, options?: Partial<ManualCapiOptions>): Promise<ManualCapiResult> {
  await verifyAdminSession();
  const result = await sendManualConversionEvent(leadId, { eventType: "Lead", ...options });
  revalidatePath("/admin/leads");
  revalidatePath("/admin/meta-capi");
  return result;
}

export async function updateMetaCapiSettings(formData: FormData): Promise<void> {
  await verifyAdminSession();

  const pixelId = String(formData.get("pixelId") ?? "");
  const accessToken = String(formData.get("accessToken") ?? "");
  const testEventCode = String(formData.get("testEventCode") ?? "");

  await Promise.all([
    setSetting(SETTING_KEYS.metaPixelId, pixelId),
    setSetting(SETTING_KEYS.metaCapiAccessToken, accessToken),
    setSetting(SETTING_KEYS.metaCapiTestEventCode, testEventCode),
  ]);

  revalidatePath("/admin/meta-capi");
}
