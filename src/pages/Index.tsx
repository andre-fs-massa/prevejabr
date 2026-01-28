import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturedMarkets from "@/components/FeaturedMarkets";
import Categories from "@/components/Categories";
import HowItWorks from "@/components/HowItWorks";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import InstallBanner from "@/components/InstallBanner";

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollTo === 'como-funciona') {
      // Small delay to ensure the page is rendered
      setTimeout(() => {
        document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      // Clean up the state to prevent re-scrolling on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  return (
    <div className="min-h-screen bg-background">
      <InstallBanner />
      <Header />
      <main>
        <Hero />
        <FeaturedMarkets />
        <Categories />
        <HowItWorks />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
