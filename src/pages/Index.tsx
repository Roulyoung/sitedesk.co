import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import PainPoints from "@/components/PainPoints";
import Comparison from "@/components/Comparison";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <PainPoints />
        <Comparison />
        <FAQ />
        <Contact />
        <CTA />
      </main>
      <Footer />
      <FloatingContact />
    </div>
  );
};

export default Index;
