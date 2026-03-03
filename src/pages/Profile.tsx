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
              <div className="relative">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-xl bg-white/20 backdrop-blur-md border-2 border-white/30 flex items-center justify-center shadow-xl">
                  <span className="text-3xl md:text-4xl font-bold text-white">
                    {initials}
                  </span>
                </div>
                {user?.verified && (
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-success border-2 border-white flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
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
                  {user?.verified && (
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-8">
              {[
                {
                  label: "Saved Properties",
                  value: savedProperties.length,
                  icon: Heart,
                  color: "text-destructive/70",
                },
                {
                  label: "Recently Viewed",
                  value: viewedProperties.length,
                  icon: Eye,
                  color: "text-primary/70",
                },
                {
                  label: "Total Listings",
                  value: allProperties.length,
                  icon: TrendingUp,
                  color: "text-success/70",
                },
                {
                  label: "Activity Score",
                  value:
                    savedProperties.length + viewedProperties.length > 0
                      ? "Active"
                      : "New",
                  icon: Sparkles,
                  color: "text-warning/70",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white/10 backdrop-blur-md rounded-xl border border-white/15 p-4 hover:bg-white/15 transition-colors"
                >
                  <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-white/60">{stat.label}</p>
                </div>
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
            <TabsList className="w-full md:w-auto mb-8 h-auto flex-wrap gap-1 bg-muted/50 p-1.5 rounded-xl">
              <TabsTrigger
                value="saved"
                className="gap-2 data-[state=active]:gradient-primary data-[state=active]:text-white rounded-lg px-4 py-2.5"
              >
                <Bookmark className="w-4 h-4" />
                <span>Saved Properties</span>
                {savedProperties.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 bg-white/20 text-inherit h-5 min-w-5 flex items-center justify-center rounded-full text-[11px]"
                  >
                    {savedProperties.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="viewed"
                className="gap-2 data-[state=active]:gradient-primary data-[state=active]:text-white rounded-lg px-4 py-2.5"
              >
                <Clock className="w-4 h-4" />
                <span>Recently Viewed</span>
                {viewedProperties.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 bg-white/20 text-inherit h-5 min-w-5 flex items-center justify-center rounded-full text-[11px]"
                  >
                    {viewedProperties.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="gap-2 data-[state=active]:gradient-primary data-[state=active]:text-white rounded-lg px-4 py-2.5"
              >
                <Settings className="w-4 h-4" />
                <span>Account</span>
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="gap-2 data-[state=active]:gradient-primary data-[state=active]:text-white rounded-lg px-4 py-2.5"
              >
                <Shield className="w-4 h-4" />
                <span>Security</span>
              </TabsTrigger>
              <TabsTrigger
                value="maintenance"
                className="gap-2 data-[state=active]:gradient-primary data-[state=active]:text-white rounded-lg px-4 py-2.5"
              >
                <Wrench className="w-4 h-4" />
                <span>Maintenance</span>
              </TabsTrigger>
            </TabsList>

            {/* ── Saved Properties ── */}
            <TabsContent value="saved" className="mt-0">
              {savedProperties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
            </TabsContent>

            {/* ── Recently Viewed ── */}
            <TabsContent value="viewed" className="mt-0">
              {viewedProperties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
            </TabsContent>

            {/* ── Account Settings ── */}
            <TabsContent value="settings" className="mt-0">
              <div className="max-w-2xl space-y-6">
                {/* Profile Info Card */}
                <Card className="border-border/60 shadow-primary-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <User className="w-5 h-5 text-primary" />
                      Profile Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <InfoRow label="Full Name" value={user?.name ?? "—"} />
                    <Separator className="bg-border/60" />
                    <InfoRow label="Email Address" value={user?.email ?? "—"} />
                    <Separator className="bg-border/60" />
                    <InfoRow
                      label="Phone Number"
                      value={user?.phone ?? "Not provided"}
                    />
                    <Separator className="bg-border/60" />
                    <InfoRow
                      label="Account Type"
                      value={roleLabel[user?.role ?? "STUDENT"]}
                    />
                    <Separator className="bg-border/60" />
                    <InfoRow
                      label="Verification Status"
                      value={
                        <Badge
                          variant={user?.verified ? "success" : "secondary"}
                        >
                          {user?.verified ? (
                            <>
                              <Shield className="w-3 h-3 mr-1" />
                              Verified
                            </>
                          ) : (
                            "Pending"
                          )}
                        </Badge>
                      }
                    />
                    <Separator className="bg-border/60" />
                    <InfoRow label="Member Since" value={memberSince} />
                  </CardContent>
                </Card>

                {/* Activity Summary Card */}
                <Card className="border-border/60 shadow-primary-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Activity Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-xl bg-destructive/5 p-4 text-center">
                        <Heart className="w-6 h-6 text-destructive mx-auto mb-1" />
                        <p className="text-2xl font-bold text-foreground">
                          {savedProperties.length}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Favorites
                        </p>
                      </div>
                      <div className="rounded-xl bg-primary/5 p-4 text-center">
                        <Eye className="w-6 h-6 text-primary mx-auto mb-1" />
                        <p className="text-2xl font-bold text-foreground">
                          {viewedProperties.length}
                        </p>
                        <p className="text-xs text-muted-foreground">Viewed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-destructive/30 shadow-primary-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg text-destructive">
                      <LogOut className="w-5 h-5" />
                      Session
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Sign out of your account on this device. Your saved
                      properties and preferences will be preserved for your next
                      session.
                    </p>
                    <Button
                      variant="destructive"
                      onClick={logout}
                      className="gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ── Security ── */}
            <TabsContent value="security" className="mt-0">
              <SecuritySettings />
            </TabsContent>

            {/* ── Maintenance ── */}
            <TabsContent value="maintenance" className="mt-0">
              <MaintenanceRequests />
            </TabsContent>
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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
      <span className="text-sm font-medium text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-medium text-foreground">{value}</span>
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
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-5">
        <Icon className="w-10 h-10 text-primary/60" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2 tracking-tight">{title}</h3>
      <p className="text-muted-foreground max-w-md mb-6">{description}</p>
      <Button asChild className="gradient-primary hover:opacity-90 gap-2 rounded-full">
        <Link to={actionHref}>
          <MapPin className="w-4 h-4" />
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
      <Card className="border-border/60 shadow-primary-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <KeyRound className="w-5 h-5 text-primary" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your password to keep your account secure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={passwords.currentPassword}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={passwords.newPassword}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={passwords.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <Button
              type="submit"
              className="gradient-primary w-full sm:w-auto"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-primary-sm bg-muted/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-warning">
            <ShieldAlert className="w-5 h-5" />
            Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Security enhancement with 2FA is coming soon to CampusShelter.
          </p>
          <Button variant="outline" disabled className="gap-2">
            Enable 2FA
            <Badge variant="secondary" className="ml-1 text-[10px]">SOON</Badge>
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
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold tracking-tight">Maintenance Requests</h3>
          <p className="text-sm text-muted-foreground">Report and track issues in your accommodation.</p>
        </div>
        <Button className="gradient-primary gap-2" onClick={() => setIsFormOpen(!isFormOpen)}>
          {isFormOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isFormOpen ? "Cancel" : "New Request"}
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
        <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map(req => (
            <Card key={req.id} className="border-border/60 shadow-primary-sm overflow-hidden">
              <div className="flex items-center justify-between p-4 bg-muted/30 border-b">
                <span className="font-semibold">{req.description.slice(0, 60)}{req.description.length > 60 ? "…" : ""}</span>
                <Badge variant="outline">{req.status.replace('_', ' ')}</Badge>
              </div>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{req.description}</p>
                <div className="mt-4 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>ID: #{req.id.slice(0, 8)}</span>
                  <span>Submitted: {new Date(req.createdAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-muted/10 rounded-xl border border-dashed">
          <Wrench className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h4 className="font-medium">No maintenance requests</h4>
          <p className="text-sm text-muted-foreground">When you have issues, they'll appear here.</p>
        </div>
      )}
    </div>
  );
}
