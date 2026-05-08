import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface RequireAuthProps {
  children: ReactNode;
  /** Where to send signed-out users. Defaults to /auth with a redirect param. */
  fallback?: string;
}

/**
 * Route guard. While auth state is loading, shows a spinner.
 * If the user is signed out, redirects to `fallback` (default: /auth)
 * preserving the original path + search in `?redirect=` so post-login
 * we can return them to where they were headed.
 */
export function RequireAuth({ children, fallback }: RequireAuthProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    if (fallback) return <Navigate to={fallback} replace />;
    const target = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth?redirect=${target}`} replace />;
  }

  return <>{children}</>;
}
