import { SITE } from "@/lib/content";

export default function Developer() {
  return (
    <section className="bg-navy-900 py-16 text-white sm:py-20">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold sm:text-4xl">
          By {SITE.developer} &amp; {SITE.coDeveloper}
        </h2>
        <p className="mt-4 text-navy-300">
          {SITE.projectName} brings together the development expertise of {SITE.developer} and{" "}
          {SITE.coDeveloper} — a partnership focused on delivering quality commercial spaces with
          transparent execution and timely delivery across Navi Mumbai&apos;s growth corridors.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {[
            { label: "CC Received", value: "✓" },
            { label: "Commercial Frontage", value: "2 Roads" },
            { label: "Mins from Station", value: "4" },
            { label: "Payment Plans", value: "2" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-extrabold text-gold-400">{stat.value}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-navy-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
