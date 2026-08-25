"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, Save } from "lucide-react";
import {
  BUDGET_OPTIONS,
  CONFIGURATION_OPTIONS,
  leadDetailsSchema,
} from "@/lib/validation";

type Status = "idle" | "submitting" | "success" | "error";

export default function ThankYouDetailsForm({ leadId }: { leadId: string | null }) {
  const [configuration, setConfiguration] = useState("");
  const [email, setEmail] = useState("");
  const [budget, setBudget] = useState("");
  const [message, setMessage] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setEmailError(null);

    if (!leadId) {
      setStatus("error");
      return;
    }

    const parsed = leadDetailsSchema.safeParse({ configuration, email, budget, message });
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      if (fieldErrors.email?.[0]) setEmailError(fieldErrors.email[0]);
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-navy-700 bg-navy-900 p-8 text-center">
        <CheckCircle2 className="h-8 w-8 text-green-400" />
        <p className="text-sm font-semibold text-white">Thanks! Your details have been saved.</p>
        <p className="text-xs text-navy-400">Our team will use this to prepare a more relevant callback.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-navy-700 bg-navy-900 p-6 sm:p-7">
      <h2 className="text-base font-bold text-white">Add a Few More Details</h2>
      <p className="mt-1 text-sm text-navy-400">
        Optional — helps our team prepare a more relevant callback for you.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-3.5">
        <select
          value={configuration}
          onChange={(e) => setConfiguration(e.target.value)}
          className="w-full rounded-lg border border-navy-700 bg-navy-800 px-4 py-3 text-sm text-navy-200 outline-none focus:ring-2 focus:ring-gold-500"
        >
          <option value="">Configuration Interested (optional)</option>
          {CONFIGURATION_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>

        <div>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="Email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full rounded-lg border bg-navy-800 px-4 py-3 text-sm text-navy-200 placeholder:text-navy-500 outline-none focus:ring-2 focus:ring-gold-500 ${
              emailError ? "border-red-500" : "border-navy-700"
            }`}
          />
          {emailError && <p className="mt-1 text-xs text-red-400">{emailError}</p>}
        </div>

        <select
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          className="w-full rounded-lg border border-navy-700 bg-navy-800 px-4 py-3 text-sm text-navy-200 outline-none focus:ring-2 focus:ring-gold-500"
        >
          <option value="">Budget (optional)</option>
          {BUDGET_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>

        <textarea
          placeholder="Message (optional)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          className="w-full resize-none rounded-lg border border-navy-700 bg-navy-800 px-4 py-3 text-sm text-navy-200 placeholder:text-navy-500 outline-none focus:ring-2 focus:ring-gold-500"
        />

        {status === "error" && (
          <p className="text-sm text-red-400">Couldn&apos;t save your details. Please try again.</p>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold-500 px-4 py-3 text-sm font-semibold text-navy-950 transition hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {status === "submitting" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" /> Save Details
            </>
          )}
        </button>
      </form>
    </div>
  );
}
