import { KeyRound, MessageCircle, Radio } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import CredentialStatusTile from "@/components/admin/CredentialStatusTile";
import SendTestMessageButton from "@/components/admin/SendTestMessageButton";
import { getSettings, SETTING_KEYS } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function AdminTelegramPage() {
  const settings = await getSettings([SETTING_KEYS.telegramBotToken, SETTING_KEYS.telegramChatId]);
  const botToken = settings[SETTING_KEYS.telegramBotToken];
  const chatId = settings[SETTING_KEYS.telegramChatId];
  const botTokenEnv = Boolean(process.env.TELEGRAM_BOT_TOKEN);
  const chatIdEnv = Boolean(process.env.TELEGRAM_CHAT_ID);
  const hasBotToken = Boolean(botToken) || botTokenEnv;
  const hasChatId = Boolean(chatId) || chatIdEnv;

  return (
    <div>
      <PageHeader
        title="Telegram Notifications"
        description="Every new lead is pushed to a Telegram chat in real time, including a snapshot of the visitor's session."
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <CredentialStatusTile icon={KeyRound} label="Bot Token" configured={hasBotToken} />
        <CredentialStatusTile icon={MessageCircle} label="Chat ID" configured={hasChatId} />
        <CredentialStatusTile
          icon={Radio}
          label="Status"
          configured={hasBotToken && hasChatId}
          activeLabel="Active"
          missingLabel="Inactive"
        />
      </div>

      <div className="mt-6 rounded-xl border border-navy-200 bg-white p-4">
        <h2 className="mb-1 text-sm font-bold text-navy-900">Send a test message</h2>
        <p className="mb-4 text-xs text-navy-500">
          Sends a one-off message to the configured chat so you can confirm the bot token and chat ID
          actually work, without waiting for a real lead.
        </p>
        <SendTestMessageButton />
      </div>

      <div className="mt-6 rounded-xl border border-navy-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-bold text-navy-900">Setup</h2>
        <ol className="list-inside list-decimal space-y-2 text-xs text-navy-600">
          <li>
            Open Telegram, message <code className="rounded bg-navy-50 px-1 py-0.5">@BotFather</code>, and send{" "}
            <code className="rounded bg-navy-50 px-1 py-0.5">/newbot</code>. Follow the prompts and copy the
            token it gives you.
          </li>
          <li>
            Set <code className="rounded bg-navy-50 px-1 py-0.5">TELEGRAM_BOT_TOKEN</code> to that token in your
            environment variables.
          </li>
          <li>
            Message your new bot once (anything), then visit{" "}
            <code className="rounded bg-navy-50 px-1 py-0.5">https://api.telegram.org/bot&lt;TOKEN&gt;/getUpdates</code>{" "}
            in a browser and find your chat id in the JSON response (<code>message.chat.id</code>).
          </li>
          <li>
            Set <code className="rounded bg-navy-50 px-1 py-0.5">TELEGRAM_CHAT_ID</code> to that value, then
            redeploy — both variables are read at build/start time.
          </li>
          <li>Come back to this page and send a test message to confirm it works.</li>
        </ol>
      </div>
    </div>
  );
}
