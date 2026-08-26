"use client";

import { useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { FAQS } from "@/lib/content";
import CtaLink from "./CtaLink";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-navy-50 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-extrabold text-navy-900 sm:text-4xl">
          Frequently Asked Questions
        </h2>

        <div className="mt-10 space-y-3">
          {FAQS.map((item, i) => {
            const open = openIndex === i;
            return (
              <div key={item.q} className="overflow-hidden rounded-xl border border-navy-200 bg-white">
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={open}
                >
                  <span className="text-sm font-semibold text-navy-900 sm:text-base">{item.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-gold-500 transition-transform ${open ? "rotate-180" : ""}`}
                  />
                </button>
                {open && (
                  <div className="px-5 pb-4 text-sm leading-relaxed text-navy-600">{item.a}</div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-center">
          <CtaLink
            ctaId="faq-cta"
            href="#mid-cta-form"
            className="inline-flex items-center gap-2 rounded-lg bg-gold-500 px-6 py-3 text-sm font-semibold text-navy-950 transition hover:bg-gold-400"
          >
            Get Project Details <ArrowRight className="h-4 w-4" />
          </CtaLink>
        </div>
      </div>
    </section>
  );
}
