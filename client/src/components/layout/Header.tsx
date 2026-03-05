import { Link, useLocation } from "wouter";
import { MOCK_CATEGORIES } from "@/lib/mock-data";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { ChefHat, Search, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Header() {
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/">
            <a className="flex items-center gap-2 font-serif text-2xl font-bold text-primary transition-colors hover:text-primary/80" data-testid="link-home">
              <ChefHat className="h-7 w-7" />
              <span>Wow Recipes</span>
            </a>
          </Link>

          <div className="hidden md:flex">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent font-medium">Recipes</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                      <div className="row-span-3">
                        <div className="flex h-full w-full flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md">
                          <ChefHat className="h-6 w-6 text-primary mb-4" />
                          <div className="mb-2 mt-4 text-lg font-serif font-medium">
                            Browse All Recipes
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            Explore our entire collection of meticulously crafted, easy-to-follow recipes.
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {MOCK_CATEGORIES.map((category) => (
                          <Link key={category.id} href={`/category/${category.slug}`}>
                            <a
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                              data-testid={`link-category-${category.slug}`}
                            >
                              <div className="text-sm font-medium leading-none font-serif">{category.name}</div>
                              {category.description && (
                                <p className="line-clamp-2 text-xs leading-snug text-muted-foreground mt-1">
                                  {category.description}
                                </p>
                              )}
                            </a>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <Link href="/about">
                    <a className={cn(navigationMenuTriggerStyle(), "bg-transparent font-medium")}>
                      About Us
                    </a>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="icon" className="hidden sm:flex text-muted-foreground">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
          
          {/* Admin link hidden for normal users */}
          {/* <Link href="/admin">
            <Button variant={location.startsWith('/admin') ? "secondary" : "ghost"} size="sm" className="hidden sm:flex gap-2">
              <User className="h-4 w-4" />
              <span>Admin</span>
            </Button>
          </Link> */}
          
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>
    </header>
  );
}