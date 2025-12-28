import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, TrendingDown, AlertCircle, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface OrderFormProps {
  marketId: string;
  yesProbability: number;
  isOpen: boolean;
  onOrderPlaced: () => void;
}

const OrderForm = ({
  marketId,
  yesProbability,
  isOpen,
  onOrderPlaced,
}: OrderFormProps) => {
  const { user } = useAuth();
  const [selectedSide, setSelectedSide] = useState<"yes" | "no">("yes");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      const fetchBalance = async () => {
        const { data } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (data) {
          setBalance(Number(data.balance));
        }
      };
      fetchBalance();

      // Realtime subscription for balance updates
      const channel = supabase
        .channel('order-form-wallet')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'wallets',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            setBalance(Number(payload.new.balance));
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const currentPrice = selectedSide === "yes" ? yesProbability : 1 - yesProbability;
  const potentialReturn = amount ? parseFloat(amount) / currentPrice : 0;
  const profit = potentialReturn - parseFloat(amount || "0");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Você precisa estar logado para apostar");
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast.error("Insira um valor válido");
      return;
    }

    if (balance === null || amountValue > balance) {
      toast.error("Saldo insuficiente para realizar esta aposta");
      return;
    }

    setLoading(true);

    // Deduct from wallet first
    const { error: walletError } = await supabase
      .from("wallets")
      .update({ balance: balance - amountValue })
      .eq("user_id", user.id);

    if (walletError) {
      console.error("Error updating wallet:", walletError);
      toast.error("Erro ao processar pagamento");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("orders").insert({
      user_id: user.id,
      market_id: marketId,
      side: selectedSide,
      amount: amountValue,
      price: currentPrice,
    });

    if (error) {
      console.error("Error placing order:", error);
      // Refund the wallet if order failed
      await supabase
        .from("wallets")
        .update({ balance: balance })
        .eq("user_id", user.id);
      toast.error("Erro ao realizar aposta");
    } else {
      toast.success("Aposta realizada com sucesso!");
      setAmount("");
      onOrderPlaced();
    }

    setLoading(false);
  };

  if (!isOpen) {
    return (
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Mercado Fechado
          </h3>
          <p className="text-muted-foreground text-sm">
            Este mercado não está mais aceitando apostas.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Faça Login para Apostar
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            Você precisa estar logado para realizar apostas.
          </p>
          <Link to="/auth">
            <Button>Entrar</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6">
        Fazer Aposta
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Side Selection */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setSelectedSide("yes")}
            className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
              selectedSide === "yes"
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            }`}
          >
            <TrendingUp
              className={`w-6 h-6 mb-2 ${
                selectedSide === "yes" ? "text-primary" : "text-muted-foreground"
              }`}
            />
            <span
              className={`text-sm font-medium ${
                selectedSide === "yes" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              SIM
            </span>
            <span
              className={`text-2xl font-bold ${
                selectedSide === "yes" ? "text-primary" : "text-foreground"
              }`}
            >
              {(yesProbability * 100).toFixed(0)}%
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedSide("no")}
            className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
              selectedSide === "no"
                ? "border-destructive bg-destructive/10"
                : "border-border hover:border-destructive/50"
            }`}
          >
            <TrendingDown
              className={`w-6 h-6 mb-2 ${
                selectedSide === "no" ? "text-destructive" : "text-muted-foreground"
              }`}
            />
            <span
              className={`text-sm font-medium ${
                selectedSide === "no" ? "text-destructive" : "text-muted-foreground"
              }`}
            >
              NÃO
            </span>
            <span
              className={`text-2xl font-bold ${
                selectedSide === "no" ? "text-destructive" : "text-foreground"
              }`}
            >
              {((1 - yesProbability) * 100).toFixed(0)}%
            </span>
          </button>
        </div>

        {/* Balance Display */}
        {balance !== null && (
          <div className="flex items-center justify-between p-3 bg-primary/10 rounded-xl border border-primary/20">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Seu saldo:</span>
            </div>
            <span className="font-bold text-primary">R$ {balance.toFixed(2)}</span>
          </div>
        )}

        {/* Amount Input */}
        <div className="space-y-2">
          <Label htmlFor="amount">Valor da Aposta (R$)</Label>
          <Input
            id="amount"
            type="number"
            min="1"
            max={balance || undefined}
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-lg"
          />
          {amount && parseFloat(amount) > (balance || 0) && (
            <p className="text-xs text-destructive">Saldo insuficiente</p>
          )}
        </div>

        {/* Potential Return */}
        {amount && parseFloat(amount) > 0 && (
          <div className="bg-muted/50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Preço atual</span>
              <span className="font-medium text-foreground">
                {(currentPrice * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Retorno potencial</span>
              <span className="font-medium text-foreground">
                R$ {potentialReturn.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-border">
              <span className="text-muted-foreground">Lucro potencial</span>
              <span className="font-bold text-primary">
                +R$ {profit.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={loading || !amount || parseFloat(amount) <= 0}
        >
          {loading ? (
            "Processando..."
          ) : (
            <>
              Apostar{" "}
              {selectedSide === "yes" ? (
                <span className="ml-1 font-bold">SIM</span>
              ) : (
                <span className="ml-1 font-bold">NÃO</span>
              )}
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Ao apostar, você concorda com os termos de uso da plataforma.
        </p>
      </form>
    </div>
  );
};

export default OrderForm;
