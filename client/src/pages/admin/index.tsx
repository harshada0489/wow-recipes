import { useQuery } from "@tanstack/react-query";
import { Route, Switch, useLocation, Redirect } from "wouter";
import { Loader2 } from "lucide-react";
import AdminLogin from "./login";
import AdminDashboard from "./dashboard";
import AdminCategories from "./categories";
import AdminPages from "./pages-admin";
import AdminComments from "./comments";
import AdminAds from "./ads";
import AdminSettings from "./settings";
import AdminLayout from "@/components/layout/AdminLayout";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/admin" />;
  }

  return (
    <AdminLayout>
      <Component />
    </AdminLayout>
  );
}

export default function AdminRouter() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  return (
    <Switch>
      <Route path="/admin">
        {() => {
          if (isLoading) {
            return (
              <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            );
          }
          if (user) {
            return <Redirect to="/admin/dashboard" />;
          }
          return <AdminLogin />;
        }}
      </Route>
      <Route path="/admin/dashboard">
        <ProtectedRoute component={AdminDashboard} />
      </Route>
      <Route path="/admin/categories">
        <ProtectedRoute component={AdminCategories} />
      </Route>
      <Route path="/admin/pages">
        <ProtectedRoute component={AdminPages} />
      </Route>
      <Route path="/admin/comments">
        <ProtectedRoute component={AdminComments} />
      </Route>
      <Route path="/admin/ads">
        <ProtectedRoute component={AdminAds} />
      </Route>
      <Route path="/admin/settings">
        <ProtectedRoute component={AdminSettings} />
      </Route>
    </Switch>
  );
}
