import { KeyRound, MessageCircle, Radio } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import CredentialStatusTile from "@/components/admin/CredentialStatusTile";
import SendTestMessageButton from "@/components/admin/SendTestMessageButton";
import { getSettings, SETTING_KEYS } from "@/lib/settings";
import { updateTelegramSettings } from "@/lib/telegram-actions";

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

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-navy-200 bg-white p-4">
          <h2 className="mb-1 text-sm font-bold text-navy-900">Credentials</h2>
          <p className="mb-4 text-xs text-navy-500">
            Saved here take priority over the <code>TELEGRAM_BOT_TOKEN</code> / <code>TELEGRAM_CHAT_ID</code>{" "}
            environment variables.
          </p>
          <form action={updateTelegramSettings} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-navy-600">Bot token</label>
              <input
                type="password"
                name="botToken"
                defaultValue={botToken ?? ""}
                placeholder={botTokenEnv ? "Using environment variable" : "123456:ABC-DEF..."}
                className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-gold-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-navy-600">Chat ID</label>
              <input
                type="text"
                name="chatId"
                defaultValue={chatId ?? ""}
                placeholder={chatIdEnv ? "Using environment variable" : "-1001234567890"}
                className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-gold-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-gold-500 px-4 py-2 text-xs font-semibold text-navy-950 transition hover:bg-gold-400"
            >
              Save
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-navy-200 bg-white p-4">
          <h2 className="mb-1 text-sm font-bold text-navy-900">Send a test message</h2>
          <p className="mb-4 text-xs text-navy-500">
            Sends a one-off message to the configured chat so you can confirm the bot token and chat ID
            actually work, without waiting for a real lead.
          </p>
          <SendTestMessageButton />
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-navy-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-bold text-navy-900">Setup</h2>
        <ol className="list-inside list-decimal space-y-2 text-xs text-navy-600">
          <li>
            Open Telegram, message <code className="rounded bg-navy-50 px-1 py-0.5">@BotFather</code>, and send{" "}
            <code className="rounded bg-navy-50 px-1 py-0.5">/newbot</code>. Follow the prompts and copy the
            token it gives you.
          </li>
          <li>Paste that token into the Bot token field above and save.</li>
          <li>
            Message your new bot once (anything), then visit{" "}
            <code className="rounded bg-navy-50 px-1 py-0.5">https://api.telegram.org/bot&lt;TOKEN&gt;/getUpdates</code>{" "}
            in a browser and find the chat id in the JSON response (<code>message.chat.id</code>).
          </li>
          <li>Paste that value into the Chat ID field above and save.</li>
          <li>Send a test message to confirm it works.</li>
        </ol>
      </div>
    </div>
  );
}
