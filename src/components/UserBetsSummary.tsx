import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, History } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface UserBet {
  id: string;
  side: "yes" | "no";
  amount: number;
  price: number;
  created_at: string;
}

interface UserBetsSummaryProps {
  marketId: string;
  userId: string;
  refreshTrigger?: number;
}

const UserBetsSummary = ({ marketId, userId, refreshTrigger }: UserBetsSummaryProps) => {
  const [bets, setBets] = useState<UserBet[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchUserBets = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select("id, side, amount, price, created_at")
        .eq("market_id", marketId)
        .eq("user_id", userId)
        .eq("status", "filled")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching user bets:", error);
      } else {
        setBets(data || []);
      }
      setLoading(false);
    };

    fetchUserBets();

    // Subscribe to order changes for this market and user
    const channel = supabase
      .channel(`user-bets-${marketId}-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `market_id=eq.${marketId}`,
        },
        (payload) => {
          if (payload.new && (payload.new as UserBet & { user_id: string }).user_id === userId) {
            fetchUserBets();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [marketId, userId, refreshTrigger]);

  if (loading) {
    return (
      <div className="bg-muted/30 rounded-lg p-3 animate-pulse">
        <div className="h-4 bg-muted rounded w-1/2"></div>
      </div>
    );
  }

  if (bets.length === 0) {
    return null;
  }

  // Calculate totals
  const yesTotal = bets
    .filter((bet) => bet.side === "yes")
    .reduce((sum, bet) => sum + Number(bet.amount), 0);
  
  const noTotal = bets
    .filter((bet) => bet.side === "no")
    .reduce((sum, bet) => sum + Number(bet.amount), 0);
  
  const totalExposure = yesTotal + noTotal;
  const betCount = bets.length;

  return (
    <div className="bg-muted/30 rounded-lg sm:rounded-xl border border-border overflow-hidden">
      {/* Summary Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            Suas apostas neste mercado
          </span>
          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
            {betCount} {betCount === 1 ? "aposta" : "apostas"}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {/* Exposure Summary - Always visible */}
      <div className="px-3 sm:px-4 pb-3 sm:pb-4 grid grid-cols-3 gap-2 sm:gap-3">
        <div className="text-center p-2 bg-background rounded-lg">
          <p className="text-xs text-muted-foreground mb-0.5">Total</p>
          <p className="text-sm sm:text-base font-bold text-foreground">
            {totalExposure.toFixed(0)} pts
          </p>
        </div>
        <div className="text-center p-2 bg-primary/10 rounded-lg border border-primary/20">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <TrendingUp className="w-3 h-3 text-primary" />
            <p className="text-xs text-primary">SIM</p>
          </div>
          <p className="text-sm sm:text-base font-bold text-primary">
            {yesTotal.toFixed(0)} pts
          </p>
        </div>
        <div className="text-center p-2 bg-destructive/10 rounded-lg border border-destructive/20">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <TrendingDown className="w-3 h-3 text-destructive" />
            <p className="text-xs text-destructive">NÃO</p>
          </div>
          <p className="text-sm sm:text-base font-bold text-destructive">
            {noTotal.toFixed(0)} pts
          </p>
        </div>
      </div>

      {/* Bet History - Expandable */}
      {expanded && (
        <div className="border-t border-border">
          <div className="p-3 sm:p-4 space-y-2 max-h-48 overflow-y-auto">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Histórico de apostas
            </p>
            {bets.map((bet) => (
              <div
                key={bet.id}
                className="flex items-center justify-between p-2 bg-background rounded-lg text-xs sm:text-sm"
              >
                <div className="flex items-center gap-2">
                  {bet.side === "yes" ? (
                    <div className="flex items-center gap-1 text-primary">
                      <TrendingUp className="w-3 h-3" />
                      <span className="font-medium">SIM</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-destructive">
                      <TrendingDown className="w-3 h-3" />
                      <span className="font-medium">NÃO</span>
                    </div>
                  )}
                  <span className="text-muted-foreground">
                    @ {(Number(bet.price) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-foreground">
                    {Number(bet.amount).toFixed(0)} pts
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {format(new Date(bet.created_at), "dd/MM HH:mm", { locale: ptBR })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserBetsSummary;
