"use client";

import { useTransition } from "react";
import { updateLeadStatus } from "@/lib/admin/actions";
import { LEAD_STATUSES } from "@/lib/admin/constants";

const STATUS_STYLES: Record<string, string> = {
  new: "bg-blue-50 text-blue-700",
  contacted: "bg-amber-50 text-amber-700",
  qualified: "bg-purple-50 text-purple-700",
  won: "bg-green-50 text-green-700",
  lost: "bg-red-50 text-red-700",
};

export default function LeadStatusSelect({ leadId, status }: { leadId: string; status: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) => startTransition(() => updateLeadStatus(leadId, e.target.value))}
      className={`rounded-full border-0 px-2.5 py-1 text-xs font-semibold capitalize outline-none ${
        STATUS_STYLES[status] ?? "bg-navy-50 text-navy-700"
      } ${pending ? "opacity-60" : ""}`}
    >
      {LEAD_STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
