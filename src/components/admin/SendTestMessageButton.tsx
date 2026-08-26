"use client";

import { useState, useTransition } from "react";
import { Send, Check, X } from "lucide-react";
import { sendTelegramTestMessage } from "@/lib/telegram-actions";

export default function SendTestMessageButton() {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; error?: string } | null>(null);

  function handleClick() {
    setResult(null);
    startTransition(async () => {
      const res = await sendTelegramTestMessage();
      setResult(res.ok ? { ok: true } : { ok: false, error: res.error });
      setTimeout(() => setResult(null), 5000);
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="flex items-center gap-1.5 rounded-lg bg-navy-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-navy-800 disabled:opacity-50"
      >
        {result?.ok ? (
          <Check className="h-3.5 w-3.5 text-green-400" />
        ) : result && !result.ok ? (
          <X className="h-3.5 w-3.5 text-red-400" />
        ) : (
          <Send className={`h-3.5 w-3.5 ${pending ? "animate-pulse" : ""}`} />
        )}
        Send test message
      </button>
      {result && !result.ok && <p className="mt-2 text-xs text-red-600">{result.error}</p>}
      {result?.ok && <p className="mt-2 text-xs text-green-600">Sent — check your Telegram chat.</p>}
    </div>
  );
}
