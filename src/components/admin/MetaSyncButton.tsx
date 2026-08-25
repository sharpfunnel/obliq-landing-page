"use client";

import { useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { triggerMetaSync } from "@/lib/meta/actions";

export default function MetaSyncButton() {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleClick() {
    setMessage(null);
    startTransition(async () => {
      const result = await triggerMetaSync();
      setMessage(`Synced ${result.synced}, failed ${result.failed}`);
      setTimeout(() => setMessage(null), 5000);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="flex items-center gap-1.5 rounded-full bg-gold-500 px-3 py-1.5 text-xs font-semibold text-navy-950 transition hover:bg-gold-400 disabled:opacity-60"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${pending ? "animate-spin" : ""}`} />
        {pending ? "Syncing..." : "Sync Now"}
      </button>
      {message && <span className="text-xs text-navy-500">{message}</span>}
    </div>
  );
}
