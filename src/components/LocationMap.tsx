import { ArrowRight, ExternalLink, MapPin } from "lucide-react";
import { SITE } from "@/lib/content";
import CtaLink from "./CtaLink";

const NEARBY = [
  "Juinagar Railway Station — 4 mins",
  "Thane-Belapur Road — direct frontage",
  "Juinagar-Mulund Link Road — direct frontage",
  "Eastern Express Highway — quick access",
];

export default function LocationMap() {
  return (
    <section id="location" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold text-navy-900 sm:text-4xl">Location Advantage</h2>
          <p className="mt-3 text-navy-600">
            Strategically positioned in the heart of Juinagar&apos;s commercial belt.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <ul className="space-y-4">
              {NEARBY.map((item) => (
                <li key={item} className="flex items-start gap-3 rounded-xl border border-navy-200 p-4">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gold-500" />
                  <span className="text-sm font-medium text-navy-700">{item}</span>
                </li>
              ))}
            </ul>

            <a
              href={SITE.mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-gold-600 hover:text-gold-700"
            >
              Open in Google Maps <ExternalLink className="h-4 w-4" />
            </a>

            <div className="mt-6">
              <CtaLink
                ctaId="location-cta"
                href="#mid-cta-form"
                className="inline-flex items-center gap-2 rounded-lg bg-gold-500 px-6 py-3 text-sm font-semibold text-navy-950 transition hover:bg-gold-400"
              >
                Book Free Site Visit <ArrowRight className="h-4 w-4" />
              </CtaLink>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-navy-200 shadow-sm lg:col-span-3">
            <iframe
              title={`${SITE.projectName} location on Google Maps`}
              src={SITE.mapEmbedSrc}
              width="100%"
              height="420"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-[320px] w-full sm:h-[420px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
