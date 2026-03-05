import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { LegalPage as LegalPageType } from "@/lib/mock-data";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Loader2 } from "lucide-react";

export default function LegalPage() {
  const { slug } = useParams<{ slug: string }>();
  
  const { data: page, isLoading } = useQuery<LegalPageType>({
    queryKey: [`/api/pages/by-slug/${slug}`],
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16 text-center flex flex-col justify-center items-center">
          <h1 className="text-3xl font-serif font-bold mb-4">Page Not Found</h1>
          <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-16 md:py-24">
        <article className="max-w-3xl mx-auto bg-card border border-border/50 rounded-2xl p-8 md:p-12 shadow-sm">
          <h1 className="text-4xl font-serif font-bold mb-8 text-foreground tracking-tight">{page.title}</h1>
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            {page.content.split('\n\n').map((paragraph, i) => (
              <p key={i} className="mb-6 text-muted-foreground leading-relaxed text-lg">
                {paragraph}
              </p>
            ))}
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
