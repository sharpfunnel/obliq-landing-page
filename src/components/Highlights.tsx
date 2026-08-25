import { Building2, MapPin, ShieldCheck, Wallet } from "lucide-react";
import { HIGHLIGHTS } from "@/lib/content";

const ICONS = [MapPin, Building2, ShieldCheck, Wallet];

export default function Highlights() {
  return (
    <section className="border-b border-navy-200 bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4 lg:px-8">
        {HIGHLIGHTS.map((item, i) => {
          const Icon = ICONS[i];
          return (
            <div key={item.title} className="flex flex-col items-start gap-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-50 text-gold-500">
                <Icon className="h-5 w-5" />
              </span>
              <p className="text-sm font-semibold text-navy-900">{item.title}</p>
              <p className="text-xs text-navy-500">{item.detail}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
