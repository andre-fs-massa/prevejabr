import MarketCard from "./MarketCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Flame } from "lucide-react";

const markets = [
  {
    title: "Lula será reeleito em 2026?",
    category: "Política",
    yesPrice: 42,
    noPrice: 58,
    volume: "R$ 523K",
    endDate: "Out 2026",
    traders: 12453,
    trending: "up" as const,
    featured: true,
  },
  {
    title: "Selic abaixo de 10% até dezembro?",
    category: "Economia",
    yesPrice: 35,
    noPrice: 65,
    volume: "R$ 189K",
    endDate: "Dez 2024",
    traders: 5621,
    trending: "down" as const,
  },
  {
    title: "Brasil campeão da Copa América 2025?",
    category: "Esportes",
    yesPrice: 68,
    noPrice: 32,
    volume: "R$ 892K",
    endDate: "Jul 2025",
    traders: 28934,
    trending: "up" as const,
  },
  {
    title: "Novo iPhone será lançado em setembro?",
    category: "Tecnologia",
    yesPrice: 89,
    noPrice: 11,
    volume: "R$ 45K",
    endDate: "Set 2024",
    traders: 2341,
    trending: "up" as const,
  },
  {
    title: "BBB 25 terá mais de 100M de votos na final?",
    category: "Entretenimento",
    yesPrice: 72,
    noPrice: 28,
    volume: "R$ 234K",
    endDate: "Abr 2025",
    traders: 8765,
    trending: "up" as const,
  },
  {
    title: "Dólar acima de R$ 6,00 em janeiro?",
    category: "Economia",
    yesPrice: 55,
    noPrice: 45,
    volume: "R$ 678K",
    endDate: "Jan 2025",
    traders: 15678,
    trending: "down" as const,
  },
];

const FeaturedMarkets = () => {
  return (
    <section id="mercados" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-5 h-5 text-secondary" />
              <span className="text-sm font-semibold text-secondary uppercase tracking-wide">
                Em alta agora
              </span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              Mercados em Destaque
            </h2>
            <p className="text-muted-foreground max-w-lg">
              Os eventos mais negociados da semana. Aproveite as oportunidades antes que acabem.
            </p>
          </div>
          <Button variant="outline" className="shrink-0">
            Ver todos os mercados
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Markets grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {markets.map((market, index) => (
            <div
              key={index}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <MarketCard {...market} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedMarkets;
