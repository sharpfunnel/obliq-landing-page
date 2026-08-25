"use client";

import { useTransition } from "react";
import { disconnectMetaAdAccount } from "@/lib/meta/actions";

export default function MetaDisconnectButton({ accountId }: { accountId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm("Disconnect this Meta ad account? You can reconnect it any time.")) {
          startTransition(() => disconnectMetaAdAccount(accountId));
        }
      }}
      className="rounded-full border border-navy-200 px-3 py-1.5 text-xs font-medium text-navy-500 transition hover:border-red-300 hover:text-red-600 disabled:opacity-60"
    >
      {pending ? "Disconnecting..." : "Disconnect"}
    </button>
  );
}
