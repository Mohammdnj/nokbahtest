import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import WhyUs from "@/components/WhyUs";
import Pricing from "@/components/Pricing";
import CTA from "@/components/CTA";
import TrustedBy from "@/components/TrustedBy";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <WhyUs />
        <Pricing />
        <CTA />
        <TrustedBy />
      </main>
      <Footer />
    </>
  );
}
