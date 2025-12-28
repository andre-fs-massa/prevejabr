import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingUp, TrendingDown, Clock, Trophy, XCircle, PlusCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Order {
  id: string;
  side: "yes" | "no";
  amount: number;
  price: number;
  status: string;
  created_at: string;
  market: {
    id: string;
    title: string;
    status: string;
    outcome: boolean | null;
  };
}

interface Market {
  id: string;
  title: string;
  category: string;
  status: string;
  outcome: boolean | null;
  yes_probability: number;
  total_volume: number;
  end_date: string;
}

const Profile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState<number | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [createdMarkets, setCreatedMarkets] = useState<Market[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    setLoadingData(true);

    // Fetch wallet
    const { data: walletData } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", user.id)
      .maybeSingle();

    if (walletData) {
      setBalance(Number(walletData.balance));
    }

    // Fetch orders with market info
    const { data: ordersData } = await supabase
      .from("orders")
      .select(`
        id,
        side,
        amount,
        price,
        status,
        created_at,
        market_id
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (ordersData) {
      // Fetch market info for each order
      const marketIds = [...new Set(ordersData.map((o) => o.market_id))];
      const { data: marketsData } = await supabase
        .from("markets")
        .select("id, title, status, outcome")
        .in("id", marketIds);

      const marketsMap = new Map(marketsData?.map((m) => [m.id, m]) || []);

      const ordersWithMarkets = ordersData.map((order) => ({
        ...order,
        market: marketsMap.get(order.market_id) || {
          id: order.market_id,
          title: "Mercado não encontrado",
          status: "unknown",
          outcome: null,
        },
      }));

      setOrders(ordersWithMarkets);
    }

    // Fetch markets created by user
    const { data: createdMarketsData } = await supabase
      .from("markets")
      .select("id, title, category, status, outcome, yes_probability, total_volume, end_date")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false });

    if (createdMarketsData) {
      setCreatedMarkets(createdMarketsData);
    }

    setLoadingData(false);
  };

  const calculateStats = () => {
    let totalBet = 0;
    let potentialWins = 0;
    let confirmedWins = 0;
    let confirmedLosses = 0;

    orders.forEach((order) => {
      const amount = Number(order.amount);
      const price = Number(order.price);
      const potentialReturn = price > 0 ? amount / price : 0;

      totalBet += amount;

      if (order.market.status === "resolved" && order.market.outcome !== null) {
        const won =
          (order.side === "yes" && order.market.outcome === true) ||
          (order.side === "no" && order.market.outcome === false);

        if (won) {
          confirmedWins += potentialReturn - amount;
        } else {
          confirmedLosses += amount;
        }
      } else {
        potentialWins += potentialReturn - amount;
      }
    });

    return { totalBet, potentialWins, confirmedWins, confirmedLosses };
  };

  const stats = calculateStats();

  if (loading || loadingData) {
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
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 sm:mb-8">Meu Perfil</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Saldo Atual
              </CardTitle>
              <Wallet className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-lg sm:text-2xl font-bold text-primary">
                R$ {balance?.toFixed(2) || "0.00"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Total Apostado
              </CardTitle>
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-lg sm:text-2xl font-bold">
                R$ {stats.totalBet.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Lucro
              </CardTitle>
              <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-lg sm:text-2xl font-bold text-green-500">
                +R$ {stats.confirmedWins.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Perdas
              </CardTitle>
              <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-lg sm:text-2xl font-bold text-destructive">
                -R$ {stats.confirmedLosses.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Created Markets */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <PlusCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              Mercados Criados
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            {createdMarkets.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6 sm:py-8">
                Você ainda não criou nenhum mercado.
              </p>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {createdMarkets.map((market) => (
                  <Link
                    key={market.id}
                    to={`/markets/${market.id}`}
                    className="flex flex-col p-3 sm:p-4 rounded-lg sm:rounded-xl border border-border hover:bg-muted/50 transition-colors gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm sm:text-base mb-1 line-clamp-2">
                        {market.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                        <Badge variant="outline" className="text-[10px] sm:text-xs">
                          {market.category}
                        </Badge>
                        <span>•</span>
                        <span>
                          {format(new Date(market.end_date), "dd MMM yyyy", {
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 pt-2 border-t border-border sm:border-0 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <p className="text-xs text-muted-foreground">Volume</p>
                        <p className="font-semibold text-sm sm:text-base">
                          R$ {Number(market.total_volume).toFixed(2)}
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="text-xs text-muted-foreground">Prob. SIM</p>
                        <p className="font-semibold text-sm sm:text-base text-primary">
                          {(Number(market.yes_probability) * 100).toFixed(0)}%
                        </p>
                      </div>

                      {market.status === "resolved" ? (
                        <Badge
                          className={
                            market.outcome
                              ? "bg-green-500/10 text-green-500 border-green-500/20 text-xs"
                              : "bg-destructive/10 text-destructive border-destructive/20 text-xs"
                          }
                        >
                          {market.outcome ? "SIM" : "NÃO"}
                        </Badge>
                      ) : market.status === "closed" ? (
                        <Badge variant="secondary" className="text-xs">
                          Fechado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground text-xs">
                          Aberto
                        </Badge>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Orders History */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
              Histórico de Apostas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            {orders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6 sm:py-8">
                Você ainda não fez nenhuma aposta.
              </p>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {orders.map((order) => {
                  const potentialReturn = Number(order.amount) / Number(order.price);
                  const isWinner =
                    order.market.status === "resolved" &&
                    order.market.outcome !== null &&
                    ((order.side === "yes" && order.market.outcome === true) ||
                      (order.side === "no" && order.market.outcome === false));
                  const isLoser =
                    order.market.status === "resolved" &&
                    order.market.outcome !== null &&
                    !isWinner;

                  return (
                    <div
                      key={order.id}
                      className="flex flex-col p-3 sm:p-4 rounded-lg sm:rounded-xl border border-border hover:bg-muted/50 transition-colors gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm sm:text-base mb-1 line-clamp-2">
                          {order.market.title}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                          <Badge
                            variant={order.side === "yes" ? "default" : "destructive"}
                            className="text-[10px] sm:text-xs"
                          >
                            {order.side === "yes" ? "SIM" : "NÃO"}
                          </Badge>
                          <span>R$ {Number(order.amount).toFixed(2)}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="hidden sm:inline">
                            {format(new Date(order.created_at), "dd MMM yyyy, HH:mm", {
                              locale: ptBR,
                            })}
                          </span>
                          <span className="sm:hidden">
                            {format(new Date(order.created_at), "dd/MM/yy", {
                              locale: ptBR,
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 pt-2 border-t border-border sm:border-0 sm:pt-0">
                        <div className="text-left sm:text-right">
                          <p className="text-xs text-muted-foreground">Retorno</p>
                          <p className="font-semibold text-sm sm:text-base">R$ {potentialReturn.toFixed(2)}</p>
                        </div>

                        {order.market.status === "resolved" ? (
                          isWinner ? (
                            <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-xs">
                              <Trophy className="w-3 h-3 mr-1" />
                              Ganhou
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="bg-destructive/10 text-xs">
                              <XCircle className="w-3 h-3 mr-1" />
                              Perdeu
                            </Badge>
                          )
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            Pendente
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
