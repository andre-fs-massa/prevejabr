import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Clock, Users } from "lucide-react";

interface MarketCardProps {
  title: string;
  category: string;
  yesPrice: number;
  noPrice: number;
  volume: string;
  endDate: string;
  traders: number;
  trending?: "up" | "down";
  featured?: boolean;
}

const MarketCard = ({
  title,
  category,
  yesPrice,
  noPrice,
  volume,
  endDate,
  traders,
  trending = "up",
  featured = false,
}: MarketCardProps) => {
  return (
    <div
      className={`group relative rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] ${
        featured
          ? "bg-gradient-to-br from-primary/10 via-card to-card border-2 border-primary/20 shadow-glow"
          : "bg-card border border-border shadow-soft hover:shadow-card"
      }`}
    >
      {/* Category badge */}
      <div className="flex items-center justify-between mb-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
          {category}
        </span>
        {trending === "up" ? (
          <div className="flex items-center gap-1 text-primary text-sm font-medium">
            <TrendingUp className="w-4 h-4" />
            <span>+5%</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-destructive text-sm font-medium">
            <TrendingDown className="w-4 h-4" />
            <span>-3%</span>
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="font-display text-lg font-bold text-foreground mb-4 line-clamp-2 group-hover:text-primary transition-colors">
        {title}
      </h3>

      {/* Prices */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button className="flex flex-col items-center p-3 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all">
          <span className="text-xs text-muted-foreground mb-1">SIM</span>
          <span className="text-xl font-bold text-primary">{yesPrice}¢</span>
        </button>
        <button className="flex flex-col items-center p-3 rounded-xl bg-destructive/10 border border-destructive/20 hover:bg-destructive/20 transition-all">
          <span className="text-xs text-muted-foreground mb-1">NÃO</span>
          <span className="text-xl font-bold text-destructive">{noPrice}¢</span>
        </button>
      </div>

      {/* Meta info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-border pt-4">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{endDate}</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>{traders}</span>
        </div>
        <span className="font-medium text-foreground">{volume}</span>
      </div>
    </div>
  );
};

export default MarketCard;
