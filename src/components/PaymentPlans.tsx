import { ArrowRight, Check } from "lucide-react";
import { PAYMENT_PLANS } from "@/lib/content";
import CtaLink from "./CtaLink";

export default function PaymentPlans() {
  return (
    <section id="pricing" className="bg-navy-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold text-navy-900 sm:text-4xl">
            Limited-Time Launch Pricing
          </h2>
          <p className="mt-3 text-navy-600">
            Choose the payment plan that works best for you — flexible construction-linked terms
            or a special down payment offer for maximum savings.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-2">
          {PAYMENT_PLANS.map((plan) => (
            <div
              key={plan.code}
              className={`relative rounded-2xl border p-6 shadow-sm sm:p-8 ${
                plan.highlighted
                  ? "border-gold-400 bg-navy-900 text-white shadow-lg"
                  : "border-navy-200 bg-white"
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-6 rounded-full bg-gold-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-navy-950">
                  Best Value
                </span>
              )}
              <p className={`text-xs font-semibold uppercase tracking-wider ${plan.highlighted ? "text-gold-300" : "text-gold-500"}`}>
                {plan.code}
              </p>
              <h3 className={`mt-1 text-xl font-bold ${plan.highlighted ? "text-white" : "text-navy-900"}`}>
                {plan.name}
              </h3>
              <p className={`mt-3 text-3xl font-extrabold ${plan.highlighted ? "text-white" : "text-navy-900"}`}>
                {plan.price}
              </p>
              <p className={`mt-1 text-sm font-medium ${plan.highlighted ? "text-gold-300" : "text-gold-600"}`}>
                {plan.detail}
              </p>

              <ul className="mt-5 space-y-2.5">
                {plan.points.map((point) => (
                  <li key={point} className={`flex items-start gap-2 text-sm ${plan.highlighted ? "text-navy-200" : "text-navy-600"}`}>
                    <Check className={`mt-0.5 h-4 w-4 shrink-0 ${plan.highlighted ? "text-gold-400" : "text-gold-500"}`} />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-navy-400">
          *Pricing is indicative and subject to change without prior notice. Terms and conditions
          apply.
        </p>

        <div className="mt-8 flex justify-center">
          <CtaLink
            ctaId="pricing-cta"
            href="#mid-cta-form"
            className="inline-flex items-center gap-2 rounded-lg bg-gold-500 px-6 py-3 text-sm font-semibold text-navy-950 transition hover:bg-gold-400"
          >
            Get Price + Floor Plan <ArrowRight className="h-4 w-4" />
          </CtaLink>
        </div>
      </div>
    </section>
  );
}
