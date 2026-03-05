import { useState, useEffect, useRef } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Recipe, Category, AffiliateLink, Comment, AdPlacement } from "@/lib/mock-data";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Clock, Users, ChefHat, CheckCircle2, Loader2, Star, ExternalLink, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  
  const { data: recipe, isLoading } = useQuery<Recipe>({
    queryKey: [`/api/recipes/${id}`],
    enabled: !!id,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: affiliateLinks = [] } = useQuery<AffiliateLink[]>({
    queryKey: [`/api/affiliate-links/recipe/${id}`],
    enabled: !!id,
  });

  const { data: comments = [] } = useQuery<Comment[]>({
    queryKey: [`/api/comments/recipe/${id}`],
    enabled: !!id,
  });

  const { data: activeAds = [] } = useQuery<AdPlacement[]>({
    queryKey: ["/api/ad-placements/active"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xl text-muted-foreground">Recipe not found.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const category = categories.find((c) => c.id === recipe.categoryId);
  const sidebarAds = recipe.showAds ? activeAds.filter(a => a.location === "sidebar") : [];
  const belowRecipeAds = recipe.showAds ? activeAds.filter(a => a.location === "below-recipe") : [];
  const aboveCommentsAds = recipe.showAds ? activeAds.filter(a => a.location === "above-comments") : [];
  const approvedComments = comments;

  const avgRating = approvedComments.length > 0
    ? approvedComments.reduce((sum, c) => sum + c.rating, 0) / approvedComments.length
    : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-5xl">
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-4">
          {category && (
            <Badge variant="secondary" className="px-4 py-1 mb-2">
              {category.name}
            </Badge>
          )}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight" data-testid="text-recipe-title">
            {recipe.title}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {recipe.description}
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-sm font-medium text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>Prep: {recipe.prepTime || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-primary" />
              <span>Cook: {recipe.cookTime || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span>Serves: {recipe.servings || "?"}</span>
            </div>
            {approvedComments.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className={`w-4 h-4 ${s <= Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                  ))}
                </div>
                <span>{avgRating.toFixed(1)} ({approvedComments.length} reviews)</span>
              </div>
            )}
          </div>
        </div>

        {recipe.imageUrl && (
          <div className="relative aspect-[21/9] md:aspect-[2/1] overflow-hidden rounded-3xl mb-16 shadow-lg">
            <img 
              src={recipe.imageUrl} 
              alt={recipe.title}
              className="object-cover w-full h-full"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 lg:gap-20 items-start">
          <div className="space-y-6">
            <div className="bg-card rounded-2xl p-6 md:p-8 border shadow-sm lg:sticky lg:top-24">
              <h2 className="text-2xl font-serif font-bold mb-6 flex items-center gap-2">
                Ingredients
              </h2>
              <ul className="space-y-4">
                {recipe.ingredients.map((ingredient, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Checkbox id={`ingredient-${idx}`} className="mt-1" data-testid={`checkbox-ingredient-${idx}`} />
                    <label 
                      htmlFor={`ingredient-${idx}`}
                      className="text-base leading-snug cursor-pointer"
                    >
                      {ingredient}
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            {sidebarAds.map(ad => (
              <AdSlot key={ad.id} ad={ad} />
            ))}
          </div>

          <div className="space-y-8">
            <h2 className="text-3xl font-serif font-bold mb-8">Instructions</h2>
            
            <div className="space-y-10">
              {recipe.instructions.map((step, idx) => (
                <div key={idx} className="relative pl-12 md:pl-16">
                  <div className="absolute left-0 top-0 flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 text-primary font-serif font-bold text-lg">
                    {idx + 1}
                  </div>
                  <h3 className="text-lg font-medium mb-2">Step {idx + 1}</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {step}
                  </p>
                  {idx < recipe.instructions.length - 1 && (
                    <Separator className="mt-10" />
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-12 bg-accent/50 rounded-2xl p-8 text-center">
              <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-serif text-2xl font-bold mb-2">Enjoy your meal!</h3>
              <p className="text-muted-foreground">Don't forget to leave a review and share your photos.</p>
            </div>
          </div>
        </div>

        {affiliateLinks.length > 0 && (
          <section className="mt-16">
            <h2 className="text-3xl font-serif font-bold mb-8 text-center">Recommended Equipment & Ingredients</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {affiliateLinks.map(link => (
                <div key={link.id} className="bg-card rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow" data-testid={`card-affiliate-${link.id}`}>
                  {link.imageUrl && (
                    <div className="aspect-square bg-muted overflow-hidden">
                      <img src={link.imageUrl} alt={link.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-5 space-y-3">
                    <h3 className="font-semibold text-lg">{link.title}</h3>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
                      data-testid={`link-buy-${link.id}`}
                    >
                      Buy Now <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {belowRecipeAds.map(ad => (
          <div key={ad.id} className="mt-12">
            <AdSlot ad={ad} />
          </div>
        ))}

        {aboveCommentsAds.map(ad => (
          <div key={ad.id} className="mt-12">
            <AdSlot ad={ad} />
          </div>
        ))}

        <section className="mt-16" id="comments">
          <h2 className="text-3xl font-serif font-bold mb-8">Reviews & Comments</h2>
          
          <CommentForm recipeId={recipe.id} />

          {approvedComments.length > 0 && (
            <div className="mt-10 space-y-6">
              <h3 className="text-xl font-serif font-semibold">{approvedComments.length} Review{approvedComments.length !== 1 ? "s" : ""}</h3>
              {approvedComments.map(comment => (
                <div key={comment.id} className="bg-card rounded-2xl border shadow-sm p-6 space-y-3" data-testid={`card-comment-${comment.id}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {comment.authorName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold">{comment.authorName}</p>
                        <p className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className={`w-4 h-4 ${s <= comment.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed">{comment.text}</p>
                  {comment.adminReply && (
                    <div className="ml-6 pl-4 border-l-2 border-primary/30 bg-primary/5 rounded-r-lg p-4 mt-3">
                      <p className="text-xs font-semibold text-primary mb-1">Author's Response</p>
                      <p className="text-sm">{comment.adminReply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      
      <Footer />
    </div>
  );
}

function CommentForm({ recipeId }: { recipeId: string }) {
  const { toast } = useToast();
  const [authorName, setAuthorName] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);

  const submitMutation = useMutation({
    mutationFn: () =>
      apiRequest("POST", "/api/comments", { authorName, text, rating, recipeId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/comments/recipe/${recipeId}`] });
      toast({ title: "Review submitted!", description: "Your review will appear after it's been approved." });
      setAuthorName(""); setText(""); setRating(0);
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  return (
    <div className="bg-card rounded-2xl border shadow-sm p-6 md:p-8">
      <h3 className="text-xl font-serif font-semibold mb-6">Leave a Review</h3>
      <div className="space-y-5">
        <div className="space-y-2">
          <Label>Your Rating</Label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(s => (
              <button
                key={s}
                type="button"
                className="p-1 hover:scale-110 transition-transform"
                onMouseEnter={() => setHoveredStar(s)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => setRating(s)}
                data-testid={`btn-star-${s}`}
              >
                <Star className={`w-7 h-7 ${s <= (hoveredStar || rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Your Name</Label>
            <Input value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="John Doe" data-testid="input-comment-name" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Your Review</Label>
          <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Tell us what you think about this recipe..." className="resize-none" rows={4} data-testid="input-comment-text" />
        </div>
        <Button
          onClick={() => submitMutation.mutate()}
          disabled={submitMutation.isPending || !authorName || !text || rating === 0}
          className="gap-2"
          data-testid="btn-submit-comment"
        >
          {submitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Submit Review
        </Button>
      </div>
    </div>
  );
}

function AdSlot({ ad }: { ad: AdPlacement }) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (adRef.current && ad.scriptCode) {
      adRef.current.innerHTML = "";
      const container = document.createElement("div");
      container.innerHTML = ad.scriptCode;
      const scripts = container.querySelectorAll("script");
      scripts.forEach(script => {
        const newScript = document.createElement("script");
        if (script.src) {
          newScript.src = script.src;
        } else {
          newScript.textContent = script.textContent;
        }
        Array.from(script.attributes).forEach(attr => {
          if (attr.name !== "src") newScript.setAttribute(attr.name, attr.value);
        });
        adRef.current?.appendChild(newScript);
      });
      const nonScripts = Array.from(container.childNodes).filter(n => (n as HTMLElement).tagName !== "SCRIPT");
      nonScripts.forEach(n => adRef.current?.appendChild(n.cloneNode(true)));
    }
  }, [ad.scriptCode]);

  return (
    <div className="rounded-xl border bg-muted/30 p-4 text-center" data-testid={`ad-slot-${ad.id}`}>
      <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest mb-2">Sponsored</p>
      <div ref={adRef} />
    </div>
  );
}
