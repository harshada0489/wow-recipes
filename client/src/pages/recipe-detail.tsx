import { useParams } from "wouter";
import { MOCK_RECIPES, MOCK_CATEGORIES } from "@/lib/mock-data";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Clock, Users, ChefHat, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const recipe = MOCK_RECIPES.find((r) => r.id === id);

  if (!recipe) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xl text-muted-foreground">Recipe not found.</p>
        </div>
      </div>
    );
  }

  const category = MOCK_CATEGORIES.find((c) => c.id === recipe.categoryId);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-5xl">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-4">
          {category && (
            <Badge variant="secondary" className="px-4 py-1 mb-2">
              {category.name}
            </Badge>
          )}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight">
            {recipe.title}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {recipe.description}
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-sm font-medium text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>Prep: {recipe.prepTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-primary" />
              <span>Cook: {recipe.cookTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span>Serves: {recipe.servings}</span>
            </div>
          </div>
        </div>

        {/* Main Image */}
        <div className="relative aspect-[21/9] md:aspect-[2/1] overflow-hidden rounded-3xl mb-16 shadow-lg">
          <img 
            src={recipe.imageUrl} 
            alt={recipe.title}
            className="object-cover w-full h-full"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 lg:gap-20 items-start">
          {/* Ingredients Sidebar */}
          <div className="bg-card rounded-2xl p-6 md:p-8 border shadow-sm lg:sticky lg:top-24">
            <h2 className="text-2xl font-serif font-bold mb-6 flex items-center gap-2">
              Ingredients
            </h2>
            <ul className="space-y-4">
              {recipe.ingredients.map((ingredient, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <Checkbox id={`ingredient-${idx}`} className="mt-1" />
                  <label 
                    htmlFor={`ingredient-${idx}`}
                    className="text-base leading-snug cursor-pointer peer-data-[state=checked]:text-muted-foreground peer-data-[state=checked]:line-through transition-all"
                  >
                    {ingredient}
                  </label>
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
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
      </main>
      
      <Footer />
    </div>
  );
}