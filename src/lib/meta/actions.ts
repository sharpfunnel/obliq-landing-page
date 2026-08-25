"use server";

import { revalidatePath } from "next/cache";
import { verifyAdminSession } from "@/lib/auth/dal";
import { prisma } from "@/lib/db";
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
  return result;
}
