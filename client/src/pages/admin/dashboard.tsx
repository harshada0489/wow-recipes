import { useState } from "react";
import Header from "@/components/layout/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MOCK_CATEGORIES, MOCK_RECIPES } from "@/lib/mock-data";
import { Plus, Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [recipes, setRecipes] = useState(MOCK_RECIPES);
  const [categories, setCategories] = useState(MOCK_CATEGORIES);

  const handleDeleteRecipe = (id: string) => {
    setRecipes(recipes.filter(r => r.id !== id));
    toast({
      title: "Recipe deleted",
      description: "The recipe has been removed from the list.",
    });
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
    toast({
      title: "Category deleted",
      description: "The category has been removed.",
    });
  };

  const handleEditClick = () => {
    toast({
      title: "Edit Mode",
      description: "In the full version, this will open the form with the item's data loaded.",
    });
  };
  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your recipes and categories</p>
          </div>
        </div>

        <Tabs defaultValue="recipes" className="w-full">
          <TabsList className="mb-8 w-full md:w-auto h-auto p-1 bg-card border shadow-sm rounded-lg">
            <TabsTrigger value="recipes" className="px-6 py-2.5 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium">
              Manage Recipes
            </TabsTrigger>
            <TabsTrigger value="categories" className="px-6 py-2.5 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium">
              Manage Categories
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recipes" className="space-y-6">
            <div className="flex justify-between items-center bg-card p-4 rounded-xl border shadow-sm">
              <h2 className="text-xl font-serif font-semibold">All Recipes ({recipes.length})</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="gap-2" data-testid="btn-add-recipe">
                    <Plus className="w-4 h-4" /> Add Recipe
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Recipe</DialogTitle>
                    <DialogDescription>Fill in the details to create a new recipe.</DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Recipe Title</Label>
                        <Input id="title" placeholder="E.g., Classic Lasagna" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {MOCK_CATEGORIES.map(c => (
                              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="desc">Description</Label>
                      <Textarea id="desc" placeholder="A short, catchy description..." className="resize-none" />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="prep">Prep Time</Label>
                        <Input id="prep" placeholder="e.g. 15 mins" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cook">Cook Time</Label>
                        <Input id="cook" placeholder="e.g. 45 mins" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="servings">Servings</Label>
                        <Input id="servings" type="number" placeholder="e.g. 4" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Recipe Image</Label>
                      <div className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer">
                        <ImageIcon className="w-10 h-10 text-muted-foreground mb-4" />
                        <p className="text-sm font-medium">Click to upload an image</p>
                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                        <Input type="file" className="hidden" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Ingredients (One per line)</Label>
                        <Textarea rows={6} placeholder="1 cup flour&#10;2 eggs..." />
                      </div>
                      <div className="space-y-2">
                        <Label>Instructions (One step per line)</Label>
                        <Textarea rows={6} placeholder="Preheat oven to 350F...&#10;Mix dry ingredients..." />
                      </div>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button type="submit">Save Recipe</Button>
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
                  {recipes.map((recipe) => (
                    <TableRow key={recipe.id}>
                      <TableCell>
                        <img src={recipe.imageUrl} alt={recipe.title} className="w-12 h-12 rounded-md object-cover" />
                      </TableCell>
                      <TableCell className="font-medium">{recipe.title}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                          {categories.find(c => c.id === recipe.categoryId)?.name}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {recipe.prepTime} + {recipe.cookTime}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={handleEditClick}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteRecipe(recipe.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="flex justify-between items-center bg-card p-4 rounded-xl border shadow-sm">
              <h2 className="text-xl font-serif font-semibold">Categories ({categories.length})</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="gap-2" data-testid="btn-add-category">
                    <Plus className="w-4 h-4" /> Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Category</DialogTitle>
                    <DialogDescription>Create a new category for your recipes.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="cat-name">Name</Label>
                      <Input id="cat-name" placeholder="E.g., Vegan" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cat-slug">Slug</Label>
                      <Input id="cat-slug" placeholder="vegan" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cat-desc">Description</Label>
                      <Textarea id="cat-desc" placeholder="Brief description..." className="resize-none" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Save Category</Button>
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
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">{category.slug}</TableCell>
                      <TableCell className="text-sm text-muted-foreground truncate max-w-[200px]">{category.description}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={handleEditClick}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteCategory(category.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}