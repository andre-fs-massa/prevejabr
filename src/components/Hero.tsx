import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Users, Shield } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen gradient-hero overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary-foreground/5 to-transparent rounded-full" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="container relative mx-auto px-4 pt-32 pb-20 md:pt-40 md:pb-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-sm font-medium text-primary-foreground/90">
              Mercado de previsões 100% brasileiro
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground leading-tight mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Transforme sua opinião em{" "}
            <span className="text-gradient">oportunidade</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Compre e venda contratos sobre eventos reais. Eleições, economia, esportes e muito mais. 
            O futuro está nas suas mãos.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Button variant="hero" size="xl">
              Começar Agora
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="heroOutline" size="xl">
              Ver Mercados
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10">
              <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-secondary" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-primary-foreground">R$ 2.5M+</p>
                <p className="text-sm text-primary-foreground/60">Volume negociado</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10">
              <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-secondary" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-primary-foreground">50K+</p>
                <p className="text-sm text-primary-foreground/60">Usuários ativos</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10">
              <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-secondary" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-primary-foreground">100%</p>
                <p className="text-sm text-primary-foreground/60">Seguro e regulado</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))" />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
