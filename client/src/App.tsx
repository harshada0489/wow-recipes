import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import RecipeDetail from "@/pages/recipe-detail";
import AdminRouter from "@/pages/admin/index";
import LegalPage from "@/pages/legal-page";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/recipe/:id" component={RecipeDetail} />
      <Route path="/admin/:rest*" component={AdminRouter} />
      <Route path="/admin" component={AdminRouter} />
      <Route path="/page/:slug" component={LegalPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
