"use server";

import { revalidatePath } from "next/cache";
import { verifyAdminSession } from "@/lib/auth/dal";
import { setSetting, SETTING_KEYS } from "@/lib/settings";
import { sendTelegramMessage, type TelegramSendResult } from "@/lib/telegram";

export async function updateTelegramSettings(formData: FormData): Promise<void> {
  await verifyAdminSession();

  const botToken = String(formData.get("botToken") ?? "");
  const chatId = String(formData.get("chatId") ?? "");

  await Promise.all([
    setSetting(SETTING_KEYS.telegramBotToken, botToken),
    setSetting(SETTING_KEYS.telegramChatId, chatId),
  ]);

  revalidatePath("/admin/telegram");
}

export async function sendTelegramTestMessage(): Promise<TelegramSendResult> {
  await verifyAdminSession();
  return sendTelegramMessage(
    "✅ Test message from Kamdhenu Admin — Telegram notifications are configured correctly."
  );
}
