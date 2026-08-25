import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Highlights from "@/components/Highlights";
import PaymentPlans from "@/components/PaymentPlans";
import WhyCommercial from "@/components/WhyCommercial";
import Gallery from "@/components/Gallery";
import Configurations from "@/components/Configurations";
import LocationMap from "@/components/LocationMap";
import Developer from "@/components/Developer";
import MidCTA from "@/components/MidCTA";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import StickyMobileCTA from "@/components/StickyMobileCTA";

export default function Home() {
  return (
    <main className="pb-14 sm:pb-0">
      <Header />
      <Hero />
      <Highlights />
      <PaymentPlans />
      <WhyCommercial />
      <Gallery />
      <Configurations />
      <LocationMap />
      <Developer />
      <MidCTA />
      <FAQ />
      <Footer />
      <StickyMobileCTA />
    </main>
  );
}
