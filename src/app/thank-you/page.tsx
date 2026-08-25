import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Phone } from "lucide-react";
import ThankYouDetailsForm from "@/components/ThankYouDetailsForm";
import { SITE } from "@/lib/content";

export const metadata = {
  title: `Thank You | ${SITE.projectName}`,
};

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ leadId?: string }>;
}) {
  const { leadId } = await searchParams;

  return (
    <main className="relative min-h-screen overflow-hidden bg-navy-950">
      <Image
        src="/images/road-entrance.webp"
        alt="Codename Obliq commercial project"
        fill
        priority
        className="object-cover opacity-25"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-navy-950/80 via-navy-950/90 to-navy-950" />

      <div className="relative mx-auto flex max-w-xl flex-col items-center px-4 py-16 text-center sm:px-6">
        <p className="text-lg font-bold text-white">{SITE.projectName}</p>
        <p className="text-xs uppercase tracking-widest text-gold-400">{SITE.location}</p>

        <span className="mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 text-green-400">
          <CheckCircle2 className="h-8 w-8" />
        </span>

        <h1 className="mt-5 text-2xl font-extrabold text-white sm:text-3xl">
          Thank You for Reaching Out!
        </h1>
        <p className="mt-3 text-sm text-navy-300 sm:text-base">
          Your enquiry has been received. Our sales team will call you back within 30 minutes to
          help you take the next step.
        </p>

        <a
          href={`tel:${SITE.contactPhone}`}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold text-navy-950 transition hover:bg-gold-400"
        >
          <Phone className="h-4 w-4" /> {SITE.contactPhoneDisplay}
        </a>

        <div className="mt-10 w-full">
          <ThankYouDetailsForm leadId={leadId ?? null} />
        </div>

        <Link href="/" className="mt-8 text-sm font-medium text-gold-400 hover:text-gold-300">
          Back to Home
        </Link>
      </div>
    </main>
  );
}
