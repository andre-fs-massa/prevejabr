import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="relative rounded-3xl gradient-hero overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-secondary/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary-foreground/10 rounded-full blur-3xl" />
          </div>

          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

          <div className="relative px-8 py-16 md:px-16 md:py-24 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 mb-8">
              <Sparkles className="w-4 h-4 text-secondary" />
              <span className="text-sm font-medium text-primary-foreground/90">
                🎮 100% gratuito • Bônus de 100 pontos
              </span>
            </div>

            {/* Headline */}
            <h2 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground mb-6 max-w-3xl mx-auto">
              Pronto para testar suas previsões?
            </h2>

            {/* Subheadline */}
            <p className="text-lg text-primary-foreground/80 max-w-xl mx-auto mb-10">
              Junte-se a milhares de jogadores e descubra quem acerta mais. 
              Sem dinheiro real, pura diversão!
            </p>

            {/* CTA */}
            <Button variant="hero" size="xl">
              Começar a Jogar
              <ArrowRight className="w-5 h-5" />
            </Button>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-primary-foreground/60">
              <span>✓ 100% gratuito</span>
              <span>✓ Sem dinheiro real</span>
              <span>✓ Apenas entretenimento</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
