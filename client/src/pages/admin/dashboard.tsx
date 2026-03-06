import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Category, Recipe, AffiliateLink } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Image as ImageIcon, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const { data: recipes = [], isLoading: recipesLoading } = useQuery<Recipe[]>({ queryKey: ["/api/recipes"] });
  const { data: categories = [] } = useQuery<Category[]>({ queryKey: ["/api/categories"] });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold" data-testid="text-dashboard-title">Recipes</h1>
        <p className="text-muted-foreground">Manage your recipe collection</p>
      </div>
      <RecipesContent recipes={recipes} categories={categories} loading={recipesLoading} />
    </div>
  );
}

function RecipesContent({ recipes, categories, loading }: { recipes: Recipe[]; categories: Category[]; loading: boolean }) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [servings, setServings] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showAds, setShowAds] = useState(true);
  const [affiliateLinks, setAffiliateLinks] = useState<{ title: string; url: string; imageUrl: string }[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: existingLinks = [] } = useQuery<AffiliateLink[]>({
    queryKey: [`/api/affiliate-links/recipe/${editId}`],
    enabled: !!editId,
  });

  const resetForm = () => {
    setEditId(null); setTitle(""); setDescription(""); setCategoryId(""); setPrepTime(""); setCookTime("");
    setServings(""); setIngredients(""); setInstructions(""); setImageUrl(""); setShowAds(true);
    setAffiliateLinks([]);
  };

  const openEdit = (r: Recipe) => {
    setEditId(r.id); setTitle(r.title); setDescription(r.description); setCategoryId(r.categoryId);
    setPrepTime(r.prepTime || ""); setCookTime(r.cookTime || ""); setServings(r.servings?.toString() || "");
    setIngredients(r.ingredients.join("\n")); setInstructions(r.instructions.join("\n")); setImageUrl(r.imageUrl || "");
    setShowAds(r.showAds);
    setIsOpen(true);
  };

  const prevEditId = useRef<string | null>(null);
  if (editId && editId !== prevEditId.current && existingLinks.length > 0) {
    prevEditId.current = editId;
    setAffiliateLinks(existingLinks.map(l => ({ title: l.title, url: l.url, imageUrl: l.imageUrl || "" })));
  }
  if (!editId && prevEditId.current !== null) {
    prevEditId.current = null;
  }

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData, credentials: "include" });
      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    },
    onSuccess: (data) => setImageUrl(data.url),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body = {
        title, description, categoryId,
        prepTime: prepTime || null, cookTime: cookTime || null,
        servings: servings ? parseInt(servings) : null,
        ingredients: ingredients.split("\n").filter(Boolean),
        instructions: instructions.split("\n").filter(Boolean),
        imageUrl: imageUrl || null,
        showAds,
      };
      let recipeId = editId;
      if (editId) {
        await apiRequest("PATCH", `/api/recipes/${editId}`, body);
      } else {
        const res = await apiRequest("POST", "/api/recipes", body);
        const created = await res.json();
        recipeId = created.id;
      }
      if (recipeId) {
        const existRes = await fetch(`/api/affiliate-links/recipe/${recipeId}`, { credentials: "include" });
        const existing: AffiliateLink[] = await existRes.json();
        for (const e of existing) {
          await apiRequest("DELETE", `/api/affiliate-links/${e.id}`);
        }
        for (const link of affiliateLinks) {
          if (link.title && link.url) {
            await apiRequest("POST", "/api/affiliate-links", {
              title: link.title,
              url: link.url,
              imageUrl: link.imageUrl || null,
              recipeId,
            });
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey[0];
          return typeof key === "string" && key.startsWith("/api/affiliate-links");
        },
      });
      toast({ title: editId ? "Recipe updated" : "Recipe created" });
      setIsOpen(false); resetForm();
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/recipes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
      toast({ title: "Recipe deleted" });
    },
  });

  const addAffiliateLink = () => setAffiliateLinks([...affiliateLinks, { title: "", url: "", imageUrl: "" }]);
  const removeAffiliateLink = (idx: number) => setAffiliateLinks(affiliateLinks.filter((_, i) => i !== idx));
  const updateAffLink = (idx: number, field: string, value: string) => {
    const updated = [...affiliateLinks];
    (updated[idx] as any)[field] = value;
    setAffiliateLinks(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-4 rounded-xl border shadow-sm">
        <h2 className="text-xl font-serif font-semibold">All Recipes ({recipes.length})</h2>
        <Dialog open={isOpen} onOpenChange={(v) => { setIsOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="btn-add-recipe"><Plus className="w-4 h-4" /> Add Recipe</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editId ? "Edit Recipe" : "Add New Recipe"}</DialogTitle>
              <DialogDescription>Fill in the details below.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Recipe Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="E.g., Classic Lasagna" data-testid="input-recipe-title" />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                    <SelectContent>
                      {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A short, catchy description..." className="resize-none" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Prep Time</Label>
                  <Input value={prepTime} onChange={(e) => setPrepTime(e.target.value)} placeholder="e.g. 15 mins" />
                </div>
                <div className="space-y-2">
                  <Label>Cook Time</Label>
                  <Input value={cookTime} onChange={(e) => setCookTime(e.target.value)} placeholder="e.g. 45 mins" />
                </div>
                <div className="space-y-2">
                  <Label>Servings</Label>
                  <Input value={servings} onChange={(e) => setServings(e.target.value)} type="number" placeholder="e.g. 4" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Recipe Image</Label>
                {imageUrl ? (
                  <div className="relative rounded-xl overflow-hidden border">
                    <img src={imageUrl} alt="Preview" className="w-full h-48 object-cover" />
                    <Button variant="destructive" size="sm" className="absolute top-2 right-2" onClick={() => setImageUrl("")}>Remove</Button>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => fileRef.current?.click()}
                  >
                    {uploadMutation.isPending ? (
                      <Loader2 className="w-10 h-10 text-muted-foreground mb-4 animate-spin" />
                    ) : (
                      <ImageIcon className="w-10 h-10 text-muted-foreground mb-4" />
                    )}
                    <p className="text-sm font-medium">Click to upload an image</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadMutation.mutate(file);
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Ingredients (One per line)</Label>
                  <Textarea rows={6} value={ingredients} onChange={(e) => setIngredients(e.target.value)} placeholder={"1 cup flour\n2 eggs..."} />
                </div>
                <div className="space-y-2">
                  <Label>Instructions (One step per line)</Label>
                  <Textarea rows={6} value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder={"Preheat oven to 350F...\nMix dry ingredients..."} />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border">
                <div>
                  <Label className="text-base font-medium">Show Sponsored Ads</Label>
                  <p className="text-sm text-muted-foreground">Display ads on this recipe page</p>
                </div>
                <Switch checked={showAds} onCheckedChange={setShowAds} data-testid="switch-show-ads" />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Affiliate Links</Label>
                  <Button type="button" variant="outline" size="sm" className="gap-1" onClick={addAffiliateLink} data-testid="btn-add-affiliate">
                    <Plus className="w-3 h-3" /> Add Link
                  </Button>
                </div>
                {affiliateLinks.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-lg">No affiliate links yet. Click "Add Link" to add product recommendations.</p>
                )}
                {affiliateLinks.map((link, idx) => (
                  <div key={idx} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end p-3 bg-muted/30 rounded-lg border">
                    <div className="space-y-1">
                      <Label className="text-xs">Title</Label>
                      <Input value={link.title} onChange={(e) => updateAffLink(idx, "title", e.target.value)} placeholder="Product name" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">URL</Label>
                      <Input value={link.url} onChange={(e) => updateAffLink(idx, "url", e.target.value)} placeholder="https://..." />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Image URL</Label>
                      <Input value={link.imageUrl} onChange={(e) => updateAffLink(idx, "imageUrl", e.target.value)} placeholder="https://... (optional)" />
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => removeAffiliateLink(idx)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} data-testid="btn-save-recipe">
                {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {editId ? "Update Recipe" : "Save Recipe"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Ads</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></TableCell></TableRow>
            ) : recipes.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No recipes yet</TableCell></TableRow>
            ) : recipes.map((recipe) => (
              <TableRow key={recipe.id}>
                <TableCell>
                  {recipe.imageUrl ? (
                    <img src={recipe.imageUrl} alt={recipe.title} className="w-12 h-12 rounded-md object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">N/A</div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{recipe.title}</TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {categories.find(c => c.id === recipe.categoryId)?.name || "—"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {recipe.prepTime || "?"} + {recipe.cookTime || "?"}
                </TableCell>
                <TableCell>
                  <Badge variant={recipe.showAds ? "default" : "outline"} className="text-xs">
                    {recipe.showAds ? "On" : "Off"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => openEdit(recipe)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteMutation.mutate(recipe.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
