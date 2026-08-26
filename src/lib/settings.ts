import "server-only";

import { prisma } from "@/lib/db";

export const SETTING_KEYS = {
  metaPixelId: "meta_pixel_id",
  metaCapiAccessToken: "meta_capi_access_token",
  metaCapiTestEventCode: "meta_capi_test_event_code",
  telegramBotToken: "telegram_bot_token",
  telegramChatId: "telegram_chat_id",
} as const;

export type SettingKey = (typeof SETTING_KEYS)[keyof typeof SETTING_KEYS];

export async function getSetting(key: SettingKey): Promise<string | null> {
  const row = await prisma.appSetting.findUnique({ where: { key } });
  return row?.value ?? null;
}

export async function getSettings(keys: SettingKey[]): Promise<Record<string, string | null>> {
  const rows = await prisma.appSetting.findMany({ where: { key: { in: keys } } });
  const map = new Map(rows.map((r) => [r.key, r.value]));
  return Object.fromEntries(keys.map((k) => [k, map.get(k) ?? null]));
}

export async function setSetting(key: SettingKey, value: string): Promise<void> {
  const trimmed = value.trim();
  if (!trimmed) {
    await prisma.appSetting.deleteMany({ where: { key } });
    return;
  }
  await prisma.appSetting.upsert({
    where: { key },
    update: { value: trimmed },
    create: { key, value: trimmed },
  });
}

/** DB value wins when set; otherwise falls back to the matching env var. */
export async function resolveSecret(key: SettingKey, envVarName: string): Promise<string | null> {
  const dbValue = await getSetting(key);
  if (dbValue) return dbValue;
  return process.env[envVarName] || null;
}

export async function resolveSecrets(
  pairs: Array<{ key: SettingKey; envVarName: string }>
): Promise<Record<string, string | null>> {
  const dbValues = await getSettings(pairs.map((p) => p.key));
  return Object.fromEntries(
    pairs.map(({ key, envVarName }) => [key, dbValues[key] || process.env[envVarName] || null])
  );
}
