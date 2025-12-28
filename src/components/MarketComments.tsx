import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
}

interface MarketCommentsProps {
  marketId: string;
}

const MarketComments = ({ marketId }: MarketCommentsProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("market_id", marketId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching comments:", error);
    } else {
      setComments(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchComments();
  }, [marketId]);

  // Realtime subscription for comments
  useEffect(() => {
    const channel = supabase
      .channel(`comments-${marketId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `market_id=eq.${marketId}`,
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [marketId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Você precisa estar logado para comentar");
      return;
    }

    const trimmedComment = newComment.trim();
    if (!trimmedComment) {
      toast.error("Digite um comentário");
      return;
    }

    if (trimmedComment.length > 1000) {
      toast.error("Comentário muito longo (máximo 1000 caracteres)");
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("comments").insert({
      market_id: marketId,
      user_id: user.id,
      content: trimmedComment,
    });

    if (error) {
      console.error("Error creating comment:", error);
      toast.error("Erro ao enviar comentário");
    } else {
      setNewComment("");
      toast.success("Comentário enviado!");
    }

    setSubmitting(false);
  };

  const handleDelete = async (commentId: string) => {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      console.error("Error deleting comment:", error);
      toast.error("Erro ao excluir comentário");
    } else {
      toast.success("Comentário excluído");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatUserId = (userId: string) => {
    return userId.slice(0, 8);
  };

  if (loading) {
    return (
      <div className="bg-card rounded-xl sm:rounded-2xl border border-border p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h2 className="text-base sm:text-lg font-semibold text-foreground">
            Comentários
          </h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl sm:rounded-2xl border border-border p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h2 className="text-base sm:text-lg font-semibold text-foreground">
          Comentários ({comments.length})
        </h2>
      </div>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escreva seu comentário..."
            className="mb-3 min-h-[80px] resize-none"
            maxLength={1000}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {newComment.length}/1000
            </span>
            <Button
              type="submit"
              size="sm"
              disabled={submitting || !newComment.trim()}
            >
              <Send className="w-4 h-4 mr-2" />
              {submitting ? "Enviando..." : "Enviar"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="bg-muted/50 rounded-lg p-4 mb-6 text-center">
          <p className="text-sm text-muted-foreground">
            Faça login para comentar
          </p>
        </div>
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          Nenhum comentário ainda. Seja o primeiro a comentar!
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-muted/30 rounded-lg p-3 sm:p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-xs font-medium text-primary">
                      {formatUserId(comment.user_id).slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Usuário {formatUserId(comment.user_id)}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(comment.created_at)}
                  </span>
                </div>
                {user?.id === comment.user_id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(comment.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketComments;
