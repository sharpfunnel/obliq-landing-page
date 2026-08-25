"use client";

import { MessageCircle, Phone } from "lucide-react";
import { SITE } from "@/lib/content";
import { useCtaTracking } from "@/lib/tracking/hooks";

export default function StickyMobileCTA() {
  const whatsappNumber = SITE.contactPhone.replace("+", "");
  const whatsappMessage = encodeURIComponent(
    `Hi, I'm interested in ${SITE.projectName} in ${SITE.location}. Please share more details.`
  );
  const { ref: callRef, onMouseEnter: onCallMouseEnter, onClick: onCallClick } = useCtaTracking("sticky-call");
  const {
    ref: whatsappRef,
    onMouseEnter: onWhatsappMouseEnter,
    onClick: onWhatsappClick,
  } = useCtaTracking("sticky-whatsapp");

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
        ref={whatsappRef as React.RefObject<HTMLAnchorElement>}
        href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={onWhatsappMouseEnter}
        onClick={onWhatsappClick}
        className="flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold text-white"
      >
        <MessageCircle className="h-4 w-4 text-green-400" /> WhatsApp
      </a>
    </div>
  );
}
