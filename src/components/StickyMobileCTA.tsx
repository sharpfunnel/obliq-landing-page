"use client";

import { Tag, Phone } from "lucide-react";
import { SITE } from "@/lib/content";
import { useCtaTracking } from "@/lib/tracking/hooks";

export default function StickyMobileCTA() {
  const { ref: callRef, onMouseEnter: onCallMouseEnter, onClick: onCallClick } = useCtaTracking("sticky-call");
  const {
    ref: priceRef,
    onMouseEnter: onPriceMouseEnter,
    onClick: onPriceClick,
  } = useCtaTracking("sticky-get-price");

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex border-t border-white/10 bg-navy-950 sm:hidden">
      <a
        ref={callRef as React.RefObject<HTMLAnchorElement>}
        href={`tel:${SITE.contactPhone}`}
        onMouseEnter={onCallMouseEnter}
        onClick={onCallClick}
        className="flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold text-white"
      >
        <Phone className="h-4 w-4 text-gold-400" /> Call Now
      </a>
      <div className="w-px bg-white/10" />
      <a
        ref={priceRef as React.RefObject<HTMLAnchorElement>}
        href="#mid-cta-form"
        onMouseEnter={onPriceMouseEnter}
        onClick={onPriceClick}
        className="flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold text-white"
      >
        <Tag className="h-4 w-4 text-gold-400" /> Get Price
      </a>
    </div>
  );
}
