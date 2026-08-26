import { countryName } from "@/lib/geo/country-coords";

export default function TopCountries({ countries }: { countries: Array<{ code: string; visitors: number; leads: number }> }) {
  if (countries.length === 0) {
    return <p className="text-sm text-navy-400">No visitor data yet.</p>;
  }

  return (
    <div className="divide-y divide-navy-100">
      {countries.slice(0, 10).map((c) => (
        <div key={c.code} className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            {c.code !== "UNKNOWN" && (
              <span className="rounded bg-navy-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-navy-600">
                {c.code}
              </span>
            )}
            <span className="text-sm text-navy-800">{countryName(c.code)}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            {c.leads > 0 && <span className="font-semibold text-green-600">{c.leads} leads</span>}
            <span className="text-navy-500">{c.visitors}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
