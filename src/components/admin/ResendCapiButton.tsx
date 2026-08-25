"use client";

import { useState, useTransition } from "react";
import { RefreshCw, Check, X } from "lucide-react";
import { resendLeadCapiEvent } from "@/lib/meta/actions";

export default function ResendCapiButton({ leadId }: { leadId: string }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<"ok" | "error" | null>(null);

  function handleClick() {
    setResult(null);
    startTransition(async () => {
      const res = await resendLeadCapiEvent(leadId);
      setResult(res.ok ? "ok" : "error");
      setTimeout(() => setResult(null), 4000);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      title="Resend Meta CAPI Lead event"
      className="flex items-center gap-1 rounded-md border border-navy-200 px-2 py-1 text-xs font-medium text-navy-600 transition hover:border-navy-300 hover:text-navy-900 disabled:opacity-50"
    >
      {result === "ok" ? (
        <Check className="h-3.5 w-3.5 text-green-600" />
      ) : result === "error" ? (
        <X className="h-3.5 w-3.5 text-red-600" />
      ) : (
        <RefreshCw className={`h-3.5 w-3.5 ${pending ? "animate-spin" : ""}`} />
      )}
      Resend
    </button>
  );
}
