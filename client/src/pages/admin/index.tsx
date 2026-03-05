import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import AdminLogin from "./login";
import AdminDashboard from "./dashboard";
import { Loader2 } from "lucide-react";

export default function AdminPage() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
    staleTime: 0,
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user && isAuthenticated !== true) {
    return (
      <AdminLogin
        onLogin={() => {
          setIsAuthenticated(true);
          queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
        }}
      />
    );
  }

  return (
    <AdminDashboard
      onLogout={() => {
        setIsAuthenticated(false);
        queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      }}
    />
  );
}
