import { Phone } from "lucide-react";
import { SITE } from "@/lib/content";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-navy-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col leading-tight">
          <span className="text-lg font-bold tracking-tight text-white sm:text-xl">
            {SITE.projectName}
          </span>
          <span className="text-[11px] uppercase tracking-widest text-gold-400">{SITE.location}</span>
        </div>

        <a
          href={`tel:${SITE.contactPhone}`}
          className="flex items-center gap-2 rounded-full bg-gold-500 px-4 py-2 text-sm font-semibold text-navy-950 transition hover:bg-gold-400 sm:px-5"
        >
          <Phone className="h-4 w-4" />
          <span className="hidden sm:inline">{SITE.contactPhoneDisplay}</span>
          <span className="sm:hidden">Call Now</span>
        </a>
      </div>
    </header>
  );
}
