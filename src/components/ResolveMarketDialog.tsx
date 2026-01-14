import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Gavel, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ResolveMarketDialogProps {
  marketId: string;
  marketTitle: string;
  onResolved: () => void;
}

const sendPushNotifications = async (
  marketId: string,
  marketTitle: string,
  outcome: boolean
) => {
  try {
    // Get all orders for this market
    const { data: orders, error } = await supabase
      .from("orders")
      .select("user_id, side, amount, price")
      .eq("market_id", marketId)
      .eq("status", "filled");

    if (error || !orders) {
      console.error("Error fetching orders for notifications:", error);
      return;
    }

    // Group users by win/lose
    const winners: { userId: string; payout: number }[] = [];
    const losers: string[] = [];

    orders.forEach((order) => {
      const isWinner =
        (outcome === true && order.side === "yes") ||
        (outcome === false && order.side === "no");

      if (isWinner) {
        const payout =
          order.side === "yes"
            ? Number(order.amount) / Number(order.price)
            : Number(order.amount) / (1 - Number(order.price));
        winners.push({ userId: order.user_id, payout: Math.round(payout) });
      } else {
        if (!losers.includes(order.user_id)) {
          losers.push(order.user_id);
        }
      }
    });

    // Remove losers who also won (edge case: same user bet both sides)
    const winnerIds = winners.map((w) => w.userId);
    const onlyLosers = losers.filter((id) => !winnerIds.includes(id));

    // Send notifications to winners
    if (winners.length > 0) {
      const uniqueWinners = [...new Set(winnerIds)];
      await supabase.functions.invoke("send-push-notification", {
        body: {
          user_ids: uniqueWinners,
          title: "🎉 Você ganhou!",
          body: `Parabéns! Sua aposta no mercado "${marketTitle}" foi vencedora!`,
          url: `/markets/${marketId}`,
          tag: `market-${marketId}-win`,
        },
      });
    }

    // Send notifications to losers
    if (onlyLosers.length > 0) {
      await supabase.functions.invoke("send-push-notification", {
        body: {
          user_ids: onlyLosers,
          title: "📊 Mercado Resolvido",
          body: `O mercado "${marketTitle}" foi encerrado. Boa sorte na próxima!`,
          url: `/markets/${marketId}`,
          tag: `market-${marketId}-lose`,
        },
      });
    }
  } catch (error) {
    console.error("Error sending push notifications:", error);
  }
};

const ResolveMarketDialog = ({
  marketId,
  marketTitle,
  onResolved,
}: ResolveMarketDialogProps) => {
  const [open, setOpen] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState<boolean | null>(null);

  const handleResolve = async () => {
    if (selectedOutcome === null) {
      toast.error("Selecione um resultado");
      return;
    }

    setResolving(true);
    try {
      // First, update the market status and outcome
      const { error: updateError } = await supabase
        .from("markets")
        .update({
          status: "resolved",
          outcome: selectedOutcome,
        })
        .eq("id", marketId);

      if (updateError) throw updateError;

      // Then, distribute winnings to winners
      const { error: distributeError } = await supabase.rpc(
        "distribute_market_winnings",
        { market_id_param: marketId }
      );

      if (distributeError) {
        console.error("Error distributing winnings:", distributeError);
        toast.error(
          "Mercado resolvido, mas houve erro na distribuição de pontos"
        );
      } else {
        toast.success(
          `Mercado resolvido como ${selectedOutcome ? "SIM" : "NÃO"}. Pontos distribuídos aos vencedores!`
        );

        // Send push notifications to all participants
        sendPushNotifications(marketId, marketTitle, selectedOutcome);
      }

      setOpen(false);
      onResolved();
    } catch (error) {
      console.error("Error resolving market:", error);
      toast.error("Erro ao resolver mercado");
    } finally {
      setResolving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Gavel className="w-4 h-4" />
          Resolver Mercado
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Resolver Mercado</DialogTitle>
          <DialogDescription>
            Defina o resultado final para "{marketTitle}". Esta ação não pode ser
            desfeita.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-6">
          <button
            onClick={() => setSelectedOutcome(true)}
            className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 transition-all ${
              selectedOutcome === true
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            }`}
          >
            <CheckCircle
              className={`w-12 h-12 ${
                selectedOutcome === true ? "text-primary" : "text-muted-foreground"
              }`}
            />
            <span
              className={`text-lg font-semibold ${
                selectedOutcome === true ? "text-primary" : "text-foreground"
              }`}
            >
              SIM
            </span>
          </button>

          <button
            onClick={() => setSelectedOutcome(false)}
            className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 transition-all ${
              selectedOutcome === false
                ? "border-destructive bg-destructive/10"
                : "border-border hover:border-destructive/50"
            }`}
          >
            <XCircle
              className={`w-12 h-12 ${
                selectedOutcome === false
                  ? "text-destructive"
                  : "text-muted-foreground"
              }`}
            />
            <span
              className={`text-lg font-semibold ${
                selectedOutcome === false ? "text-destructive" : "text-foreground"
              }`}
            >
              NÃO
            </span>
          </button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleResolve}
            disabled={selectedOutcome === null || resolving}
          >
            {resolving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Resolvendo...
              </>
            ) : (
              "Confirmar Resultado"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResolveMarketDialog;
