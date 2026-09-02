import LeadForm from "./LeadForm";

export default function MidCTA() {
  return (
    <section className="relative overflow-hidden bg-gold-500 py-16 sm:py-20">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-10 px-4 sm:px-6 lg:flex-row lg:justify-between lg:px-8">
        <div className="max-w-xl text-center lg:text-left">
          <h2 className="text-3xl font-extrabold text-navy-950 sm:text-4xl">
            Get Investment Details &amp; Floor Plans
          </h2>
          <p className="mt-3 text-navy-900/80">
            Share your details and our team will get in touch with pricing, floor plans and
            availability for {`Codename Tangent`}.
          </p>
        </div>

        <LeadForm
          variant="inline"
          heading="Get a Free Callback in 30 Minutes"
          subheading="Our team will reach out with complete project details."
          formId="mid-cta-form"
          source="mid-cta"
        />
      </div>
    </section>
  );
}
