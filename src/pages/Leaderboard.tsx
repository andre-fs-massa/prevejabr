import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  total_profit: number;
  total_bets: number;
  wins: number;
}

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);

    // Fetch all orders with resolved markets
    const { data: ordersData } = await supabase
      .from("orders")
      .select(`
        user_id,
        side,
        amount,
        price,
        market_id
      `)
      .eq("status", "filled");

    if (!ordersData || ordersData.length === 0) {
      setLoading(false);
      return;
    }

    // Get unique market IDs
    const marketIds = [...new Set(ordersData.map((o) => o.market_id))];

    // Fetch resolved markets
    const { data: marketsData } = await supabase
      .from("markets")
      .select("id, outcome")
      .in("id", marketIds)
      .eq("status", "resolved");

    if (!marketsData) {
      setLoading(false);
      return;
    }

    const marketsMap = new Map(marketsData.map((m) => [m.id, m.outcome]));

    // Calculate profits per user
    const userStats: Record<string, { profit: number; bets: number; wins: number }> = {};

    ordersData.forEach((order) => {
      const outcome = marketsMap.get(order.market_id);
      if (outcome === undefined || outcome === null) return;

      const amount = Number(order.amount);
      const price = Number(order.price);
      const potentialReturn = price > 0 ? amount / price : 0;

      const won =
        (order.side === "yes" && outcome === true) ||
        (order.side === "no" && outcome === false);

      if (!userStats[order.user_id]) {
        userStats[order.user_id] = { profit: 0, bets: 0, wins: 0 };
      }

      userStats[order.user_id].bets += 1;

      if (won) {
        userStats[order.user_id].profit += potentialReturn - amount;
        userStats[order.user_id].wins += 1;
      } else {
        userStats[order.user_id].profit -= amount;
      }
    });

    // Get user profiles (nicknames)
    const userIds = Object.keys(userStats);
    
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("user_id, nickname")
      .in("user_id", userIds);

    const profilesMap = new Map<string, string | null>();
    profilesData?.forEach((p) => {
      profilesMap.set(p.user_id, p.nickname);
    });

    const leaderboardEntries: LeaderboardEntry[] = userIds
      .map((userId) => {
        const nickname = profilesMap.get(userId);
        return {
          user_id: userId,
          display_name: nickname ? `@${nickname}` : `Usuário ${userId.slice(0, 8)}`,
          total_profit: userStats[userId].profit,
          total_bets: userStats[userId].bets,
          wins: userStats[userId].wins,
        };
      })
      .sort((a, b) => b.total_profit - a.total_profit)
      .slice(0, 50);

    setLeaderboard(leaderboardEntries);
    setLoading(false);
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />;
    if (index === 1) return <Medal className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />;
    if (index === 2) return <Award className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />;
    return <span className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-sm font-bold text-muted-foreground">{index + 1}</span>;
  };

  const getRankBadge = (index: number) => {
    if (index === 0) return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    if (index === 1) return "bg-gray-400/10 text-gray-400 border-gray-400/20";
    if (index === 2) return "bg-amber-600/10 text-amber-600 border-amber-600/20";
    return "";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl gradient-hero flex items-center justify-center">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Ranking</h1>
            <p className="text-sm text-muted-foreground">Os melhores apostadores da plataforma</p>
          </div>
        </div>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Top Apostadores
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            {leaderboard.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6 sm:py-8">
                Ainda não há dados suficientes para o ranking.
              </p>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.user_id}
                    className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl border transition-colors ${
                      index < 3
                        ? `${getRankBadge(index)} border-current/20`
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-center w-8 sm:w-10">
                      {getRankIcon(index)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm sm:text-base truncate">
                        {entry.display_name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{entry.total_bets} apostas</span>
                        <span>•</span>
                        <span>{entry.wins} vitórias</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`font-bold text-sm sm:text-lg ${
                          entry.total_profit >= 0 ? "text-green-500" : "text-destructive"
                        }`}
                      >
                        {entry.total_profit >= 0 ? "+" : ""}R$ {entry.total_profit.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">lucro total</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Leaderboard;
