import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import PropertyCard from "@/components/properties/PropertyCard";
import { useProperties } from "@/hooks/use-properties";
import { useUserActivity } from "@/hooks/use-user-activity";
import { useAuth } from "@/contexts/AuthContext";
import { toFrontendProperty } from "@/lib/propertyAdapter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Pencil,
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
  const { user, isAuthenticated, logout, updateUser } = useAuth();
  const { favorites, viewedPropertyIds, toggleFavorite, markViewed } =
    useUserActivity(isAuthenticated ? user?.id : undefined);

  const isAdmin = user?.role === "ADMIN";
  const isLandlord = user?.role === "LANDLORD";
  const isStudent = user?.role === "STUDENT";

  const defaultTab = isAdmin ? "settings" : "saved";
  const [activeTab, setActiveTab] = useState(defaultTab);

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
      <SEO title="Profile" description="Manage your CampusShelter profile and account settings." path="/profile" noIndex />
      <Header bgColor="white" />

      {/* Profile Hero */}
      <section className="pt-16">
        <div className="border-b border-border/40 bg-muted/20">
          <div className="container mx-auto px-4 py-10 md:py-12">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
              <Home className="w-4 h-4" />
              <Link to="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-foreground">My Profile</span>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-primary/10 border border-border flex items-center justify-center overflow-hidden"
                >
                  <span className="text-3xl md:text-4xl font-bold text-primary">
                    {initials}
                  </span>
                </motion.div>
                {user?.verifiedAt && (
                  <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-success border-2 border-background shadow-sm flex items-center justify-center z-20">
                    <Shield className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-xl md:text-2xl font-bold text-foreground">
                    {user?.name}
                  </h1>
                  <Badge variant="secondary">
                    {roleLabel[user?.role ?? "STUDENT"]}
                  </Badge>
                  {user?.role === "LANDLORD" ? (
                    <Badge
                      variant={
                        user?.landlordStatus === "VERIFIED"
                          ? "success"
                          : user?.landlordStatus === "REJECTED" ||
                              user?.landlordStatus === "SUSPENDED"
                            ? "destructive"
                            : "warning"
                      }
                    >
                      {user?.landlordStatus === "VERIFIED"
                        ? "Verified Landlord"
                        : user?.landlordStatus === "REJECTED"
                          ? "Verification Rejected"
                          : user?.landlordStatus === "SUSPENDED"
                            ? "Account Suspended"
                            : "Verification Pending"}
                    </Badge>
                  ) : (
                    user?.verifiedAt && (
                      <Badge variant="success">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-2 text-muted-foreground text-sm">
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
                <EditProfileDialog user={user} onSave={(updated) => updateUser(updated)} />
                <Button variant="outline" size="sm" asChild>
                  <Link to="/properties">
                    <MapPin className="w-4 h-4 mr-1.5" />
                    Browse
                  </Link>
                </Button>
              </div>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-8">
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
                  label: "Member Since",
                  value: user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-NG", { month: "short", year: "numeric" })
                    : "—",
                  icon: Calendar,
                  color: "text-muted-foreground",
                },
                {
                  label: "Status",
                  value:
                    user?.role === "LANDLORD"
                      ? user.landlordStatus === "VERIFIED"
                        ? "Verified"
                        : user.landlordStatus === "SUSPENDED"
                          ? "Suspended"
                          : user.landlordStatus === "REJECTED"
                            ? "Rejected"
                            : "Pending"
                      : user?.verifiedAt
                        ? "Verified"
                        : "Active",
                  icon: Shield,
                  color:
                    user?.role === "LANDLORD" &&
                    (user.landlordStatus === "SUSPENDED" ||
                      user.landlordStatus === "REJECTED")
                      ? "text-destructive"
                      : user?.role === "LANDLORD" &&
                          user.landlordStatus === "PENDING"
                        ? "text-warning"
                        : "text-success",
                },
              ].map((stat, idx) => (
                <div
                  key={stat.label}
                  className="bg-background rounded-xl border border-border/60 p-4"
                >
                  <stat.icon className={`w-4 h-4 ${stat.color} mb-2`} />
                  <p className="text-lg font-bold text-foreground leading-none mb-1">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <section className="py-8 md:py-10">
        <div className="container mx-auto px-4">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              {/* Tab nav — horizontal scroll on mobile, vertical sidebar on desktop */}
              <div className="overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 shrink-0">
                <TabsList className="bg-muted/40 p-1 rounded-xl h-auto border border-border/40 inline-flex lg:flex lg:flex-col gap-1 lg:w-44 min-w-max lg:min-w-0">
                  {!isAdmin && (
                    <TabsTrigger value="saved" className="gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap lg:w-full lg:justify-start">
                      <Bookmark className="w-4 h-4 shrink-0" />
                      <span>Saved</span>
                    </TabsTrigger>
                  )}
                  {!isAdmin && (
                    <TabsTrigger value="viewed" className="gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap lg:w-full lg:justify-start">
                      <Clock className="w-4 h-4 shrink-0" />
                      <span>History</span>
                    </TabsTrigger>
                  )}
                  <TabsTrigger value="settings" className="gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap lg:w-full lg:justify-start">
                    <Settings className="w-4 h-4 shrink-0" />
                    <span>Account</span>
                  </TabsTrigger>
                  <TabsTrigger value="security" className="gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap lg:w-full lg:justify-start">
                    <Shield className="w-4 h-4 shrink-0" />
                    <span>Security</span>
                  </TabsTrigger>
                  {isStudent && (
                    <TabsTrigger value="maintenance" className="gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap lg:w-full lg:justify-start">
                      <Wrench className="w-4 h-4 shrink-0" />
                      <span>Repair Requests</span>
                    </TabsTrigger>
                  )}
                </TabsList>
              </div>

              {/* Content area */}
              <div className="flex-1 min-w-0">
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
                  <div className="space-y-6 max-w-2xl">
                    <Card className="border-border/60">
                      <CardHeader className="pb-4 border-b border-border/40">
                        <CardTitle className="flex items-center gap-2 text-base font-semibold">
                          <User className="w-4 h-4 text-primary" />
                          Profile Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-5 space-y-4">
                        <InfoRow label="Name" value={user?.name ?? "—"} />
                        <Separator className="bg-border/30" />
                        <InfoRow label="Email" value={user?.email ?? "—"} />
                        <Separator className="bg-border/30" />
                        <InfoRow
                          label="Phone"
                          value={user?.phone ?? "Not provided"}
                        />
                        <Separator className="bg-border/30" />
                        <InfoRow
                          label="Role"
                          value={roleLabel[user?.role ?? "STUDENT"]}
                        />
                        <Separator className="bg-border/30" />
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <span className="text-sm text-muted-foreground">
                            Verification Status
                          </span>
                          {user?.role === "LANDLORD" ? (
                            <Badge
                              className={`px-4 py-1.5 font-bold text-[10px] uppercase border-none shadow-sm ${user?.landlordStatus === "VERIFIED" ? "bg-success text-white" : user?.landlordStatus === "REJECTED" || user?.landlordStatus === "SUSPENDED" ? "bg-destructive text-white" : "bg-warning text-white"}`}
                            >
                              {user?.landlordStatus === "VERIFIED"
                                ? "Verified"
                                : user?.landlordStatus === "REJECTED"
                                  ? "Rejected"
                                  : user?.landlordStatus === "SUSPENDED"
                                    ? "Suspended"
                                    : "Pending"}
                            </Badge>
                          ) : (
                            <Badge
                              className={`px-4 py-1.5 font-bold text-[10px] uppercase border-none shadow-sm ${user?.verifiedAt ? "bg-success text-white" : "bg-muted text-muted-foreground"}`}
                            >
                              {user?.verifiedAt ? "Verified" : "Unverified"}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Suspension Appeal */}
                    {user?.role === "LANDLORD" &&
                      user.landlordStatus === "SUSPENDED" && (
                        <SuspensionAppealSection />
                      )}

                    {/* Student ID Verification */}
                    {isStudent && (
                      <StudentIdUploadSection onVerified={(u) => updateUser(u)} />
                    )}

                    {/* Sign Out */}
                    <Card className="border-border/40">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-2.5 rounded-xl bg-muted text-muted-foreground">
                            <LogOut className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-base font-semibold mb-1">
                              Sign out
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              Sign out of your account on this device.
                            </p>
                            <Button variant="outline" onClick={logout}>
                              Sign out
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Delete Account */}
                    <DeleteAccountSection />
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
              </div>{/* end content area */}
            </div>{/* end lg:flex-row */}
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// ─── Helper components ──────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

function EditProfileDialog({
  user,
  onSave,
}: {
  user: any;
  onSave: (u: any) => void;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      toast({ title: "Name too short", description: "Name must be at least 2 characters.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const res = await import("@/services/auth").then((m) =>
        m.updateProfile({ name: name.trim(), phone: phone.trim() || undefined })
      );
      onSave(res.data.user);
      toast({ title: "Profile updated", description: "Your changes have been saved." });
      setOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to save.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => { setName(user?.name ?? ""); setPhone(user?.phone ?? ""); setOpen(true); }}>
        <Pencil className="w-4 h-4 mr-1.5" />
        Edit Profile
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Adeyemi"
                className="h-10 rounded-lg"
                required
                minLength={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-email">
                Email Address
                <span className="ml-2 text-xs text-muted-foreground font-normal">(cannot be changed)</span>
              </Label>
              <Input
                id="edit-email"
                value={user?.email ?? ""}
                disabled
                className="h-10 rounded-lg bg-muted/40 text-muted-foreground cursor-not-allowed"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-phone">Phone Number</Label>
              <Input
                id="edit-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 07012345678"
                className="h-10 rounded-lg"
                type="tel"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Input
                value={user?.role === "STUDENT" ? "Student" : user?.role === "LANDLORD" ? "Landlord" : "Admin"}
                disabled
                className="h-10 rounded-lg bg-muted/40 text-muted-foreground cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              To change your password, go to the{" "}
              <button
                type="button"
                className="underline hover:text-foreground"
                onClick={() => { setOpen(false); }}
              >
                Security tab
              </button>.
            </p>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" className="gradient-primary rounded-lg h-10" disabled={saving}>
                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  actionOnClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel: string;
  actionHref?: string;
  actionOnClick?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-24 h-24 rounded-3xl bg-muted/30 border border-border/40 flex items-center justify-center mb-6 text-muted-foreground/30 shadow-inner">
        <Icon className="w-12 h-12" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>
      <p className="text-muted-foreground max-w-sm mb-10 font-medium leading-relaxed">
        {description}
      </p>
      {actionOnClick ? (
        <Button className="gradient-primary rounded-lg px-8 h-10" onClick={actionOnClick}>
          {actionLabel}
        </Button>
      ) : (
        <Button asChild className="gradient-primary rounded-lg px-8 h-10">
          <Link to={actionHref ?? "#"}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
}

export default Profile;

function StudentIdUploadSection({ onVerified }: { onVerified: (u: any) => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [submitted, setSubmitted] = useState(!!user?.idCardUrl);

  if (user?.verifiedAt) {
    return (
      <Card className="border-success/20 bg-success/5">
        <CardContent className="p-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-success/15 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-success" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Account Verified</p>
            <p className="text-xs text-muted-foreground">Your student ID has been reviewed and your account is verified.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const { uploadDocument } = await import("@/services/documents");
      const { compressImage } = await import("@/lib/image-compress");
      const { updateProfile } = await import("@/services/auth");
      const compressed = await compressImage(file);
      const res = await uploadDocument(compressed, "ID_CARD");
      const idCardUrl = res.data.url;
      const profileRes = await updateProfile({ idCardUrl });
      onVerified(profileRes.data.user);
      setSubmitted(true);
      toast({
        title: "Student ID submitted!",
        description: "An admin will review your ID and verify your account within 24 hours.",
      });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <ShieldAlert className="w-4 h-4 text-primary" />
          {submitted ? "Verification Pending" : "Get Verified"}
        </CardTitle>
        <CardDescription>
          {submitted
            ? "Your student ID has been submitted. An admin will review it and verify your account within 24 hours. You'll be able to see a verified badge on your profile once approved."
            : "Verified students get a trust badge on their profile and may unlock exclusive features. Here's how it works:"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!submitted && (
          <ul className="space-y-2 text-sm text-muted-foreground">
            {[
              { step: "1", text: "Upload a clear photo or scan of your FUTA student ID card or matriculation letter." },
              { step: "2", text: "An admin reviews your submission (usually within 24 hours)." },
              { step: "3", text: "Once approved, a verified badge appears on your profile." },
            ].map(({ step, text }) => (
              <li key={step} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {step}
                </span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        )}

        {submitted ? (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
            <Loader2 className="w-4 h-4 text-warning shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Under review</p>
              <p className="text-xs text-muted-foreground">We'll notify you once your ID is verified. You can re-upload if the wrong file was submitted.</p>
            </div>
          </div>
        ) : null}

        <label className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl transition-colors ${submitted ? "border-border/40 hover:bg-muted/30 cursor-pointer" : "border-primary/30 hover:bg-primary/5 cursor-pointer"}`}>
          {isUploading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading...
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 text-center px-4">
              <Shield className="w-5 h-5 text-primary/60 mb-0.5" />
              <p className="text-sm font-medium text-foreground">
                {submitted ? "Re-upload ID" : "Click to upload your student ID"}
              </p>
              <p className="text-xs text-muted-foreground">FUTA ID card or matriculation letter · PNG, JPG or PDF</p>
            </div>
          )}
          <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleUpload} disabled={isUploading} />
        </label>
      </CardContent>
    </Card>
  );
}

function SuspensionAppealSection() {
  const { toast } = useToast();
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: appealsRes,
    isLoading: appealsLoading,
    refetch,
  } = useQuery({
    queryKey: ["my-appeals"],
    queryFn: () => import("@/services/appeals").then((m) => m.fetchMyAppeals()),
  });

  const appeals = appealsRes?.data || [];
  const hasPendingAppeal = appeals.some((a) => a.status === "PENDING");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 10) {
      toast({
        title: "Error",
        description:
          "Please provide a detailed reason (at least 10 characters).",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await import("@/services/appeals").then((m) => m.submitAppeal(reason));
      toast({
        title: "Appeal Submitted",
        description: "Your appeal has been submitted and is under review.",
      });
      setReason("");
      refetch();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to submit appeal.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-destructive/20 bg-destructive/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-lg font-bold text-destructive">
          <ShieldAlert className="w-5 h-5" />
          Account Suspended
        </CardTitle>
        <CardDescription>
          Your landlord account has been suspended. You can submit an appeal
          below to request reinstatement.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Existing appeals */}
        {appealsLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading appeal history...
          </div>
        ) : (
          appeals.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Appeal History</p>
              {appeals.map((appeal) => (
                <div
                  key={appeal.id}
                  className="p-3 rounded-xl bg-background/80 border border-border/40 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {new Date(appeal.createdAt).toLocaleDateString()}
                    </span>
                    <Badge
                      variant={
                        appeal.status === "APPROVED"
                          ? "success"
                          : appeal.status === "REJECTED"
                            ? "destructive"
                            : "warning"
                      }
                      className="text-[9px]"
                    >
                      {appeal.status}
                    </Badge>
                  </div>
                  <p className="text-sm">{appeal.reason}</p>
                  {appeal.adminNote && (
                    <p className="text-xs text-muted-foreground italic border-t border-border/40 pt-2">
                      Admin response: {appeal.adminNote}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {/* Submit new appeal */}
        {!hasPendingAppeal ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-bold">Reason for Appeal</Label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why you believe your account should be reinstated..."
                className="flex min-h-[120px] w-full rounded-xl border border-border bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                required
              />
            </div>
            <Button
              type="submit"
              className="gradient-primary rounded-lg h-10"
              disabled={isSubmitting || reason.trim().length < 10}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </div>
              ) : (
                "Submit Appeal"
              )}
            </Button>
          </form>
        ) : (
          <div className="p-4 rounded-xl bg-warning/10 border border-warning/20 text-sm text-warning-foreground">
            <p className="font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-warning" />
              Appeal Under Review
            </p>
            <p className="text-muted-foreground mt-1">
              Your appeal is currently being reviewed by our team. We'll update
              your account status once a decision has been made.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DeleteAccountSection() {
  const { logout } = useAuth();
  const { toast } = useToast();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { deleteAccount } = await import("@/services/auth");
      await deleteAccount();
      toast({
        title: "Account deleted",
        description: "Your account has been permanently removed.",
      });
      logout();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete account.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsConfirming(false);
    }
  };

  return (
    <Card className="border-destructive/20 bg-destructive/5">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-destructive/10 text-destructive">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-destructive mb-1">
              Delete Account
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Permanently delete your account and all associated data. This
              action cannot be undone.
            </p>
            {!isConfirming ? (
              <Button
                variant="destructive"
                onClick={() => setIsConfirming(true)}
              >
                Delete my account
              </Button>
            ) : (
              <div className="flex items-center gap-3">
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </div>
                  ) : (
                    "Yes, delete permanently"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsConfirming(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

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
        }),
      );
      toast({
        title: "Success",
        description: "Your password has been changed.",
      });
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
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
      <Card className="border-border/60">
        <CardHeader className="pb-4 border-b border-border/40">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <KeyRound className="w-4 h-4 text-primary" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your password to keep your account secure.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  className="h-10 rounded-lg"
                  value={passwords.currentPassword}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  className="h-10 rounded-lg"
                  value={passwords.newPassword}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  className="h-10 rounded-lg"
                  value={passwords.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="gradient-primary rounded-lg h-10"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                "Update Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <ShieldAlert className="w-4 h-4 text-muted-foreground" />
            Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Two-factor authentication is coming soon.
          </p>
          <Button variant="outline" disabled className="gap-2 h-10 rounded-lg opacity-60">
            Enable 2FA
            <Badge className="ml-1 text-[9px] bg-warning shadow-none border-none text-white">
              Soon
            </Badge>
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

  const {
    data: response,
    isLoading: listLoading,
    refetch,
  } = useQuery({
    queryKey: ["my-maintenance"],
    queryFn: () =>
      import("@/services/maintenance").then((m) =>
        m.fetchMyMaintenanceRequests(),
      ),
  });

  const { data: bookingsResponse } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: () =>
      import("@/services/bookings").then((m) => m.fetchMyBookings()),
  });

  const approvedBookings = (bookingsResponse?.data || []).filter(
    (b) => b.status === "APPROVED",
  );

  const requests = response?.data || [];

  const handleCreateRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const propertyId = formData.get("propertyId") as string;
    const description = formData.get("description") as string;

    if (!propertyId) {
      toast({
        title: "Error",
        description: "Please select a property.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await import("@/services/maintenance").then((m) =>
        m.createMaintenanceRequest({ propertyId, description }),
      );
      toast({
        title: "Request submitted",
        description: "The maintenance team has been notified.",
      });
      setIsFormOpen(false);
      refetch();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-6 mb-6">
        <div>
          <h3 className="text-lg font-semibold">Repair Requests</h3>
          <p className="text-sm text-muted-foreground">
            Report and track issues in your residence.
          </p>
        </div>
        <Button
          className="gradient-primary rounded-lg h-10 gap-2"
          onClick={() => setIsFormOpen(!isFormOpen)}
        >
          {isFormOpen ? (
            <X className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
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
                <Label htmlFor="propertyId">Property</Label>
                {approvedBookings.length > 0 ? (
                  <select
                    id="propertyId"
                    name="propertyId"
                    aria-label="Select a property"
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
                    You need an approved booking to submit a maintenance
                    request.
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
        <div className="py-16 flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading...</span>
        </div>
      ) : requests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests.map((req) => (
            <Card key={req.id} className="border-border/60">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <p className="text-sm font-medium leading-relaxed flex-1">
                    {req.description}
                  </p>
                  <Badge variant="outline" className="shrink-0 text-xs">
                    {req.status.replace("_", " ")}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>#{req.id.slice(0, 8)}</span>
                  <span>{new Date(req.createdAt).toLocaleDateString()}</span>
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
          actionOnClick={() => setIsFormOpen(true)}
        />
      )}
    </div>
  );
}
