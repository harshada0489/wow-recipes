import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ChefHat } from "lucide-react";
import { LegalPage } from "@/lib/mock-data";

export default function Footer() {
  const { data: pages = [] } = useQuery<LegalPage[]>({
    queryKey: ["/api/pages"],
  });

  return (
    <footer className="bg-card border-t py-12 mt-auto">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-serif text-2xl font-bold text-primary transition-colors hover:text-primary/80">
              <ChefHat className="h-7 w-7" />
              <span>Wow Recipes</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Discover tested, refined, and exquisite recipes for every occasion. Bringing the joy of cooking into your home.
            </p>
          </div>
          
          <div>
            <h3 className="font-serif font-semibold text-lg mb-4 text-foreground">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/" className="hover:text-primary transition-colors">All Recipes</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-serif font-semibold text-lg mb-4 text-foreground">Legal & Info</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {pages.map(page => (
                <li key={page.id}>
                  <Link href={`/page/${page.slug}`} className="hover:text-primary transition-colors">
                    {page.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="border-t pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Wow Recipes. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
