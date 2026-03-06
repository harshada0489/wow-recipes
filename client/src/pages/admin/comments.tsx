import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Comment, Recipe } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Check, MessageSquare, Trash2, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function AdminComments() {
  const { data: comments = [], isLoading } = useQuery<Comment[]>({ queryKey: ["/api/comments"] });
  const { data: recipes = [] } = useQuery<Recipe[]>({ queryKey: ["/api/recipes"] });
  const { toast } = useToast();
  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const approveMutation = useMutation({
    mutationFn: (id: string) => apiRequest("PATCH", `/api/comments/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments"] });
      toast({ title: "Comment approved" });
    },
  });

  const replyMutation = useMutation({
    mutationFn: ({ id, adminReply }: { id: string; adminReply: string }) =>
      apiRequest("PATCH", `/api/comments/${id}/reply`, { adminReply }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments"] });
      toast({ title: "Reply saved" });
      setReplyId(null); setReplyText("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/comments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments"] });
      toast({ title: "Comment deleted" });
    },
  });

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={`w-3.5 h-3.5 ${s <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
      ))}
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold" data-testid="text-comments-title">Comments</h1>
        <p className="text-muted-foreground">Review and manage community feedback</p>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center bg-card p-4 rounded-xl border shadow-sm">
          <h2 className="text-xl font-serif font-semibold">All Comments ({comments.length})</h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>
        ) : comments.length === 0 ? (
          <div className="bg-card rounded-xl border shadow-sm p-12 text-center text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No comments yet. Comments will appear here when users leave reviews on recipes.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => {
              const recipe = recipes.find(r => r.id === comment.recipeId);
              return (
                <div key={comment.id} className="bg-card rounded-xl border shadow-sm p-5 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">{comment.authorName}</span>
                        {renderStars(comment.rating)}
                        {!comment.isApproved && (
                          <Badge variant="outline" className="text-xs text-amber-600 border-amber-300 bg-amber-50">Pending</Badge>
                        )}
                        {comment.isApproved && (
                          <Badge variant="outline" className="text-xs text-green-600 border-green-300 bg-green-50">Approved</Badge>
                        )}
                      </div>
                      {recipe && (
                        <p className="text-xs text-muted-foreground">on "{recipe.title}" - {new Date(comment.createdAt).toLocaleDateString()}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {!comment.isApproved && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => approveMutation.mutate(comment.id)} data-testid={`btn-approve-comment-${comment.id}`}>
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => { setReplyId(comment.id); setReplyText(comment.adminReply || ""); }} data-testid={`btn-reply-comment-${comment.id}`}>
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteMutation.mutate(comment.id)} data-testid={`btn-delete-comment-${comment.id}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed">{comment.text}</p>
                  {comment.adminReply && (
                    <div className="ml-6 pl-4 border-l-2 border-primary/30 bg-primary/5 rounded-r-lg p-3">
                      <p className="text-xs font-semibold text-primary mb-1">Admin Reply</p>
                      <p className="text-sm">{comment.adminReply}</p>
                    </div>
                  )}
                  {replyId === comment.id && (
                    <div className="flex gap-2 pt-2">
                      <Textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your reply..."
                        className="resize-none text-sm"
                        rows={2}
                      />
                      <div className="flex flex-col gap-1">
                        <Button size="sm" onClick={() => replyMutation.mutate({ id: comment.id, adminReply: replyText })} disabled={replyMutation.isPending}>
                          Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setReplyId(null)}>Cancel</Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
