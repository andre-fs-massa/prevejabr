import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
const Hero = () => {
  const {
    data: marketCount = 0
  } = useQuery({
    queryKey: ['market-count'],
    queryFn: async () => {
      const {
        count,
        error
      } = await supabase.from('markets').select('*', {
        count: 'exact',
        head: true
      });
      if (error) throw error;
      return count || 0;
    }
  });
  return <section className="relative min-h-screen gradient-hero overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary-foreground/5 to-transparent rounded-full" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="container relative mx-auto px-4 pt-24 pb-16 sm:pt-32 sm:pb-20 md:pt-40 md:pb-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 mb-6 sm:mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-xs sm:text-sm font-medium text-primary-foreground/90">🎮 Jogo de previsões</span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground leading-tight mb-4 sm:mb-6 animate-fade-in px-2" style={{
          animationDelay: "0.1s"
        }}>
            Teste suas previsões{" "}
            <span className="text-gradient">sem riscos</span>
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-8 sm:mb-10 px-2 animate-fade-in" style={{
          animationDelay: "0.2s"
        }}>
            Jogue com pontos fictícios e descubra quem acerta mais. Eleições, economia, esportes e muito mais. 
            Pura diversão, zero apostas reais.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center mb-12 sm:mb-16 px-4 animate-fade-in" style={{
          animationDelay: "0.3s"
        }}>
            <Link to="/markets">
              <Button variant="hero" size="lg" className="w-full sm:w-auto">
                Começar Agora
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 max-w-2xl mx-auto animate-fade-in" style={{
          animationDelay: "0.4s"
        }}>
            <div className="flex items-center justify-center gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-secondary/20 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
              </div>
              <div className="text-left">
                <p className="text-xl sm:text-2xl font-bold text-primary-foreground">{marketCount}</p>
                <p className="text-xs sm:text-sm text-primary-foreground/60">Mercados ativos</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-secondary/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
              </div>
              <div className="text-left">
                <p className="text-xl sm:text-2xl font-bold text-primary-foreground">100%</p>
                <p className="text-xs sm:text-sm text-primary-foreground/60">Gratuito e seguro</p>
              </div>
            </div>
          </div>

          {/* Referral bonus text */}
          <p className="mt-6 text-sm text-primary-foreground/70 animate-fade-in" style={{ animationDelay: "0.5s" }}>
            🎁 Indique amigos e <span className="text-secondary font-semibold">ambos ganham 25 pontos</span> para jogar mais!
          </p>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))" />
        </svg>
      </div>
    </section>;
};
export default Hero;