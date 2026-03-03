import { useMemo, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PropertyCard from "@/components/properties/PropertyCard";
import { useProperties } from "@/hooks/use-properties";
import { useUserActivity } from "@/hooks/use-user-activity";
import { useAuth } from "@/contexts/AuthContext";
import { toFrontendProperty } from "@/lib/propertyAdapter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Heart,
  Eye,
  Home,
  Mail,
  Phone,
  Shield,
  Calendar,
  MapPin,
  Bookmark,
  Clock,
  Settings,
  LogOut,
  ChevronRight,
  Sparkles,
  TrendingUp,
  KeyRound,
  ShieldAlert,
  Wrench,
  Plus,
  Loader2,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

const Profile = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const {
    favorites,
    viewedPropertyIds,
    toggleFavorite,
    markViewed,
  } = useUserActivity(isAuthenticated ? user?.id : undefined);

  const [activeTab, setActiveTab] = useState("saved");

  // Fetch properties from API (for resolving saved/viewed)
  const { data: apiResponse } = useProperties({ limit: 50 });

  const allProperties = useMemo(() => {
    return apiResponse?.data?.map(toFrontendProperty) || [];
  }, [apiResponse]);

  const savedProperties = useMemo(
    () => allProperties.filter((p) => favorites.includes(p.id)),
    [allProperties, favorites],
  );

  const viewedProperties = useMemo(
    () =>
      viewedPropertyIds
        .map((id) => allProperties.find((p) => p.id === id))
        .filter(Boolean) as typeof allProperties,
    [allProperties, viewedPropertyIds],
  );

  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const firstName = user?.name?.trim().split(" ")[0] ?? "";
  const initials =
    user?.name
      ?.trim()
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "U";

  const roleLabel: Record<string, string> = {
    STUDENT: "Student",
    LANDLORD: "Landlord",
    ADMIN: "Admin",
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-NG", {
        month: "long",
        year: "numeric",
      })
    : "Recently";

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Profile Hero */}
      <section className="pt-16">
        <div className="relative overflow-hidden">
          {/* Gradient background */}
          <div className="absolute inset-0 gradient-hero opacity-90" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15),_transparent_60%)]" />

          <div className="relative container mx-auto px-4 py-12 md:py-16">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-white/70 mb-8">
              <Home className="w-4 h-4" />
              <Link to="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white">My Profile</span>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <div className="relative group">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/30 flex items-center justify-center shadow-2xl overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-50" />
                  <span className="text-4xl md:text-5xl font-black text-white relative z-10 font-display tracking-tight">
                    {initials}
                  </span>
                </motion.div>
                {user?.verified && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-success border-4 border-white shadow-lg flex items-center justify-center z-20"
                  >
                    <Shield className="w-5 h-5 text-white" />
                  </motion.div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <h1 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight">
                    {user?.name}
                  </h1>
                  <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                    {roleLabel[user?.role ?? "STUDENT"]}
                  </Badge>
                  {user?.role === "LANDLORD" ? (
                    <Badge
                      variant={user?.landlordStatus === "VERIFIED" ? "success" : user?.landlordStatus === "REJECTED" ? "destructive" : "warning"}
                    >
                      {user?.landlordStatus === "VERIFIED" ? "Verified Landlord" : user?.landlordStatus === "REJECTED" ? "Verification Rejected" : "Verification Pending"}
                    </Badge>
                  ) : user?.verified && (
                    <Badge variant="success">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-3 text-white/80 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4" />
                    <span>{user?.email}</span>
                  </div>
                  {user?.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-4 h-4" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>Member since {memberSince}</span>
                  </div>
                </div>
              </div>

              {/* Quick actions */}
              <div className="flex gap-2 self-start md:self-center">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border-white/20"
                  asChild
                >
                  <Link to="/properties">
                    <MapPin className="w-4 h-4 mr-1.5" />
                    Browse
                  </Link>
                </Button>
              </div>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-12">
              {[
                {
                  label: "Saved Listings",
                  value: savedProperties.length,
                  icon: Heart,
                  color: "text-destructive",
                },
                {
                  label: "Recent Views",
                  value: viewedProperties.length,
                  icon: Eye,
                  color: "text-primary",
                },
                {
                  label: "Active Score",
                  value: savedProperties.length + viewedProperties.length > 5 ? "Elite" : "Pro",
                  icon: Sparkles,
                  color: "text-warning",
                },
                {
                  label: "Status",
                  value: user?.verified ? "Verified" : "Active",
                  icon: Shield,
                  color: "text-success",
                },
              ].map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                  className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-5 hover:bg-white/15 transition-all group overflow-hidden relative shadow-lg shadow-black/5"
                >
                  <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
                  <div className="flex justify-between items-start mb-3 relative z-10">
                    <stat.icon className={`w-6 h-6 ${stat.color} opacity-80`} />
                    <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                  </div>
                  <p className="text-3xl font-black text-white font-display tracking-tight leading-none mb-1.5">{stat.value}</p>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-white/50">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <section className="py-10 md:py-12">
        <div className="container mx-auto px-4">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="bg-muted/50 backdrop-blur-md p-1.5 rounded-2xl h-auto flex flex-wrap gap-1 border border-border/40 mb-10">
              <TabsTrigger value="saved" className="gap-2 px-5 py-2.5 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold">
                <Bookmark className="w-4 h-4" />
                <span>Saved</span>
              </TabsTrigger>
              <TabsTrigger value="viewed" className="gap-2 px-5 py-2.5 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold">
                <Clock className="w-4 h-4" />
                <span>History</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2 px-5 py-2.5 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold">
                <Settings className="w-4 h-4" />
                <span>Account</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2 px-5 py-2.5 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold">
                <Shield className="w-4 h-4" />
                <span>Security</span>
              </TabsTrigger>
              <TabsTrigger value="maintenance" className="gap-2 px-5 py-2.5 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold">
                <Wrench className="w-4 h-4" />
                <span>Repair Requests</span>
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <TabsContent value="saved" className="mt-0 outline-none">
                <motion.div
                  key="saved-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {savedProperties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                      {savedProperties.map((property) => (
                        <PropertyCard
                          key={property.id}
                          property={property}
                          isFavorite={true}
                          onFavoriteToggle={() => toggleFavorite(property.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={Heart}
                      title="No saved properties yet"
                      description="Browse properties and tap the heart icon to save your favorites here."
                      actionLabel="Browse Properties"
                      actionHref="/properties"
                    />
                  )}
                </motion.div>
              </TabsContent>

              <TabsContent value="viewed" className="mt-0 outline-none">
                <motion.div
                  key="viewed-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {viewedProperties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                      {viewedProperties.map((property) => (
                        <PropertyCard
                          key={property.id}
                          property={property}
                          isFavorite={favorites.includes(property.id)}
                          onFavoriteToggle={() => toggleFavorite(property.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={Eye}
                      title="No recently viewed properties"
                      description="Properties you've viewed will appear here for quick access."
                      actionLabel="Start Exploring"
                      actionHref="/properties"
                    />
                  )}
                </motion.div>
              </TabsContent>

              {/* ── Account Settings ── */}
              <TabsContent value="settings" className="mt-0 outline-none">
                <motion.div
                  key="settings-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="max-w-2xl space-y-8">
                    <Card className="border-border/40 bg-background/60 backdrop-blur-md shadow-primary-md overflow-hidden relative">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
                      <CardHeader className="pb-6 border-b border-border/40">
                        <CardTitle className="flex items-center gap-3 text-xl font-bold font-display tracking-tight text-primary">
                          <User className="w-6 h-6" />
                          Master Profile Records
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-8 space-y-6">
                        <InfoRow label="Legal Name" value={user?.name ?? "—"} />
                        <Separator className="bg-border/30" />
                        <InfoRow label="Primary Email" value={user?.email ?? "—"} />
                        <Separator className="bg-border/30" />
                        <InfoRow label="Phone Contact" value={user?.phone ?? "Not provided"} />
                        <Separator className="bg-border/30" />
                        <InfoRow label="User Role" value={roleLabel[user?.role ?? "STUDENT"]} />
                        <Separator className="bg-border/30" />
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Verification Status</span>
                          {user?.role === "LANDLORD" ? (
                            <Badge className={`px-4 py-1.5 font-bold text-[10px] uppercase border-none shadow-sm ${user?.landlordStatus === "VERIFIED" ? 'bg-success text-white' : 'bg-warning text-white'}`}>
                              {user?.landlordStatus === "VERIFIED" ? "Elite Provider" : "Audit Pending"}
                            </Badge>
                          ) : (
                            <Badge className={`px-4 py-1.5 font-bold text-[10px] uppercase border-none shadow-sm ${user?.verified ? 'bg-success text-white' : 'bg-muted text-muted-foreground'}`}>
                              {user?.verified ? "Verified Citizen" : "Self-Unverified"}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="border-destructive/20 bg-destructive/5 shadow-destructive/5 overflow-hidden">
                      <CardContent className="p-8">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-2xl bg-destructive/10 text-destructive">
                            <LogOut className="w-6 h-6" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <h3 className="text-lg font-bold">Disconnect Session</h3>
                            <p className="text-sm text-muted-foreground mb-6 font-medium leading-relaxed">
                              Securely sign out of your account on this device. Your favorites and preferences are synced to the cloud.
                            </p>
                            <Button variant="destructive" onClick={logout} className="rounded-xl px-8 h-12 font-bold shadow-lg shadow-destructive/20">
                              Terminate Session
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              </TabsContent>

              {/* ── Security ── */}
              <TabsContent value="security" className="mt-0 outline-none">
                <motion.div
                  key="security-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <SecuritySettings />
                </motion.div>
              </TabsContent>

              {/* ── Maintenance ── */}
              <TabsContent value="maintenance" className="mt-0 outline-none">
                <motion.div
                  key="maintenance-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <MaintenanceRequests />
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// ─── Helper components ──────────────────────────────────────────

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
        {label}
      </span>
      <span className="text-sm font-bold text-foreground bg-muted/20 px-4 py-1.5 rounded-xl border border-border/40 min-w-[120px] text-center">{value}</span>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-24 h-24 rounded-3xl bg-muted/30 border border-border/40 flex items-center justify-center mb-6 text-muted-foreground/30 shadow-inner">
        <Icon className="w-12 h-12" />
      </div>
      <h3 className="text-2xl font-bold font-display tracking-tight text-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-10 font-medium leading-relaxed">{description}</p>
      <Button asChild className="gradient-primary px-10 h-14 shadow-xl shadow-primary/20 gap-2 rounded-xl font-bold">
        <Link to={actionHref}>
          <Sparkles className="w-5 h-5" />
          {actionLabel}
        </Link>
      </Button>
    </div>
  );
}

export default Profile;

function SecuritySettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast({
        title: "Validation error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await import("@/services/auth").then((m) =>
        m.changePassword({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        })
      );
      toast({
        title: "Success",
        description: "Your password has been changed.",
      });
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to change password.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <Card className="border-border/40 bg-background/60 backdrop-blur-md shadow-primary-md overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl opacity-50" />
        <CardHeader className="pb-6 border-b border-border/40">
          <CardTitle className="flex items-center gap-3 text-xl font-bold font-display tracking-tight text-primary">
            <KeyRound className="w-6 h-6" />
            Security Protocol
          </CardTitle>
          <CardDescription className="font-medium">
            Rotate your password regularly to maintain account integrity.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="currentPassword" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Current Key</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  className="h-12 rounded-xl bg-muted/20 border-border/40"
                  value={passwords.currentPassword}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">New Secure Key</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  className="h-12 rounded-xl bg-muted/20 border-border/40"
                  value={passwords.newPassword}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Repeat New Key</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  className="h-12 rounded-xl bg-muted/20 border-border/40"
                  value={passwords.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="gradient-primary rounded-xl px-10 h-12 shadow-lg shadow-primary/20 font-bold"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Syncing...</span>
                </div>
              ) : "Update Credentials"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-warning/20 bg-warning/5 shadow-warning/5 overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-lg text-warning font-bold">
            <ShieldAlert className="w-5 h-5" />
            Advanced Shield (2FA)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-6 font-medium leading-relaxed">
            Biometric and TOTP authentication are currently in early-access staging.
          </p>
          <Button variant="outline" disabled className="gap-2 rounded-xl h-12 px-6 border-warning/20 text-warning opacity-60">
            Provision 2FA
            <Badge className="ml-1 text-[9px] bg-warning shadow-none border-none text-white italic">LABS</Badge>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function MaintenanceRequests() {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { data: response, isLoading: listLoading, refetch } = useQuery({
    queryKey: ["my-maintenance"],
    queryFn: () => import("@/services/maintenance").then(m => m.fetchMyMaintenanceRequests()),
  });

  const { data: bookingsResponse } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: () => import("@/services/bookings").then(m => m.fetchMyBookings()),
  });

  const approvedBookings = (bookingsResponse?.data || []).filter(
    (b) => b.status === "APPROVED"
  );

  const requests = response?.data || [];

  const handleCreateRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const propertyId = formData.get("propertyId") as string;
    const description = formData.get("description") as string;

    if (!propertyId) {
      toast({ title: "Error", description: "Please select a property.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await import("@/services/maintenance").then(m => m.createMaintenanceRequest({ propertyId, description }));
      toast({ title: "Request submitted", description: "The maintenance team has been notified." });
      setIsFormOpen(false);
      refetch();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-6 mb-8">
        <div>
          <h3 className="text-2xl font-bold font-display tracking-tight">Active Repair Tickets</h3>
          <p className="text-sm text-muted-foreground font-medium">Report and track structural/utility issues in your residence.</p>
        </div>
        <Button className="gradient-primary rounded-xl px-8 h-12 shadow-lg shadow-primary/20 font-bold gap-2" onClick={() => setIsFormOpen(!isFormOpen)}>
          {isFormOpen ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {isFormOpen ? "Collapse Form" : "Open Ticket"}
        </Button>
      </div>

      {isFormOpen && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Submit Repair Request</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div className="space-y-2">
                <Label>Property</Label>
                {approvedBookings.length > 0 ? (
                  <select
                    name="propertyId"
                    required
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Select a property</option>
                    {approvedBookings.map((b) => (
                      <option key={b.propertyId} value={b.propertyId}>
                        {b.property?.title || b.propertyId}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm text-muted-foreground py-2">
                    You need an approved booking to submit a maintenance request.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <textarea
                  name="description"
                  className="flex min-h-[100px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Describe the issue in detail..."
                  required
                />
              </div>
              <Button
                type="submit"
                className="gradient-primary w-full md:w-auto"
                disabled={isLoading || approvedBookings.length === 0}
              >
                {isLoading ? "Submitting..." : "Submit Request"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {listLoading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary opacity-40" />
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50">Fetching tickets...</p>
        </div>
      ) : requests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requests.map(req => (
            <Card key={req.id} className="border-border/40 bg-background/60 backdrop-blur-md shadow-primary-sm group overflow-hidden hover:border-primary/30 transition-all rounded-2xl">
              <div className="flex items-center justify-between p-5 bg-muted/20 border-b border-border/40">
                <span className="font-bold text-sm truncate max-w-[200px]">{req.description}</span>
                <Badge variant="outline" className="px-3 py-1 font-bold text-[10px] uppercase border-primary/20 bg-primary/5 text-primary italic">
                  {req.status.replace('_', ' ')}
                </Badge>
              </div>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-6">{req.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-border/40">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Ticket #{req.id.slice(0, 8)}</span>
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground/60">{new Date(req.createdAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Wrench}
          title="All systems operational"
          description="You haven't reported any maintenance issues. Enjoy your stay!"
          actionLabel="Report Issue"
          actionHref="#"
        />
      )}
    </div>
  );
}
