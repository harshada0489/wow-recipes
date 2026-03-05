import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Category, Recipe, LegalPage } from "@/lib/mock-data";
import Header from "@/components/layout/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Image as ImageIcon, Loader2, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const { toast } = useToast();

  const { data: recipes = [], isLoading: recipesLoading } = useQuery<Recipe[]>({ queryKey: ["/api/recipes"] });
  const { data: categories = [], isLoading: catsLoading } = useQuery<Category[]>({ queryKey: ["/api/categories"] });
  const { data: pages = [], isLoading: pagesLoading } = useQuery<LegalPage[]>({ queryKey: ["/api/pages"] });

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
            <p className="text-muted-foreground">Manage your recipes, categories, and pages</p>
          </div>
          <Button variant="outline" className="gap-2" onClick={() => logoutMutation.mutate()} data-testid="btn-logout">
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>

        <Tabs defaultValue="recipes" className="w-full">
          <TabsList className="mb-8 w-full md:w-auto h-auto p-1 bg-card border shadow-sm rounded-lg">
            <TabsTrigger value="recipes" className="px-6 py-2.5 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium">
              Recipes
            </TabsTrigger>
            <TabsTrigger value="categories" className="px-6 py-2.5 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium">
              Categories
            </TabsTrigger>
            <TabsTrigger value="pages" className="px-6 py-2.5 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium">
              Pages
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
  const fileRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setEditId(null); setTitle(""); setDescription(""); setCategoryId(""); setPrepTime(""); setCookTime("");
    setServings(""); setIngredients(""); setInstructions(""); setImageUrl("");
  };

  const openEdit = (r: Recipe) => {
    setEditId(r.id); setTitle(r.title); setDescription(r.description); setCategoryId(r.categoryId);
    setPrepTime(r.prepTime || ""); setCookTime(r.cookTime || ""); setServings(r.servings?.toString() || "");
    setIngredients(r.ingredients.join("\n")); setInstructions(r.instructions.join("\n")); setImageUrl(r.imageUrl || "");
    setIsOpen(true);
  };

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
      };
      if (editId) {
        await apiRequest("PATCH", `/api/recipes/${editId}`, body);
      } else {
        await apiRequest("POST", "/api/recipes", body);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
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
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></TableCell></TableRow>
            ) : recipes.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No recipes yet</TableCell></TableRow>
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
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                    {categories.find(c => c.id === recipe.categoryId)?.name || "—"}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {recipe.prepTime || "?"} + {recipe.cookTime || "?"}
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
                <TableCell className="font-mono text-sm text-muted-foreground">/{page.slug}</TableCell>
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
