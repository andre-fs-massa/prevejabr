import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Pencil, Check, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const nicknameSchema = z
  .string()
  .min(3, "O nickname deve ter pelo menos 3 caracteres")
  .max(20, "O nickname deve ter no máximo 20 caracteres")
  .regex(/^[a-zA-Z0-9_]+$/, "Apenas letras, números e underscore são permitidos");

const NicknameEditor = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [nickname, setNickname] = useState<string | null>(null);
  const [editedNickname, setEditedNickname] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("nickname")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setNickname(data.nickname);
      setEditedNickname(data.nickname || "");
    } else if (!error) {
      // Profile doesn't exist, create it
      await supabase.from("profiles").insert({ user_id: user.id });
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    const validation = nicknameSchema.safeParse(editedNickname);
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    setError(null);
    setIsSaving(true);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ nickname: editedNickname })
      .eq("user_id", user!.id);

    if (updateError) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o nickname.",
        variant: "destructive",
      });
    } else {
      setNickname(editedNickname);
      setIsEditing(false);
      toast({
        title: "Nickname salvo!",
        description: "Seu nickname foi atualizado com sucesso.",
      });
    }

    setIsSaving(false);
  };

  const handleCancel = () => {
    setEditedNickname(nickname || "");
    setError(null);
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <User className="h-4 w-4 sm:h-5 sm:w-5" />
          Nickname
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        {isEditing ? (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="nickname">Seu nickname</Label>
              <Input
                id="nickname"
                value={editedNickname}
                onChange={(e) => setEditedNickname(e.target.value)}
                placeholder="Digite seu nickname"
                maxLength={20}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <p className="text-xs text-muted-foreground">
                3-20 caracteres. Apenas letras, números e underscore.
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={isSaving} size="sm">
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Salvar
                  </>
                )}
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm" disabled={isSaving}>
                <X className="h-4 w-4 mr-1" />
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              {nickname ? (
                <p className="font-medium text-foreground">@{nickname}</p>
              ) : (
                <p className="text-muted-foreground italic">Nenhum nickname definido</p>
              )}
            </div>
            <Button onClick={() => setIsEditing(true)} variant="ghost" size="sm">
              <Pencil className="h-4 w-4 mr-1" />
              Editar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NicknameEditor;
