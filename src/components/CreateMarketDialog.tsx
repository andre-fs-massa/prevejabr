import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Plus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const CATEGORIES = [
  "Política",
  "Economia",
  "Esportes",
  "Entretenimento",
  "Tecnologia",
  "Clima",
];

const marketSchema = z.object({
  title: z
    .string()
    .trim()
    .min(10, { message: "O título deve ter pelo menos 10 caracteres" })
    .max(200, { message: "O título deve ter no máximo 200 caracteres" }),
  description: z
    .string()
    .trim()
    .max(1000, { message: "A descrição deve ter no máximo 1000 caracteres" })
    .optional(),
  category: z.string({ required_error: "Selecione uma categoria" }),
  end_date: z.date({
    required_error: "Selecione a data de encerramento",
  }).refine((date) => date > new Date(), {
    message: "A data deve ser no futuro",
  }),
});

type MarketFormData = z.infer<typeof marketSchema>;

interface CreateMarketDialogProps {
  onMarketCreated?: () => void;
}

const CreateMarketDialog = ({ onMarketCreated }: CreateMarketDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<MarketFormData>({
    resolver: zodResolver(marketSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const onSubmit = async (data: MarketFormData) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para criar um mercado.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("markets").insert({
      title: data.title,
      description: data.description || null,
      category: data.category,
      end_date: data.end_date.toISOString(),
      created_by: user.id,
    });

    setLoading(false);

    if (error) {
      console.error("Error creating market:", error);
      toast({
        title: "Erro ao criar mercado",
        description: "Ocorreu um erro ao criar o mercado. Tente novamente.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Mercado criado!",
      description: "Seu mercado de previsão foi criado com sucesso.",
    });

    form.reset();
    setOpen(false);
    onMarketCreated?.();
  };

  if (!user) {
    return (
      <Button disabled variant="outline" className="gap-2">
        <Plus className="w-4 h-4" />
        Criar Mercado
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Criar Mercado
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Criar Novo Mercado</DialogTitle>
          <DialogDescription>
            Crie um mercado de previsão para que outros usuários possam
            participar.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título da Pergunta</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: O Brasil vai ganhar a Copa de 2026?"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Formule uma pergunta clara com resposta Sim ou Não.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Adicione detalhes sobre como o resultado será determinado..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de Encerramento</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="pointer-events-auto"
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Data limite para previsões neste mercado.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Criar Mercado
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMarketDialog;
