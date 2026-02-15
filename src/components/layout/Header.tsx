import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Menu, X, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const scrollToSection = (sectionId: string) => {
    setIsMenuOpen(false);

    const scroll = () => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    };

    if (location.pathname === "/") {
      // Already on homepage, scroll directly
      scroll();
    } else {
      // Navigate to homepage first, then scroll after render
      navigate("/");
      setTimeout(scroll, 150);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Home className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">
              Campus<span className="text-primary">Shelter</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/properties" className="text-muted-foreground hover:text-foreground transition-colors">
              Browse Properties
            </Link>
            <a
              href="/#how-it-works"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("how-it-works");
              }}
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              How It Works
            </a>
            <a
              href="/#call-to-action"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("call-to-action");
              }}
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Join Us
            </a>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-medium text-foreground">{user?.name?.split(' ')[0]}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-1" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button asChild className="gradient-primary hover:opacity-90 transition-opacity">
                  <Link to="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <nav className="flex flex-col gap-4">
              <Link 
                to="/properties" 
                className="text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Browse Properties
              </Link>
              <a
                href="/#how-it-works"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("how-it-works");
                }}
                className="text-muted-foreground hover:text-foreground transition-colors py-2 cursor-pointer"
              >
                How It Works
              </a>
              <a
                href="/#call-to-action"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("call-to-action");
                }}
                className="text-muted-foreground hover:text-foreground transition-colors py-2 cursor-pointer"
              >
                Join Us
              </a>
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-2 py-2 text-sm">
                      <User className="w-4 h-4 text-primary" />
                      <span className="font-medium">{user?.name}</span>
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => { handleLogout(); setIsMenuOpen(false); }}>
                      <LogOut className="w-4 h-4 mr-1" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/login">Sign In</Link>
                    </Button>
                    <Button asChild className="w-full gradient-primary">
                      <Link to="/register">Get Started</Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
