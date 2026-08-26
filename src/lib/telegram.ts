import "server-only";

import { resolveSecrets, SETTING_KEYS } from "@/lib/settings";

async function resolveTelegramCredentials() {
  const values = await resolveSecrets([
    { key: SETTING_KEYS.telegramBotToken, envVarName: "TELEGRAM_BOT_TOKEN" },
    { key: SETTING_KEYS.telegramChatId, envVarName: "TELEGRAM_CHAT_ID" },
  ]);
  return {
    botToken: values[SETTING_KEYS.telegramBotToken],
    chatId: values[SETTING_KEYS.telegramChatId],
  };
}

export type TelegramSendResult = { ok: true } | { ok: false; error: string };

/** Low-level send — used by both the real-time lead notifier and the admin "test message" button. */
export async function sendTelegramMessage(text: string): Promise<TelegramSendResult> {
  const { botToken, chatId } = await resolveTelegramCredentials();
  if (!botToken || !chatId) {
    return { ok: false, error: "Telegram is not configured (bot token / chat ID missing)." };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });

    if (!res.ok) {
      const json = (await res.json().catch(() => null)) as { description?: string } | null;
      return { ok: false, error: json?.description ?? `HTTP ${res.status}` };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unknown Telegram error" };
  }
}

export type LeadNotificationInput = {
  fullName: string;
  mobileNumber: string;
  source?: string | null;
  interestedIn?: string | null;
  configuration?: string | null;
  budget?: string | null;
  message?: string | null;
  city?: string | null;
  country?: string | null;
  utmSource?: string | null;
  utmCampaign?: string | null;
};

/** Fire-and-forget notification for a newly created lead. Never throws. */
export async function notifyTelegramNewLead(lead: LeadNotificationInput): Promise<void> {
  const lines = [
    "🔔 <b>New Lead</b>",
    `👤 ${lead.fullName}`,
    `📞 ${lead.mobileNumber}`,
  ];
  if (lead.interestedIn) lines.push(`🎯 Interested In: ${lead.interestedIn}`);
  if (lead.configuration) lines.push(`🏠 Config: ${lead.configuration}`);
  if (lead.budget) lines.push(`💰 Budget: ${lead.budget}`);
  const location = [lead.city, lead.country].filter(Boolean).join(", ");
  if (location) lines.push(`📍 ${location}`);
  const source = lead.utmSource ?? lead.source;
  if (source) lines.push(`📢 Source: ${source}${lead.utmCampaign ? ` · ${lead.utmCampaign}` : ""}`);
  if (lead.message) lines.push(`💬 ${lead.message}`);

  const result = await sendTelegramMessage(lines.join("\n"));
  if (!result.ok) {
    console.error("Telegram lead notification failed:", result.error);
  }
}
