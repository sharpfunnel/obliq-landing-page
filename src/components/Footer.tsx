import { SITE } from "@/lib/content";

export default function Footer() {
  return (
    <footer className="bg-navy-950 py-10 text-navy-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 border-b border-white/10 pb-8 sm:flex-row">
          <div className="text-center sm:text-left">
            <p className="text-lg font-bold text-white">{SITE.projectName}</p>
            <p className="text-sm">
              By {SITE.developer} &amp; {SITE.coDeveloper} · {SITE.location}
            </p>
          </div>
          <a
            href={`tel:${SITE.contactPhone}`}
            className="rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-navy-950 transition hover:bg-gold-400"
          >
            {SITE.contactName} · {SITE.contactPhoneDisplay}
          </a>
        </div>

        <div className="pt-6 text-center text-xs leading-relaxed text-navy-500 sm:text-left">
          <p>
            Disclaimer: This is not an official website of the developer or RERA. This is a
            channel partner marketing page for informational purposes only. Images shown are
            artistic renders / representative and are not indicative of the actual product. All
            prices, offers and plans are subject to change without prior notice and are not a
            legal offer. Please contact our sales team for accurate, up-to-date details before
            making any purchase decisions.
          </p>
          <p className="mt-3">© {new Date().getFullYear()} {SITE.projectName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
