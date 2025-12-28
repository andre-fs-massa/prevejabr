import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OrderForm from "@/components/OrderForm";
import ResolveMarketDialog from "@/components/ResolveMarketDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowLeft,
  Users,
  DollarSign,
  Gavel,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

interface Market {
  id: string;
  title: string;
  description: string | null;
  category: string;
  end_date: string;
  status: "open" | "closed" | "resolved";
  outcome: boolean | null;
  yes_probability: number;
  total_volume: number;
  created_at: string;
  created_by: string;
}

interface Order {
  id: string;
  side: "yes" | "no";
  amount: number;
  price: number;
  status: "pending" | "filled" | "cancelled";
  created_at: string;
}

const STATUS_LABELS = {
  open: "Aberto",
  closed: "Fechado",
  resolved: "Resolvido",
};

const MarketDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [market, setMarket] = useState<Market | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMarket = async () => {
    const { data, error } = await supabase
      .from("markets")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching market:", error);
      toast.error("Erro ao carregar mercado");
    } else {
      setMarket(data);
    }
    setLoading(false);
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("market_id", id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching orders:", error);
    } else {
      setOrders(data || []);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (id) {
      fetchMarket();
      fetchOrders();
    }
  }, [id]);

  // Realtime subscription for orders
  useEffect(() => {
    if (!id) return;

    const ordersChannel = supabase
      .channel(`orders-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `market_id=eq.${id}`,
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
    };
  }, [id]);

  // Realtime subscription for market probability updates
  useEffect(() => {
    if (!id) return;

    const marketChannel = supabase
      .channel(`market-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'markets',
          filter: `id=eq.${id}`,
        },
        (payload) => {
          setMarket((prev) => prev ? { ...prev, ...payload.new } : null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(marketChannel);
    };
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <Skeleton className="h-8 w-32 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Skeleton className="h-12 w-full mb-4" />
                <Skeleton className="h-6 w-3/4 mb-8" />
                <Skeleton className="h-40 w-full" />
              </div>
              <div>
                <Skeleton className="h-80 w-full" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!market) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Mercado não encontrado
            </h1>
            <p className="text-muted-foreground mb-6">
              O mercado que você está procurando não existe ou foi removido.
            </p>
            <Link to="/markets">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar aos Mercados
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const yesPercentage = market.yes_probability * 100;
  const noPercentage = (1 - market.yes_probability) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Link
            to="/markets"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar aos Mercados
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Market Info */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Header */}
              <div className="bg-card rounded-xl sm:rounded-2xl border border-border p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-xs">{market.category}</Badge>
                    <Badge
                      variant={market.status === "open" ? "default" : "secondary"}
                      className={`text-xs ${
                        market.status === "open"
                          ? "bg-primary/10 text-primary border-primary/20"
                          : ""
                      }`}
                    >
                      {STATUS_LABELS[market.status]}
                    </Badge>
                    {market.status === "resolved" && (
                      <Badge
                        variant={market.outcome ? "default" : "destructive"}
                        className={`text-xs ${
                          market.outcome
                            ? "bg-primary text-primary-foreground"
                            : "bg-destructive text-destructive-foreground"
                        }`}
                      >
                        Resultado: {market.outcome ? "SIM" : "NÃO"}
                      </Badge>
                    )}
                  </div>
                  {user?.id === market.created_by && market.status === "open" && (
                    <ResolveMarketDialog
                      marketId={market.id}
                      marketTitle={market.title}
                      onResolved={fetchMarket}
                    />
                  )}
                </div>

                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3 sm:mb-4">
                  {market.title}
                </h1>

                {market.description && (
                  <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                    {market.description}
                  </p>
                )}

                {/* Probability Display */}
                <div className="bg-muted/50 rounded-lg sm:rounded-xl p-4 sm:p-6">
                  <div className="flex justify-between items-center mb-3 sm:mb-4">
                    <div className="text-center">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-primary mb-1">
                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-2xl sm:text-3xl font-bold">
                          {yesPercentage.toFixed(0)}%
                        </span>
                      </div>
                      <span className="text-xs sm:text-sm text-muted-foreground">SIM</span>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-destructive mb-1">
                        <span className="text-2xl sm:text-3xl font-bold">
                          {noPercentage.toFixed(0)}%
                        </span>
                        <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="text-xs sm:text-sm text-muted-foreground">NÃO</span>
                    </div>
                  </div>
                  <div className="h-3 sm:h-4 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500"
                      style={{ width: `${yesPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Meta Info */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-2 text-muted-foreground text-center sm:text-left">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs">Encerra em</p>
                      <p className="text-xs sm:text-sm font-medium text-foreground truncate">
                        {formatDate(market.end_date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-2 text-muted-foreground text-center sm:text-left">
                    <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs">Volume</p>
                      <p className="text-xs sm:text-sm font-medium text-foreground truncate">
                        {formatCurrency(market.total_volume)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-2 text-muted-foreground text-center sm:text-left">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs">Ordens</p>
                      <p className="text-xs sm:text-sm font-medium text-foreground">
                        {orders.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-card rounded-xl sm:rounded-2xl border border-border p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">
                  Ordens Recentes
                </h2>
                {orders.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6 sm:py-8">
                    Nenhuma ordem realizada ainda.
                  </p>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {orders.slice(0, 10).map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between py-2 sm:py-3 border-b border-border last:border-0"
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Badge
                            variant={order.side === "yes" ? "default" : "destructive"}
                            className={`text-xs ${
                              order.side === "yes"
                                ? "bg-primary/10 text-primary"
                                : "bg-destructive/10 text-destructive"
                            }`}
                          >
                            {order.side === "yes" ? "SIM" : "NÃO"}
                          </Badge>
                          <span className="text-xs sm:text-sm text-muted-foreground">
                            {formatCurrency(order.amount)} @{" "}
                            {(order.price * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              order.status === "filled"
                                ? "text-primary"
                                : order.status === "cancelled"
                                ? "text-destructive"
                                : ""
                            }`}
                          >
                            {order.status === "pending"
                              ? "Pendente"
                              : order.status === "filled"
                              ? "Preenchido"
                              : "Cancelado"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Order Form Sidebar */}
            <div className="lg:col-span-1 order-first lg:order-last">
              <div className="lg:sticky lg:top-24">
                <OrderForm
                  marketId={market.id}
                  yesProbability={market.yes_probability}
                  isOpen={market.status === "open"}
                  onOrderPlaced={fetchOrders}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MarketDetail;
