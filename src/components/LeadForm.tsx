"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { INTERESTED_IN_OPTIONS, leadFormSchema } from "@/lib/validation";
import { getTrackingInit, trackError } from "@/lib/tracking/track";
import { useFormTracking } from "@/lib/tracking/hooks";
import { trackPixelLead } from "@/lib/meta/pixel";

type FieldErrors = Partial<Record<"fullName" | "mobileNumber" | "interestedIn", string>>;

export default function LeadForm({
  variant = "hero",
  heading,
  subheading,
  formId = "lead-form",
  source,
}: {
  variant?: "hero" | "inline";
  heading?: string;
  subheading?: string;
  formId?: string;
  source?: string;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [interestedIn, setInterestedIn] = useState<(typeof INTERESTED_IN_OPTIONS)[number] | "">("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const tracking = useFormTracking(formId);
  const { ref: formTrackingRef } = tracking;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    const parsed = leadFormSchema.safeParse({ fullName, mobileNumber, interestedIn });
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors({
        fullName: fieldErrors.fullName?.[0],
        mobileNumber: fieldErrors.mobileNumber?.[0],
        interestedIn: fieldErrors.interestedIn?.[0],
      });
      if (fieldErrors.fullName?.[0]) tracking.onValidationError("fullName", fieldErrors.fullName[0]);
      if (fieldErrors.mobileNumber?.[0]) tracking.onValidationError("mobileNumber", fieldErrors.mobileNumber[0]);
      if (fieldErrors.interestedIn?.[0]) tracking.onValidationError("interestedIn", fieldErrors.interestedIn[0]);
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parsed.data,
          formId,
          source: source ?? formId,
          init: getTrackingInit(),
        }),
      });

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const data = (await res.json()) as { leadId: string };
      tracking.onSubmitted();
      trackPixelLead(data.leadId);
      router.push(`/thank-you?leadId=${data.leadId}`);
    } catch (error) {
      console.error("Lead submission failed:", error);
      trackError({
        type: "lead_submit",
        message: error instanceof Error ? error.message : "Unknown lead submission error",
        path: location.pathname,
      });
      setFormError("Something went wrong. Please try again or call us directly.");
      setSubmitting(false);
    }
  }

  const isHero = variant === "hero";

  return (
    <div
      id={formId}
      ref={formTrackingRef as React.RefObject<HTMLDivElement>}
      className={
        isHero
          ? "w-full max-w-md rounded-2xl border border-white/10 bg-navy-900/70 p-6 shadow-2xl backdrop-blur-md sm:p-8"
          : "w-full max-w-md rounded-2xl border border-navy-200 bg-white p-6 shadow-xl sm:p-8"
      }
    >
      <h3 className={isHero ? "text-xl font-bold text-white sm:text-2xl" : "text-xl font-bold text-navy-900 sm:text-2xl"}>
        {heading ?? "Book Your Free Site Visit"}
      </h3>
      <p className={isHero ? "mt-2 text-sm text-navy-300" : "mt-2 text-sm text-navy-600"}>
        {subheading ?? "Fill in your details — our team will call you back within 30 minutes."}
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
        <div>
          <input
            type="text"
            inputMode="text"
            autoComplete="name"
            placeholder="Full Name*"
            value={fullName}
            onFocus={() => tracking.onFieldFocus("fullName")}
            onBlur={() => fullName.trim() && tracking.onFieldComplete("fullName")}
            onChange={(e) => setFullName(e.target.value)}
            className={`w-full rounded-lg border px-4 py-3 text-[15px] outline-none transition focus:ring-2 ${
              isHero
                ? "border-white/10 bg-navy-800/80 text-white placeholder:text-navy-400 focus:ring-gold-500"
                : "border-navy-300 bg-white text-navy-900 placeholder:text-navy-400 focus:ring-gold-500"
            } ${errors.fullName ? "border-red-500 focus:ring-red-500" : ""}`}
            aria-invalid={!!errors.fullName}
          />
          {errors.fullName && <p className="mt-1 text-xs text-red-400">{errors.fullName}</p>}
        </div>

        <div>
          <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="Mobile Number*"
            value={mobileNumber}
            onFocus={() => tracking.onFieldFocus("mobileNumber")}
            onBlur={() => mobileNumber.trim() && tracking.onFieldComplete("mobileNumber")}
            onChange={(e) => setMobileNumber(e.target.value)}
            className={`w-full rounded-lg border px-4 py-3 text-[15px] outline-none transition focus:ring-2 ${
              isHero
                ? "border-white/10 bg-navy-800/80 text-white placeholder:text-navy-400 focus:ring-gold-500"
                : "border-navy-300 bg-white text-navy-900 placeholder:text-navy-400 focus:ring-gold-500"
            } ${errors.mobileNumber ? "border-red-500 focus:ring-red-500" : ""}`}
            aria-invalid={!!errors.mobileNumber}
          />
          {errors.mobileNumber && <p className="mt-1 text-xs text-red-400">{errors.mobileNumber}</p>}
        </div>

        <div>
          <p className={isHero ? "mb-2 text-xs font-medium text-navy-300" : "mb-2 text-xs font-medium text-navy-600"}>
            Interested In*
          </p>
          <div className="grid grid-cols-3 gap-2">
            {INTERESTED_IN_OPTIONS.map((option) => {
              const selected = interestedIn === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setInterestedIn(option);
                    tracking.onFieldComplete("interestedIn");
                  }}
                  onFocus={() => tracking.onFieldFocus("interestedIn")}
                  className={`rounded-lg border px-2 py-2.5 text-sm font-semibold transition ${
                    selected
                      ? "border-gold-500 bg-gold-500 text-navy-950"
                      : isHero
                        ? "border-white/10 bg-navy-800/80 text-navy-200 hover:border-gold-500/50"
                        : "border-navy-300 bg-white text-navy-700 hover:border-gold-500/50"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
          {errors.interestedIn && <p className="mt-1 text-xs text-red-400">{errors.interestedIn}</p>}
        </div>

        {formError && <p className="text-sm text-red-400">{formError}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold-500 px-4 py-3 text-[15px] font-semibold text-navy-950 transition hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" /> Get Price + Floor Plan
            </>
          )}
        </button>

        <p className={isHero ? "text-center text-xs text-navy-400" : "text-center text-xs text-navy-500"}>
          100% free &amp; confidential · No spam, ever.
        </p>
      </form>
    </div>
  );
}
