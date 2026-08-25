import { Briefcase, Building, Store } from "lucide-react";
import { CONFIGURATIONS } from "@/lib/content";

const ICONS = [Briefcase, Building, Store];

export default function Configurations() {
  return (
    <section className="bg-navy-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold text-navy-900 sm:text-4xl">Configurations</h2>
          <p className="mt-3 text-navy-600">Spaces designed for every stage of business.</p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {CONFIGURATIONS.map((c, i) => {
            const Icon = ICONS[i];
            return (
              <div key={c.name} className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-navy-200">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold-50 text-gold-500">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-navy-900">{c.name}</h3>
                <p className="mt-1 text-sm font-medium text-gold-600">{c.size}</p>
                <p className="mt-3 text-sm text-navy-600">{c.detail}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
