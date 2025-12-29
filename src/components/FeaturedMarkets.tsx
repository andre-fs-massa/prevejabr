import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MarketCard from "./MarketCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Flame } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Market {
  id: string;
  title: string;
  category: string;
  yes_probability: number;
  total_volume: number;
  end_date: string;
}

const FeaturedMarkets = () => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopMarkets();
  }, []);

  const fetchTopMarkets = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("markets")
      .select("id, title, category, yes_probability, total_volume, end_date")
      .eq("status", "open")
      .order("total_volume", { ascending: false })
      .limit(6);

    if (error) {
      console.error("Error fetching markets:", error);
    } else {
      setMarkets(data || []);
    }
    setLoading(false);
  };

  const formatVolume = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K pts`;
    }
    return `${value.toFixed(0)} pts`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      month: "short",
      year: "numeric",
    });
  };

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
          <Link to="/markets">
            <Button variant="outline" className="shrink-0">
              Ver todos os mercados
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Markets grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-card rounded-2xl border border-border p-6 animate-pulse"
              >
                <div className="flex justify-between mb-4">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-5 w-12" />
                </div>
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-6 w-3/4 mb-4" />
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                </div>
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : markets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Nenhum mercado disponível no momento.</p>
            <Link to="/markets">
              <Button>Ver todos os mercados</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {markets.map((market, index) => (
              <Link
                key={market.id}
                to={`/markets/${market.id}`}
                className="animate-fade-in block"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <MarketCard
                  title={market.title}
                  category={market.category}
                  yesPrice={Math.round(market.yes_probability * 100)}
                  noPrice={Math.round((1 - market.yes_probability) * 100)}
                  volume={formatVolume(market.total_volume)}
                  endDate={formatDate(market.end_date)}
                  trending={market.yes_probability >= 0.5 ? "up" : "down"}
                  featured={index === 0}
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedMarkets;
