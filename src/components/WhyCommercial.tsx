import { WHY_COMMERCIAL } from "@/lib/content";

export default function WhyCommercial() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold text-navy-900 sm:text-4xl">
            Why Invest in Commercial at Airoli
          </h2>
          <p className="mt-3 text-navy-600">
            Airoli is fast becoming Navi Mumbai&apos;s next big business corridor — here&apos;s why
            this is the right time to invest.
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {WHY_COMMERCIAL.map((item, i) => (
            <div key={item.title} className="relative rounded-2xl border border-navy-200 p-6">
              <span className="text-5xl font-black text-navy-100">0{i + 1}</span>
              <h3 className="mt-2 text-lg font-bold text-navy-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-600">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
