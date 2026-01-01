import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CreateMarketDialog from "@/components/CreateMarketDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, TrendingDown, Clock, Filter } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

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
}

const CATEGORIES = [
  "Todos",
  "Política",
  "Economia",
  "Esportes",
  "Entretenimento",
  "Tecnologia",
  "Mundo",
  "Clima",
];

const STATUS_LABELS = {
  open: "Aberto",
  closed: "Fechado",
  resolved: "Resolvido",
};

const CATEGORY_ALIASES: Record<string, string> = {
  Internacional: "Mundo",
};

const normalizeCategory = (category: string) => CATEGORY_ALIASES[category] ?? category;

const isValidStatus = (status: string) =>
  status === "all" || status === "open" || status === "closed" || status === "resolved";

const Markets = () => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetchMarkets();
  }, []);

  useEffect(() => {
    const categoriaParam =
      searchParams.get("categoria") ?? searchParams.get("category");
    const statusParam = searchParams.get("status");

    if (categoriaParam) {
      const normalizedCategory = normalizeCategory(categoriaParam);
      setSelectedCategory(
        CATEGORIES.includes(normalizedCategory) ? normalizedCategory : "Todos"
      );
    }

    if (statusParam && isValidStatus(statusParam)) {
      setSelectedStatus(statusParam);
    }
  }, [searchParams]);

  const fetchMarkets = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("markets")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching markets:", error);
    } else {
      setMarkets(data || []);
    }
    setLoading(false);
  };

  const filteredMarkets = markets.filter((market) => {
    const matchesSearch =
      market.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      market.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "Todos" || normalizeCategory(market.category) === selectedCategory;

    const matchesStatus =
      selectedStatus === "all" || market.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 sm:mb-12">
            <div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-foreground mb-2">
                Mercados de Previsão
              </h1>
              <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl">
                Explore todos os mercados disponíveis e faça suas previsões sobre
                eventos futuros.
              </p>
            </div>
            <CreateMarketDialog onMarketCreated={fetchMarkets} />
          </div>

          {/* Filters */}
          <div className="bg-card rounded-xl sm:rounded-2xl shadow-card border border-border p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col gap-3 sm:gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                <Input
                  placeholder="Buscar mercados..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 sm:pl-10 text-sm sm:text-base"
                />
              </div>

              <div className="grid grid-cols-2 md:flex md:flex-row gap-2 sm:gap-4">
                {/* Category Filter */}
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="open">Aberto</SelectItem>
                    <SelectItem value="closed">Fechado</SelectItem>
                    <SelectItem value="resolved">Resolvido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters */}
            {(selectedCategory !== "Todos" || selectedStatus !== "all" || searchQuery) && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Filter className="w-4 h-4" />
                  Filtros ativos:
                </span>
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    Busca: "{searchQuery}"
                    <button
                      onClick={() => setSearchQuery("")}
                      className="ml-1 hover:text-foreground"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {selectedCategory !== "Todos" && (
                  <Badge variant="secondary" className="gap-1">
                    {selectedCategory}
                    <button
                      onClick={() => setSelectedCategory("Todos")}
                      className="ml-1 hover:text-foreground"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {selectedStatus !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    {STATUS_LABELS[selectedStatus as keyof typeof STATUS_LABELS]}
                    <button
                      onClick={() => setSelectedStatus("all")}
                      className="ml-1 hover:text-foreground"
                    >
                      ×
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="mb-4 sm:mb-6">
            <p className="text-sm sm:text-base text-muted-foreground">
              {filteredMarkets.length}{" "}
              {filteredMarkets.length === 1 ? "mercado encontrado" : "mercados encontrados"}
            </p>
          </div>

          {/* Markets Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-card rounded-xl sm:rounded-2xl border border-border p-4 sm:p-6 animate-pulse"
                >
                  <div className="h-4 bg-muted rounded w-20 mb-4" />
                  <div className="h-6 bg-muted rounded w-full mb-2" />
                  <div className="h-4 bg-muted rounded w-3/4 mb-6" />
                  <div className="h-10 bg-muted rounded mb-4" />
                  <div className="flex justify-between">
                    <div className="h-4 bg-muted rounded w-24" />
                    <div className="h-4 bg-muted rounded w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredMarkets.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Search className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                Nenhum mercado encontrado
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                Tente ajustar os filtros ou buscar por outros termos.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("Todos");
                  setSelectedStatus("all");
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredMarkets.map((market) => (
                <Link to={`/markets/${market.id}`} key={market.id}>
                <article
                  className="bg-card rounded-xl sm:rounded-2xl border border-border p-4 sm:p-6 hover:shadow-card transition-all duration-300 group cursor-pointer"
                >
                  {/* Category & Status */}
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <Badge variant="outline" className="text-[10px] sm:text-xs">
                      {market.category}
                    </Badge>
                    <Badge
                      variant={
                        market.status === "open"
                          ? "default"
                          : market.status === "closed"
                          ? "secondary"
                          : "outline"
                      }
                      className={`text-[10px] sm:text-xs ${
                        market.status === "open"
                          ? "bg-primary/10 text-primary border-primary/20"
                          : ""
                      }`}
                    >
                      {STATUS_LABELS[market.status]}
                    </Badge>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1.5 sm:mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {market.title}
                  </h3>
                  {market.description && (
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2">
                      {market.description}
                    </p>
                  )}

                  {/* Probability Bar */}
                  <div className="mb-3 sm:mb-4">
                    <div className="flex justify-between text-xs sm:text-sm mb-1.5 sm:mb-2">
                      <span className="text-primary font-medium flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                        Sim {(market.yes_probability * 100).toFixed(0)}%
                      </span>
                      <span className="text-destructive font-medium flex items-center gap-1">
                        Não {((1 - market.yes_probability) * 100).toFixed(0)}%
                        <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />
                      </span>
                    </div>
                    <div className="h-1.5 sm:h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${market.yes_probability * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground pt-3 sm:pt-4 border-t border-border">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                      {formatDate(market.end_date)}
                    </span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(market.total_volume)}
                    </span>
                  </div>
                </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Markets;
