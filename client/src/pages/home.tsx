import { MOCK_RECIPES, MOCK_CATEGORIES } from "@/lib/mock-data";
import { Link } from "wouter";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden bg-muted/30">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
          <div className="container mx-auto px-4 md:px-6 relative z-10 text-center max-w-3xl">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 font-serif">
              Cooking Made <span className="text-primary italic">Beautiful</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Discover tested, refined, and exquisite recipes for every occasion. From quick weeknight dinners to show-stopping desserts.
            </p>
          </div>
        </section>

        {/* Categories Pills */}
        <section className="py-8 border-b border-border/50 bg-card/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide">
              <Badge variant="default" className="px-4 py-2 text-sm whitespace-nowrap cursor-pointer rounded-full font-medium">
                All Recipes
              </Badge>
              {MOCK_CATEGORIES.map(cat => (
                <Badge key={cat.id} variant="secondary" className="px-4 py-2 text-sm whitespace-nowrap cursor-pointer rounded-full font-medium hover:bg-primary/10 transition-colors">
                  {cat.name}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Recipe Grid */}
        <section className="py-16 md:py-24 container mx-auto px-4 md:px-6">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold font-serif mb-2">Latest Recipes</h2>
              <p className="text-muted-foreground">Fresh from our test kitchen</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {MOCK_RECIPES.map((recipe) => {
              const category = MOCK_CATEGORIES.find(c => c.id === recipe.categoryId);
              
              return (
                <Link key={recipe.id} href={`/recipe/${recipe.id}`}>
                  <a className="block group focus:outline-none" data-testid={`card-recipe-${recipe.id}`}>
                    <Card className="h-full overflow-hidden border-border/40 bg-card hover:border-primary/30 hover:shadow-xl transition-all duration-300 rounded-2xl flex flex-col hover:-translate-y-1">
                      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                        <img 
                          src={recipe.imageUrl} 
                          alt={recipe.title}
                          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                        />
                        {category && (
                          <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm px-3 py-1 text-xs font-medium rounded-full shadow-sm">
                            {category.name}
                          </div>
                        )}
                      </div>
                      
                      <CardHeader className="p-5 pb-0 flex-1">
                        <h3 className="font-serif text-xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2 mb-2">
                          {recipe.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {recipe.description}
                        </p>
                      </CardHeader>
                      
                      <CardFooter className="p-5 pt-4 text-xs text-muted-foreground flex items-center justify-between border-t border-border/30 mt-4">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{recipe.prepTime} + {recipe.cookTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" />
                          <span>{recipe.servings} serves</span>
                        </div>
                      </CardFooter>
                    </Card>
                  </a>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}