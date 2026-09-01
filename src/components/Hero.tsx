import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import LeadForm from "./LeadForm";
import { PAYMENT_PLANS, SITE } from "@/lib/content";

export default function Hero() {
  const startingPrice = PAYMENT_PLANS.find((plan) => plan.highlighted)?.price;

  return (
    <section className="relative isolate overflow-hidden bg-navy-950">
      <Image
        src="/images/hero-grand-entrance.webp"
        alt="Codename Obliq commercial project grand entrance"
        fill
        priority
        className="object-cover opacity-50"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-navy-950/70 via-navy-950/70 to-navy-950" />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-24 lg:px-8">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-gold-300">
            New Commercial Launch · Juinagar
          </span>

          <h1 className="mt-5 text-4xl font-extrabold leading-tight text-white sm:text-5xl">
            {SITE.projectName}
          </h1>
          <p className="mt-2 text-lg font-medium text-gold-300 sm:text-xl">{SITE.tagline}</p>

          {startingPrice && (
            <p className="mt-4 text-2xl font-extrabold text-white sm:text-3xl">
              Starting at <span className="text-gold-400">{startingPrice}*</span>
            </p>
          )}

          <p className="mt-5 max-w-xl text-base text-navy-300 sm:text-lg">
            A landmark commercial development by {SITE.developer} &amp; {SITE.coDeveloper} on the
            Juinagar-Mulund Link Road — corporate offices, professional suites and retail spaces
            engineered for growth.
          </p>

          <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              "Direct access — Juinagar-Mulund Link Road",
              "4 mins drive from Juinagar Station",
              "CC Received — construction is live",
              "Flexible 25:70 payment plan",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-navy-200">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-center lg:justify-end">
          <LeadForm variant="hero" formId="hero-form" source="hero-form" />
        </div>
      </div>
    </section>
  );
}
