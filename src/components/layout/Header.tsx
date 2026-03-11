import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Home,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  MessageSquare,
  CalendarCheck,
  Building2,
  ArrowRight,
  Plus,
  ChevronDown,
  Shield,
  Wallet,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { fetchUnreadCount } from "@/services/messages";
import { fetchWallet } from "@/services/wallet";
const logo1 = "/CampusShelter4.png";
const logo2 = "/CampusShelter5.png";

const Header = ({ bgColor = "" }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const isHome = location.pathname === "/";
  const isDark = !scrolled && isHome && bgColor !== "white";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

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
    `relative text-sm font-medium px-3 py-2 rounded-lg transition-all duration-200 ${
      isActive(path)
        ? isDark ? "text-white bg-white/15" : "text-primary bg-primary/8"
        : isDark
          ? "text-white/70 hover:text-white hover:bg-white/10"
          : "text-foreground/60 hover:text-foreground hover:bg-muted"
    }`;

  const roleBadge = user?.role === "ADMIN"
    ? { label: "Admin", color: "bg-red-500/10 text-red-600 border-red-500/20" }
    : user?.role === "LANDLORD"
      ? { label: "Landlord", color: "bg-amber-500/10 text-amber-700 border-amber-500/20" }
      : null;

  const firstName = user?.name?.split(" ")[0];
  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["unread-messages"],
    queryFn: fetchUnreadCount,
    enabled: isAuthenticated && user?.role !== "ADMIN",
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });

  const { data: walletResponse } = useQuery({
    queryKey: ["wallet"],
    queryFn: fetchWallet,
    enabled: isAuthenticated && user?.role === "STUDENT",
    refetchInterval: 60_000,
  });
  const walletBalance = walletResponse?.data?.balance ?? 0;

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div
        className={`mx-auto transition-all duration-300 ${
          !isDark
            ? "bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center h-16 gap-1">
            {/* Logo */}
            <Link to="/" className="flex items-center shrink-0 mr-1">
              <img
                src={isDark ? logo1 : logo2}
                alt="CampusShelter"
                className="w-28 h-14"
              />
            </Link>

            {/* Separator between logo and nav */}
            {isAuthenticated && (
              <div className={`hidden lg:block w-px h-6 mx-3 ${isDark ? "bg-white/20" : "bg-border"}`} />
            )}

            {/* Desktop Navigation — left-aligned next to logo */}
            <nav className="hidden lg:flex items-center gap-1 flex-1">
              {(!isAuthenticated || user?.role === "STUDENT") && (
                <Link to="/properties" className={navLinkClass("/properties")}>
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    Properties
                  </span>
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
                    Dashboard
                  </span>
                </Link>
              )}
              {isAuthenticated && user?.role === "STUDENT" && (
                <Link to="/my-bookings" className={navLinkClass("/my-bookings")}>
                  <span className="flex items-center gap-1.5">
                    <CalendarCheck className="w-3.5 h-3.5" />
                    Bookings
                  </span>
                </Link>
              )}
              {isAuthenticated && user?.role === "STUDENT" && (
                <Link to="/wallet" className={navLinkClass("/wallet")}>
                  <span className="flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5" />
                    Wallet
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isDark ? "bg-white/15 text-white" : "bg-primary/10 text-primary"}`}>
                      ₦{walletBalance.toLocaleString()}
                    </span>
                  </span>
                </Link>
              )}
              {isAuthenticated && user?.role !== "ADMIN" && (
                <Link to="/messages" className={navLinkClass("/messages")}>
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Messages
                    {unreadCount > 0 && (
                      <span className="inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-primary text-white text-[10px] font-bold leading-none">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </span>
                </Link>
              )}
              {user?.role === "LANDLORD" && user.landlordStatus === "VERIFIED" && (
                <Link
                  to="/properties/add"
                  className={`text-sm font-medium px-3 py-2 rounded-lg transition-all duration-200 ${
                    isDark
                      ? "text-white/70 hover:text-white hover:bg-white/10"
                      : "text-primary hover:bg-primary/8"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    Add Listing
                  </span>
                </Link>
              )}
            </nav>

            {/* Desktop Auth — right side */}
            <div className="hidden lg:flex items-center gap-2">
              {isAuthenticated ? (
                <div ref={profileRef} className="relative">
                  <button
                    onClick={() => setProfileOpen((p) => !p)}
                    className={`flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full transition-all duration-200 ${
                      profileOpen
                        ? isDark ? "bg-white/15" : "bg-muted"
                        : isDark ? "hover:bg-white/10" : "hover:bg-muted"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-[11px] font-bold text-white ring-2 ring-background">
                      {initials}
                    </div>
                    <span className={`text-sm font-medium max-w-[100px] truncate ${isDark ? "text-white" : "text-foreground"}`}>
                      {firstName}
                    </span>
                    {roleBadge && (
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${roleBadge.color}`}>
                        {roleBadge.label}
                      </span>
                    )}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""} ${isDark ? "text-white/60" : "text-muted-foreground"}`} />
                  </button>

                  {/* Profile dropdown */}
                  {profileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-lg py-1.5 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                      <div className="px-3 py-2.5 border-b border-border">
                        <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-foreground/80 hover:bg-muted hover:text-foreground transition-colors"
                        >
                          <div className="w-4 h-4 rounded-full gradient-primary flex items-center justify-center">
                            <span className="text-[7px] font-bold text-white">{initials}</span>
                          </div>
                          My Profile
                        </Link>
                        {user?.role === "ADMIN" && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-2.5 px-3 py-2 text-sm text-foreground/80 hover:bg-muted hover:text-foreground transition-colors"
                          >
                            <Shield className="w-4 h-4 text-red-500" />
                            Admin Panel
                          </Link>
                        )}
                      </div>
                      <div className="border-t border-border pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/8 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className={`text-sm h-9 rounded-lg ${
                      isDark
                        ? "text-white/80 hover:text-white hover:bg-white/10"
                        : "text-foreground/70 hover:text-foreground"
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
              className={`lg:hidden ml-auto p-2 rounded-lg transition-colors ${
                isDark
                  ? "text-white hover:bg-white/10"
                  : "text-foreground hover:bg-muted"
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

          <div className="relative mx-4 mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {isAuthenticated && roleBadge && (
              <div className="px-4 pt-3 pb-1">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${roleBadge.color}`}>
                  {roleBadge.label}
                </span>
              </div>
            )}
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
              {isAuthenticated && user?.role === "STUDENT" && (
                <MobileLink
                  to="/wallet"
                  icon={Wallet}
                  label={`Wallet (₦${walletBalance.toLocaleString()})`}
                  active={isActive("/wallet")}
                  onClick={() => setIsMenuOpen(false)}
                />
              )}

              {isAuthenticated && user?.role !== "ADMIN" && (
                <MobileLink
                  to="/messages"
                  icon={MessageSquare}
                  label={unreadCount > 0 ? `Messages (${unreadCount > 99 ? "99+" : unreadCount})` : "Messages"}
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
                  label="Dashboard"
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
