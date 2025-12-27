import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturedMarkets from "@/components/FeaturedMarkets";
import Categories from "@/components/Categories";
import HowItWorks from "@/components/HowItWorks";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
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
