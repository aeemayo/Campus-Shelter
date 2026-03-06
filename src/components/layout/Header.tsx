import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Home,
  Menu,
  X,
  LogOut,
  User,
  LayoutDashboard,
  MessageSquare,
  CalendarCheck,
  Building2,
  ArrowRight,
  Plus,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import logo1 from "../../../public/CampusShelter4.png";
import logo2 from "../../../public/CampusShelter5.png";

const Header = ({ bgColor = "" }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const scrollToSection = (sectionId: string) => {
    setIsMenuOpen(false);
    const scroll = () => {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    };
    if (location.pathname === "/") {
      scroll();
    } else {
      navigate("/");
      setTimeout(scroll, 150);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinkClass = (path: string) =>
    `relative text-sm font-medium px-3.5 py-2 rounded-md transition-colors ${
      isActive(path)
        ? "text-primary bg-primary/8"
        : scrolled || !isHome
          ? "text-foreground/70 hover:text-foreground hover:bg-muted"
          : "text-white/70 hover:text-white hover:bg-white/10"
    }`;

  const firstName = user?.name?.split(" ")[0];
  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div
        className={`mx-auto transition-all duration-300 ${
          scrolled || !isHome
            ? "bg-background/95 backdrop-blur-md border-b border-border/50 shadow-primary-sm"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div className="flex items-center justify-center">
                {scrolled ? (
                  <img src={logo2} alt="" className="w-28 h-14" />
                ) : (
                  <img
                    src={bgColor === "white" ? logo2 : logo1}
                    alt="CampusShelter"
                    className="w-28 h-14"
                  />
                )}
              </div>
              <span
                className={`font-display text-lg font-bold tracking-tight transition-colors ${
                  scrolled || !isHome ? "text-foreground" : "text-white"
                }`}
              ></span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {(!isAuthenticated || user?.role === "STUDENT") && (
                <Link to="/properties" className={navLinkClass("/properties")}>
                  Properties
                </Link>
              )}
              {!isAuthenticated && (
                <Link
                  to="/register?role=LANDLORD"
                  className={navLinkClass("/register?role=LANDLORD")}
                >
                  Get Onboarded
                </Link>
              )}
              {user?.role === "LANDLORD" && (
                <Link to="/landlord" className={navLinkClass("/landlord")}>
                  <span className="flex items-center gap-1.5">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Dashboard
                  </span>
                </Link>
              )}
              {user?.role === "ADMIN" && (
                <Link to="/admin" className={navLinkClass("/admin")}>
                  <span className="flex items-center gap-1.5">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Admin
                  </span>
                </Link>
              )}
              {isAuthenticated && user?.role === "STUDENT" && (
                <Link
                  to="/my-bookings"
                  className={navLinkClass("/my-bookings")}
                >
                  Bookings
                </Link>
              )}
              {isAuthenticated && user?.role !== "ADMIN" && (
                <Link to="/messages" className={navLinkClass("/messages")}>
                  Messages
                </Link>
              )}
            </nav>

            {/* Desktop Auth */}
            <div className="hidden lg:flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className={`flex items-center gap-2.5 pl-1.5 pr-3.5 py-1.5 rounded-full transition-colors ${
                      scrolled || !isHome
                        ? "hover:bg-muted"
                        : "hover:bg-white/10"
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-[10px] font-bold text-white">
                      {initials}
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        scrolled || !isHome ? "text-foreground" : "text-white"
                      }`}
                    >
                      {firstName}
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className={`p-2 rounded-md transition-colors ${
                      scrolled || !isHome
                        ? "text-muted-foreground hover:text-foreground hover:bg-muted"
                        : "text-white/60 hover:text-white hover:bg-white/10"
                    }`}
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className={`text-sm h-9 rounded-md ${
                      scrolled || !isHome
                        ? "text-foreground/70 hover:text-foreground"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Link to="/login">Sign in</Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className="h-9 text-sm gradient-primary hover:opacity-90 rounded-full px-5"
                  >
                    <Link to="/register">
                      Get started
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className={`lg:hidden p-2 rounded-md transition-colors ${
                scrolled || !isHome
                  ? "text-foreground hover:bg-muted"
                  : "text-white hover:bg-white/10"
              }`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-16 bottom-0 z-40">
          <div
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />

          <div className="relative mx-4 mt-2 bg-card border border-border rounded-xl shadow-primary-xl overflow-hidden animate-fade-in">
            <nav className="p-3 space-y-0.5">
              {(!isAuthenticated || user?.role === "STUDENT") && (
                <MobileLink
                  to="/properties"
                  icon={Building2}
                  label="Browse Properties"
                  active={isActive("/properties")}
                  onClick={() => setIsMenuOpen(false)}
                />
              )}

              {isAuthenticated && user?.role === "STUDENT" && (
                <MobileLink
                  to="/my-bookings"
                  icon={CalendarCheck}
                  label="My Bookings"
                  active={isActive("/my-bookings")}
                  onClick={() => setIsMenuOpen(false)}
                />
              )}

              {isAuthenticated && user?.role !== "ADMIN" && (
                <MobileLink
                  to="/messages"
                  icon={MessageSquare}
                  label="Messages"
                  active={isActive("/messages")}
                  onClick={() => setIsMenuOpen(false)}
                />
              )}

              {user?.role === "LANDLORD" && (
                <>
                  <MobileLink
                    to="/landlord"
                    icon={LayoutDashboard}
                    label="Dashboard"
                    active={isActive("/landlord")}
                    onClick={() => setIsMenuOpen(false)}
                  />
                  {user.landlordStatus === "VERIFIED" && (
                    <Link
                      to="/properties/add"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 mx-3 my-1 px-3 py-2.5 rounded-xl text-sm font-semibold gradient-primary text-white transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Add Property
                    </Link>
                  )}
                </>
              )}

              {user?.role === "ADMIN" && (
                <MobileLink
                  to="/admin"
                  icon={LayoutDashboard}
                  label="Admin"
                  active={isActive("/admin")}
                  onClick={() => setIsMenuOpen(false)}
                />
              )}

              <button
                onClick={() => scrollToSection("how-it-works")}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <Home className="w-4 h-4" />
                How It Works
              </button>

              {!isAuthenticated && (
                <MobileLink
                  to="/register?role=LANDLORD"
                  icon={Building2}
                  label="List your property"
                  active={isActive("/register?role=LANDLORD")}
                  onClick={() => setIsMenuOpen(false)}
                />
              )}
            </nav>

            <div className="p-3 border-t border-border">
              {isAuthenticated ? (
                <div className="space-y-1">
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-[11px] font-bold text-white">
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {user?.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/8 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    asChild
                    className="flex-1 h-10 rounded-lg text-sm"
                  >
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      Sign in
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="flex-1 h-10 gradient-primary rounded-lg text-sm"
                  >
                    <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                      Get started
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

function MobileLink({
  to,
  icon: Icon,
  label,
  active,
  onClick,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
        active
          ? "bg-primary/8 text-primary font-medium"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  );
}

export default Header;
