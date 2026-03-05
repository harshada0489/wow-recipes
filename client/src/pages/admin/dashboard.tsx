import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Category, Recipe, LegalPage, AffiliateLink, Comment, AdPlacement } from "@/lib/mock-data";
import Header from "@/components/layout/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Image as ImageIcon, Loader2, LogOut, Check, MessageSquare, X, Star, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const { toast } = useToast();

  const { data: recipes = [], isLoading: recipesLoading } = useQuery<Recipe[]>({ queryKey: ["/api/recipes"] });
  const { data: categories = [], isLoading: catsLoading } = useQuery<Category[]>({ queryKey: ["/api/categories"] });
  const { data: pages = [], isLoading: pagesLoading } = useQuery<LegalPage[]>({ queryKey: ["/api/pages"] });
  const { data: allComments = [], isLoading: commentsLoading } = useQuery<Comment[]>({ queryKey: ["/api/comments"] });
  const { data: adPlacements = [], isLoading: adsLoading } = useQuery<AdPlacement[]>({ queryKey: ["/api/ad-placements"] });

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/auth/logout"),
    onSuccess: onLogout,
  });

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your recipes, categories, pages, comments & ads</p>
          </div>
          <Button variant="outline" className="gap-2" onClick={() => logoutMutation.mutate()} data-testid="btn-logout">
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>

        <Tabs defaultValue="recipes" className="w-full">
          <TabsList className="mb-8 w-full md:w-auto h-auto p-1 bg-card border shadow-sm rounded-lg flex-wrap">
            <TabsTrigger value="recipes" className="px-4 py-2.5 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium">
              Recipes
            </TabsTrigger>
            <TabsTrigger value="categories" className="px-4 py-2.5 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium">
              Categories
            </TabsTrigger>
            <TabsTrigger value="pages" className="px-4 py-2.5 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium">
              Pages
            </TabsTrigger>
            <TabsTrigger value="comments" className="px-4 py-2.5 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium">
              Comments
            </TabsTrigger>
            <TabsTrigger value="ads" className="px-4 py-2.5 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium">
              Ads
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recipes">
            <RecipesTab recipes={recipes} categories={categories} loading={recipesLoading} />
          </TabsContent>
          <TabsContent value="categories">
            <CategoriesTab categories={categories} loading={catsLoading} />
          </TabsContent>
          <TabsContent value="pages">
            <PagesTab pages={pages} loading={pagesLoading} />
          </TabsContent>
          <TabsContent value="comments">
            <CommentsTab comments={allComments} recipes={recipes} loading={commentsLoading} />
          </TabsContent>
          <TabsContent value="ads">
            <AdsTab adPlacements={adPlacements} loading={adsLoading} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function RecipesTab({ recipes, categories, loading }: { recipes: Recipe[]; categories: Category[]; loading: boolean }) {
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
      queryClient.invalidateQueries({ queryKey: ["/api/affiliate-links"] });
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

function CategoriesTab({ categories, loading }: { categories: Category[]; loading: boolean }) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  const resetForm = () => { setEditId(null); setName(""); setSlug(""); setDescription(""); };

  const openEdit = (c: Category) => {
    setEditId(c.id); setName(c.name); setSlug(c.slug); setDescription(c.description || ""); setIsOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body = { name, slug, description: description || null };
      if (editId) {
        await apiRequest("PATCH", `/api/categories/${editId}`, body);
      } else {
        await apiRequest("POST", "/api/categories", body);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: editId ? "Category updated" : "Category created" });
      setIsOpen(false); resetForm();
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Category deleted" });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-4 rounded-xl border shadow-sm">
        <h2 className="text-xl font-serif font-semibold">Categories ({categories.length})</h2>
        <Dialog open={isOpen} onOpenChange={(v) => { setIsOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="btn-add-category"><Plus className="w-4 h-4" /> Add Category</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editId ? "Edit Category" : "Add Category"}</DialogTitle>
              <DialogDescription>Manage your recipe categories.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={name} onChange={(e) => { setName(e.target.value); if (!editId) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")); }} placeholder="E.g., Vegan" data-testid="input-cat-name" />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="vegan" data-testid="input-cat-slug" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description..." className="resize-none" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} data-testid="btn-save-category">
                {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {editId ? "Update Category" : "Save Category"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></TableCell></TableRow>
            ) : categories.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No categories yet</TableCell></TableRow>
            ) : categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">{category.slug}</TableCell>
                <TableCell className="text-sm text-muted-foreground truncate max-w-[200px]">{category.description}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => openEdit(category)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteMutation.mutate(category.id)}>
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

function PagesTab({ pages, loading }: { pages: LegalPage[]; loading: boolean }) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");

  const resetForm = () => { setEditId(null); setTitle(""); setSlug(""); setContent(""); };

  const openEdit = (p: LegalPage) => {
    setEditId(p.id); setTitle(p.title); setSlug(p.slug); setContent(p.content); setIsOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body = { title, slug, content };
      if (editId) {
        await apiRequest("PATCH", `/api/pages/${editId}`, body);
      } else {
        await apiRequest("POST", "/api/pages", body);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pages"] });
      toast({ title: editId ? "Page updated" : "Page created" });
      setIsOpen(false); resetForm();
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/pages/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pages"] });
      toast({ title: "Page deleted" });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-4 rounded-xl border shadow-sm">
        <h2 className="text-xl font-serif font-semibold">Pages ({pages.length})</h2>
        <Dialog open={isOpen} onOpenChange={(v) => { setIsOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="btn-add-page"><Plus className="w-4 h-4" /> Add Page</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editId ? "Edit Page" : "Add Page"}</DialogTitle>
              <DialogDescription>Create or edit informational pages.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Page Title</Label>
                  <Input value={title} onChange={(e) => { setTitle(e.target.value); if (!editId) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")); }} placeholder="E.g., Privacy Policy" data-testid="input-page-title" />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="privacy-policy" data-testid="input-page-slug" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Enter the page content here..." className="resize-none min-h-[200px]" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} data-testid="btn-save-page">
                {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {editId ? "Update Page" : "Save Page"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></TableCell></TableRow>
            ) : pages.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No pages yet</TableCell></TableRow>
            ) : pages.map((page) => (
              <TableRow key={page.id}>
                <TableCell className="font-medium">{page.title}</TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">{page.slug}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{new Date(page.updatedAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => openEdit(page)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteMutation.mutate(page.id)}>
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

function CommentsTab({ comments, recipes, loading }: { comments: Comment[]; recipes: Recipe[]; loading: boolean }) {
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
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-4 rounded-xl border shadow-sm">
        <h2 className="text-xl font-serif font-semibold">All Comments ({comments.length})</h2>
      </div>

      {loading ? (
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
  );
}

function AdsTab({ adPlacements, loading }: { adPlacements: AdPlacement[]; loading: boolean }) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [scriptCode, setScriptCode] = useState("");
  const [location, setLocation] = useState("sidebar");
  const [isActive, setIsActive] = useState(true);

  const resetForm = () => { setEditId(null); setTitle(""); setScriptCode(""); setLocation("sidebar"); setIsActive(true); };

  const openEdit = (ad: AdPlacement) => {
    setEditId(ad.id); setTitle(ad.title); setScriptCode(ad.scriptCode); setLocation(ad.location); setIsActive(ad.isActive); setIsOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body = { title, scriptCode, location, isActive };
      if (editId) {
        await apiRequest("PATCH", `/api/ad-placements/${editId}`, body);
      } else {
        await apiRequest("POST", "/api/ad-placements", body);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ad-placements"] });
      toast({ title: editId ? "Ad placement updated" : "Ad placement created" });
      setIsOpen(false); resetForm();
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiRequest("PATCH", `/api/ad-placements/${id}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ad-placements"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/ad-placements/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ad-placements"] });
      toast({ title: "Ad placement deleted" });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-4 rounded-xl border shadow-sm">
        <h2 className="text-xl font-serif font-semibold">Ad Placements ({adPlacements.length})</h2>
        <Dialog open={isOpen} onOpenChange={(v) => { setIsOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="btn-add-ad"><Plus className="w-4 h-4" /> Add Ad Placement</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editId ? "Edit Ad Placement" : "Add Ad Placement"}</DialogTitle>
              <DialogDescription>Paste your ad network script code (e.g., Google AdSense, Mediavine).</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="E.g., Sidebar Ad" data-testid="input-ad-title" />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sidebar">Sidebar</SelectItem>
                      <SelectItem value="below-recipe">Below Recipe</SelectItem>
                      <SelectItem value="above-comments">Above Comments</SelectItem>
                      <SelectItem value="header-banner">Header Banner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Script Code</Label>
                <Textarea value={scriptCode} onChange={(e) => setScriptCode(e.target.value)} placeholder="Paste your ad script here..." className="resize-none min-h-[150px] font-mono text-sm" />
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border">
                <div>
                  <Label className="text-base font-medium">Active</Label>
                  <p className="text-sm text-muted-foreground">Enable or disable this ad placement</p>
                </div>
                <Switch checked={isActive} onCheckedChange={setIsActive} data-testid="switch-ad-active" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} data-testid="btn-save-ad">
                {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {editId ? "Update Ad" : "Save Ad"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></TableCell></TableRow>
            ) : adPlacements.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No ad placements yet</TableCell></TableRow>
            ) : adPlacements.map((ad) => (
              <TableRow key={ad.id}>
                <TableCell className="font-medium">{ad.title}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">{ad.location.replace("-", " ")}</Badge>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={ad.isActive}
                    onCheckedChange={(checked) => toggleMutation.mutate({ id: ad.id, isActive: checked })}
                    data-testid={`switch-ad-toggle-${ad.id}`}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => openEdit(ad)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteMutation.mutate(ad.id)}>
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
