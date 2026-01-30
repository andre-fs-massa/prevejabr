import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Send, Trash2, Reply, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  parent_id: string | null;
  replies?: Comment[];
}

interface UserProfile {
  user_id: string;
  nickname: string | null;
}

interface MarketCommentsProps {
  marketId: string;
}

interface CommentItemProps {
  comment: Comment;
  user: { id: string } | null;
  profiles: Map<string, string | null>;
  onDelete: (id: string) => void;
  onReply: (parentId: string) => void;
  replyingTo: string | null;
  replyContent: string;
  setReplyContent: (content: string) => void;
  onSubmitReply: (parentId: string) => void;
  submitting: boolean;
  depth?: number;
}

const CommentItem = ({
  comment,
  user,
  profiles,
  onDelete,
  onReply,
  replyingTo,
  replyContent,
  setReplyContent,
  onSubmitReply,
  submitting,
  depth = 0,
}: CommentItemProps) => {
  const [showReplies, setShowReplies] = useState(true);
  const hasReplies = comment.replies && comment.replies.length > 0;
  const maxDepth = 3;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getUserDisplay = (userId: string) => {
    const nickname = profiles.get(userId);
    if (nickname) {
      return { name: `@${nickname}`, initials: nickname.slice(0, 2).toUpperCase() };
    }
    return { name: `Usuário ${userId.slice(0, 8)}`, initials: userId.slice(0, 2).toUpperCase() };
  };

  const userDisplay = getUserDisplay(comment.user_id);

  return (
    <div className={`${depth > 0 ? "ml-4 sm:ml-6 border-l-2 border-border pl-3 sm:pl-4" : ""}`}>
      <div className="bg-muted/30 rounded-lg p-3 sm:p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-medium text-primary">
                {userDisplay.initials}
              </span>
            </div>
            <span className="text-xs font-medium text-foreground">
              {userDisplay.name}
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">
              {formatDate(comment.created_at)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {user && depth < maxDepth && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-muted-foreground hover:text-primary"
                onClick={() => onReply(comment.id)}
              >
                <Reply className="w-4 h-4" />
              </Button>
            )}
            {user?.id === comment.user_id && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(comment.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        <p className="text-sm text-foreground whitespace-pre-wrap break-words">
          {comment.content}
        </p>
      </div>

      {/* Reply Form */}
      {replyingTo === comment.id && (
        <div className="mt-2 ml-4 sm:ml-6">
          <Textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Escreva sua resposta..."
            className="mb-2 min-h-[60px] resize-none text-sm"
            maxLength={1000}
          />
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReply("")}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              disabled={submitting || !replyContent.trim()}
              onClick={() => onSubmitReply(comment.id)}
            >
              <Send className="w-3 h-3 mr-1" />
              Responder
            </Button>
          </div>
        </div>
      )}

      {/* Replies */}
      {hasReplies && (
        <div className="mt-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-muted-foreground"
            onClick={() => setShowReplies(!showReplies)}
          >
            {showReplies ? (
              <>
                <ChevronUp className="w-3 h-3 mr-1" />
                Ocultar respostas ({comment.replies!.length})
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3 mr-1" />
                Ver respostas ({comment.replies!.length})
              </>
            )}
          </Button>
          {showReplies && (
            <div className="mt-2 space-y-2">
              {comment.replies!.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  user={user}
                  profiles={profiles}
                  onDelete={onDelete}
                  onReply={onReply}
                  replyingTo={replyingTo}
                  replyContent={replyContent}
                  setReplyContent={setReplyContent}
                  onSubmitReply={onSubmitReply}
                  submitting={submitting}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const MarketComments = ({ marketId }: MarketCommentsProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profiles, setProfiles] = useState<Map<string, string | null>>(new Map());

  const buildCommentTree = (flatComments: Comment[]): Comment[] => {
    const commentMap = new Map<string, Comment>();
    const rootComments: Comment[] = [];

    // First pass: create a map of all comments
    flatComments.forEach((comment) => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Second pass: build the tree
    flatComments.forEach((comment) => {
      const commentWithReplies = commentMap.get(comment.id)!;
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies!.push(commentWithReplies);
        }
      } else {
        rootComments.push(commentWithReplies);
      }
    });

    // Sort replies by date (oldest first for chronological order)
    const sortReplies = (comments: Comment[]) => {
      comments.forEach((comment) => {
        if (comment.replies && comment.replies.length > 0) {
          comment.replies.sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
          sortReplies(comment.replies);
        }
      });
    };

    sortReplies(rootComments);

    return rootComments;
  };

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("market_id", marketId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching comments:", error);
    } else {
      const tree = buildCommentTree(data || []);
      setComments(tree);

      // Fetch profiles for all comment authors
      const userIds = [...new Set((data || []).map((c) => c.user_id))];
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("user_id, nickname")
          .in("user_id", userIds);

        const profilesMap = new Map<string, string | null>();
        profilesData?.forEach((p: UserProfile) => {
          profilesMap.set(p.user_id, p.nickname);
        });
        setProfiles(profilesMap);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchComments();
  }, [marketId]);

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
      parent_id: null,
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

  const handleReply = (parentId: string) => {
    if (replyingTo === parentId) {
      setReplyingTo(null);
      setReplyContent("");
    } else {
      setReplyingTo(parentId);
      setReplyContent("");
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!user) {
      toast.error("Você precisa estar logado para responder");
      return;
    }

    const trimmedReply = replyContent.trim();
    if (!trimmedReply) {
      toast.error("Digite uma resposta");
      return;
    }

    if (trimmedReply.length > 1000) {
      toast.error("Resposta muito longa (máximo 1000 caracteres)");
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("comments").insert({
      market_id: marketId,
      user_id: user.id,
      content: trimmedReply,
      parent_id: parentId,
    });

    if (error) {
      console.error("Error creating reply:", error);
      toast.error("Erro ao enviar resposta");
    } else {
      setReplyContent("");
      setReplyingTo(null);
      toast.success("Resposta enviada!");
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

  const countAllComments = (comments: Comment[]): number => {
    return comments.reduce((count, comment) => {
      return count + 1 + (comment.replies ? countAllComments(comment.replies) : 0);
    }, 0);
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
          Comentários ({countAllComments(comments)})
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
            <CommentItem
              key={comment.id}
              comment={comment}
              user={user}
              profiles={profiles}
              onDelete={handleDelete}
              onReply={handleReply}
              replyingTo={replyingTo}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              onSubmitReply={handleSubmitReply}
              submitting={submitting}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketComments;
