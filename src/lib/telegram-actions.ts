"use server";

import { verifyAdminSession } from "@/lib/auth/dal";
import { sendTelegramMessage, type TelegramSendResult } from "@/lib/telegram";

export async function sendTelegramTestMessage(): Promise<TelegramSendResult> {
  await verifyAdminSession();
  return sendTelegramMessage(
    "✅ Test message from Kamdhenu Admin — Telegram notifications are configured correctly."
  );
}
