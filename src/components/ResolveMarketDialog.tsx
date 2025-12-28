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
      const { error } = await supabase
        .from("markets")
        .update({
          status: "resolved",
          outcome: selectedOutcome,
        })
        .eq("id", marketId);

      if (error) throw error;

      toast.success(
        `Mercado resolvido como ${selectedOutcome ? "SIM" : "NÃO"}`
      );
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
