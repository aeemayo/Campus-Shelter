import SEO from "@/components/SEO";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/landing/Hero";
import PopularLocations from "@/components/landing/PopularLocations";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import CallToAction from "@/components/landing/CallToAction";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO path="/" jsonLd={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "CampusShelter",
        "url": "https://campusshelter.com",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://campusshelter.com/properties?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      }} />
      <Header />
      <main>
        <Hero />
        <PopularLocations />
        <Features />
        <HowItWorks />
        <Testimonials />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
