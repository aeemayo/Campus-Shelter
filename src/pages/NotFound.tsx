import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <SEO title="Page Not Found" noIndex />
      <div className="text-center max-w-md">
        <div className="w-24 h-24 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-8">
          <SearchX className="w-12 h-12 text-primary/40" />
        </div>
        <h1 className="font-display text-6xl font-bold text-foreground mb-2 tracking-tight">404</h1>
        <p className="text-xl text-muted-foreground mb-2">Page not found</p>
        <p className="text-sm text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button asChild className="gradient-primary hover:opacity-90 gap-2 rounded-full">
          <Link to="/">
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
