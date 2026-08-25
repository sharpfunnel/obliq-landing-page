"use server";

import { revalidatePath } from "next/cache";
import { verifyAdminSession } from "@/lib/auth/dal";
import { prisma } from "@/lib/db";
import { LEAD_STATUSES } from "./constants";

export async function updateLeadStatus(leadId: string, status: string) {
  await verifyAdminSession();

  if (!LEAD_STATUSES.includes(status as (typeof LEAD_STATUSES)[number])) {
    throw new Error(`Invalid status: ${status}`);
  }

  await prisma.lead.update({ where: { id: leadId }, data: { status } });

  revalidatePath("/admin/leads");
  revalidatePath("/admin");
}
