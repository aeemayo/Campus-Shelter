import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { fetchProperties, deleteProperty, updatePropertyNotes } from "@/services/properties";
import {
  fetchMyBookings,
  updateBookingStatus,
  type Booking,
} from "@/services/bookings";
import {
  fetchMyMaintenanceRequests,
  updateMaintenanceStatus,
  type MaintenanceRequest,
} from "@/services/maintenance";
import { uploadDocument } from "@/services/documents";
import { compressImage } from "@/lib/image-compress";
import { createLease } from "@/services/leases";
import { toFrontendProperty } from "@/lib/propertyAdapter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Building2,
  CalendarCheck,
  Wrench,
  CheckCircle2,
  XCircle,
  Loader2,
  MapPin,
  ExternalLink,
  Upload,
  TrendingUp,
  Plus,
  AlertCircle,
  Clock,
  ChevronRight,
  Pencil,
  Trash2,
  Mail,
  Phone,
  MessageSquare,
  FileText,
  ChevronDown,
  ChevronUp,
  StickyNote,
  Save,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/lib/status-badge";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";

const LandlordDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("properties");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Fetch landlord's properties
  const { data: propertiesResponse, isLoading: propsLoading } = useQuery({
    queryKey: ["landlord-properties", user?.id],
    queryFn: () => fetchProperties({ landlordId: user?.id, limit: 100 }),
    enabled: isAuthenticated && user?.role === "LANDLORD",
  });

  const myProperties = useMemo(() => {
    if (!propertiesResponse?.data) return [];
    return propertiesResponse.data.map(toFrontendProperty);
  }, [propertiesResponse]);

  // Fetch bookings (role-aware — returns bookings on landlord's properties)
  const { data: bookingsResponse, isLoading: bookingsLoading } = useQuery({
    queryKey: ["landlord-bookings"],
    queryFn: fetchMyBookings,
    enabled: isAuthenticated && user?.role === "LANDLORD",
  });

  const bookings = bookingsResponse?.data || [];

  // Fetch maintenance requests
  const { data: maintenanceResponse, isLoading: maintenanceLoading } = useQuery(
    {
      queryKey: ["landlord-maintenance"],
      queryFn: fetchMyMaintenanceRequests,
      enabled: isAuthenticated && user?.role === "LANDLORD",
    },
  );

  const maintenanceRequests = maintenanceResponse?.data || [];

  // Booking status mutation
  const bookingMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "APPROVED" | "REJECTED";
    }) => updateBookingStatus(id, status),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["landlord-bookings"] });
      toast({
        title:
          vars.status === "APPROVED" ? "Booking Approved" : "Booking Rejected",
        description: `The booking has been ${vars.status.toLowerCase()}.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update booking status.",
        variant: "destructive",
      });
    },
  });

  // Maintenance status mutation
  const maintenanceMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
    }) => updateMaintenanceStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landlord-maintenance"] });
      toast({
        title: "Status Updated",
        description: "Maintenance request status has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive",
      });
    },
  });

  // Delete property mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landlord-properties"] });
      toast({ title: "Property Deleted", description: "The property has been removed." });
      setDeleteTarget(null);
      setDeleteConfirmText("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete property.", variant: "destructive" });
    },
  });

  // Notes editing state
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesText, setNotesText] = useState("");

  const notesMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string | null }) =>
      updatePropertyNotes(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landlord-properties"] });
      toast({ title: "Notes Updated", description: "Property notes have been saved." });
      setEditingNotesId(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update notes.", variant: "destructive" });
    },
  });

  // Calculate statistics
  const stats = useMemo(() => {
    const totalProperties = myProperties.length;
    const pendingBookings = bookings.filter(
      (b) => b.status === "PENDING",
    ).length;
    const totalRevenue = bookings
      .filter((b) => b.status === "APPROVED")
      .reduce((sum, b) => sum + (b.property?.priceMonthly || 0), 0);
    const activeMaintenance = maintenanceRequests.filter(
      (r) => r.status !== "RESOLVED",
    ).length;

    return {
      totalProperties,
      pendingBookings,
      totalRevenue,
      activeMaintenance,
    };
  }, [myProperties, bookings, maintenanceRequests]);

  const bookingDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    bookings.forEach((b) => {
      counts[b.status] = (counts[b.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [bookings]);

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"];

  // Lease upload state
  const [leaseUploadBookingId, setLeaseUploadBookingId] = useState<
    string | null
  >(null);
  const [leaseFile, setLeaseFile] = useState<File | null>(null);
  const [leaseUploading, setLeaseUploading] = useState(false);
  const [leaseGracePeriod, setLeaseGracePeriod] = useState(0);
  const [leaseTerms, setLeaseTerms] = useState("");
  const [leaseDuration, setLeaseDuration] = useState("");

  // Expanded maintenance descriptions
  const [expandedMaintenance, setExpandedMaintenance] = useState<Set<string>>(new Set());

  const handleLeaseUpload = async () => {
    if (!leaseFile || !leaseUploadBookingId) return;
    setLeaseUploading(true);
    try {
      const compressedFile = await compressImage(leaseFile);
      const uploadRes = await uploadDocument(compressedFile, "LEASE");
      await createLease({
        bookingId: leaseUploadBookingId,
        documentUrl: uploadRes.data.url,
        gracePeriodDays: leaseGracePeriod,
        ...(leaseTerms.trim() && { terms: leaseTerms.trim() }),
        ...(leaseDuration.trim() && { duration: leaseDuration.trim() }),
      });
      toast({
        title: "Lease Created",
        description: "Lease document has been uploaded and linked.",
      });
      setLeaseUploadBookingId(null);
      setLeaseFile(null);
      setLeaseGracePeriod(0);
      setLeaseTerms("");
      setLeaseDuration("");
      queryClient.invalidateQueries({ queryKey: ["landlord-bookings"] });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to upload lease.",
        variant: "destructive",
      });
    } finally {
      setLeaseUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO title="Landlord Dashboard" description="Manage your properties, bookings, and tenant communications." path="/landlord" noIndex />
      <Header bgColor="white" />

      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight">
                  Landlord Dashboard
                </h1>
                {user?.landlordStatus && (
                  <Badge
                    variant={
                      user.landlordStatus === "VERIFIED"
                        ? "success"
                        : user.landlordStatus === "REJECTED" ||
                            user.landlordStatus === "SUSPENDED"
                          ? "destructive"
                          : "warning"
                    }
                    className="h-6"
                  >
                    {user.landlordStatus}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-sm md:text-base">
                Manage your properties, bookings, and maintenance requests.
              </p>
            </div>
            <Button
              asChild
              disabled={user?.landlordStatus !== "VERIFIED"}
              className="gradient-primary hidden md:inline-flex"
            >
              <Link to="/properties/add">
                <Building2 className="w-4 h-4 mr-2" />
                Add Property
              </Link>
            </Button>
          </div>

          {user?.landlordStatus !== "VERIFIED" && (
            <Card
              className={`mb-6 md:mb-8 border-2 ${user?.landlordStatus === "REJECTED" || user?.landlordStatus === "SUSPENDED" ? "border-destructive/30 bg-destructive/5" : "border-warning/30 bg-warning/5"}`}
            >
              <CardContent className="p-4 md:p-6">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-xl shrink-0 ${user?.landlordStatus === "REJECTED" || user?.landlordStatus === "SUSPENDED" ? "bg-destructive/10" : "bg-warning/10"}`}
                  >
                    {user?.landlordStatus === "REJECTED" ||
                    user?.landlordStatus === "SUSPENDED" ? (
                      <AlertCircle className="w-5 h-5 text-destructive" />
                    ) : (
                      <Clock className="w-5 h-5 text-warning" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm md:text-base mb-1">
                      Account{" "}
                      {user?.landlordStatus === "REJECTED"
                        ? "Verification Rejected"
                        : user?.landlordStatus === "SUSPENDED"
                          ? "Suspended"
                          : "Pending Verification"}
                    </p>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {user?.landlordStatus === "REJECTED"
                        ? "Your verification was rejected. Please contact support."
                        : user?.landlordStatus === "SUSPENDED"
                          ? "Your account has been suspended. Visit your profile to submit an appeal."
                          : "Your account is being reviewed. You can list properties once verified."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-border/40 bg-background/60 backdrop-blur-md shadow-primary-md overflow-hidden relative group hover:shadow-primary-lg transition-all duration-300">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                <CardHeader className="pb-1 p-3 md:p-6 md:pb-1">
                  <CardDescription className="font-medium text-xs md:text-sm">
                    Total Properties
                  </CardDescription>
                  <CardTitle className="text-2xl md:text-3xl font-bold font-display">
                    {stats.totalProperties}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                  <div className="text-[10px] md:text-xs text-muted-foreground flex items-center gap-1.5 py-1">
                    <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                      <TrendingUp className="w-2.5 h-2.5 md:w-3 md:h-3 text-success" />
                    </div>
                    <span className="font-medium text-success">Active</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-border/40 bg-background/60 backdrop-blur-md shadow-primary-md overflow-hidden relative group hover:shadow-primary-lg transition-all duration-300">
                <div className="absolute top-0 left-0 w-1 h-full bg-warning" />
                <CardHeader className="pb-1 p-3 md:p-6 md:pb-1">
                  <CardDescription className="font-medium text-xs md:text-sm">
                    Pending Bookings
                  </CardDescription>
                  <CardTitle className="text-2xl md:text-3xl font-bold font-display">
                    {stats.pendingBookings}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                  <div className="text-[10px] md:text-xs text-muted-foreground font-medium py-1">
                    Needs attention
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-border/40 bg-background/60 backdrop-blur-md shadow-primary-md overflow-hidden relative group hover:shadow-primary-lg transition-all duration-300">
                <div className="absolute top-0 left-0 w-1 h-full bg-success" />
                <CardHeader className="pb-1 p-3 md:p-6 md:pb-1">
                  <CardDescription className="font-medium text-xs md:text-sm">
                    Annual Revenue
                  </CardDescription>
                  <CardTitle className="text-xl md:text-3xl font-bold font-display text-success">
                    ₦{stats.totalRevenue.toLocaleString()}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                  <div className="text-[10px] md:text-xs text-muted-foreground font-medium py-1">
                    Approved bookings
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-border/40 bg-background/60 backdrop-blur-md shadow-primary-md overflow-hidden relative group hover:shadow-primary-lg transition-all duration-300">
                <div className="absolute top-0 left-0 w-1 h-full bg-destructive" />
                <CardHeader className="pb-1 p-3 md:p-6 md:pb-1">
                  <CardDescription className="font-medium text-xs md:text-sm">
                    Maintenance
                  </CardDescription>
                  <CardTitle className="text-2xl md:text-3xl font-bold font-display">
                    {stats.activeMaintenance}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                  <div className="text-[10px] md:text-xs text-muted-foreground font-medium py-1">
                    Active requests
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            <Card className="lg:col-span-2 border-border/40 bg-background/60 backdrop-blur-md shadow-primary-md">
              <CardHeader>
                <CardTitle className="text-xl font-bold font-display tracking-tight">
                  Bookings Overview
                </CardTitle>
                <CardDescription>
                  Status distribution of all requests
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] pt-4">
                {bookings.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={bookingDistribution}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#E2E8F0"
                      />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        fontSize={12}
                        tick={{ fill: "#64748B" }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        fontSize={12}
                        tick={{ fill: "#64748B" }}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(136, 132, 216, 0.05)" }}
                        contentStyle={{
                          borderRadius: "12px",
                          border: "1px solid rgba(226, 232, 240, 0.4)",
                          backgroundColor: "rgba(255, 255, 255, 0.9)",
                          backdropFilter: "blur(8px)",
                          boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                        }}
                      />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                        {bookingDistribution.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/20 rounded-xl">
                    <CalendarCheck className="w-12 h-12 mb-3 opacity-20" />
                    <p className="font-medium">No booking data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/40 bg-background/60 backdrop-blur-md shadow-primary-md">
              <CardHeader>
                <CardTitle className="text-xl font-bold font-display tracking-tight">
                  Recent Activities
                </CardTitle>
                <CardDescription>
                  Latest updates on your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  {bookings.slice(0, 3).map((b, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-4 p-2 rounded-xl hover:bg-muted/30 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                        <CalendarCheck className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="font-semibold text-sm leading-none">
                          New booking request
                        </p>
                        <p className="text-xs text-muted-foreground">
                          For {b.property?.title}
                        </p>
                      </div>
                    </div>
                  ))}
                  {maintenanceRequests.slice(0, 2).map((r, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-4 p-2 rounded-xl hover:bg-muted/30 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0 group-hover:bg-destructive/20 transition-colors">
                        <Wrench className="w-5 h-5 text-destructive" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="font-semibold text-sm leading-none">
                          Maintenance request
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {r.description}
                        </p>
                      </div>
                    </div>
                  ))}
                  {bookings.length === 0 &&
                    maintenanceRequests.length === 0 && (
                      <div className="text-center py-12 flex flex-col items-center">
                        <TrendingUp className="w-10 h-10 mb-2 opacity-10" />
                        <p className="text-sm text-muted-foreground">
                          No recent activity
                        </p>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4 md:space-y-6"
          >
            <TabsList className="bg-muted/50 p-1 w-full md:w-auto grid grid-cols-4 md:inline-flex">
              <TabsTrigger
                value="properties"
                className="gap-1.5 md:gap-2 text-xs md:text-sm px-2 md:px-4"
              >
                <Building2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span>Properties</span>
              </TabsTrigger>
              <TabsTrigger
                value="bookings"
                className="gap-1.5 md:gap-2 text-xs md:text-sm px-2 md:px-4"
              >
                <CalendarCheck className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span>Bookings</span>
              </TabsTrigger>
              <TabsTrigger
                value="tenants"
                className="gap-1.5 md:gap-2 text-xs md:text-sm px-2 md:px-4"
              >
                <Users className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span>Tenants</span>
              </TabsTrigger>
              <TabsTrigger
                value="maintenance"
                className="gap-1.5 md:gap-2 text-xs md:text-sm px-2 md:px-4"
              >
                <Wrench className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span>Repairs</span>
              </TabsTrigger>
            </TabsList>

            {/* ── Properties Tab ── */}
            <TabsContent value="properties" className="space-y-6 outline-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-border/40 bg-background/60 backdrop-blur-md shadow-primary-md overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl font-bold font-display tracking-tight">
                      My Properties
                    </CardTitle>
                    <CardDescription>
                      View and manage your active property listings.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-0">
                    {propsLoading ? (
                      <div className="py-24 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-10 h-10 animate-spin text-primary opacity-50" />
                        <p className="text-sm font-medium text-muted-foreground">
                          Loading properties...
                        </p>
                      </div>
                    ) : myProperties.length > 0 ? (
                      <>
                        {/* Mobile card layout */}
                        <div className="md:hidden divide-y divide-border/40">
                          {myProperties.map((property) => (
                            <Link
                              key={property.id}
                              to={`/properties/${property.id}`}
                              className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors active:bg-muted/50"
                            >
                              <div className="w-14 h-14 rounded-xl bg-muted overflow-hidden shadow-sm ring-1 ring-border/50 shrink-0">
                                <img
                                  src={
                                    property.images?.[0] ||
                                    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=100&q=80"
                                  }
                                  alt={property.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <p className="font-bold text-sm tracking-tight truncate">
                                    {property.title}
                                  </p>
                                  {property.status === "APPROVED" ||
                                  property.approved ? (
                                    <Badge
                                      variant="success"
                                      className="px-1.5 py-0 font-bold text-[9px] uppercase shrink-0"
                                    >
                                      Live
                                    </Badge>
                                  ) : property.status === "REJECTED" ? (
                                    <Badge
                                      variant="destructive"
                                      className="px-1.5 py-0 font-bold text-[9px] uppercase shrink-0"
                                    >
                                      Rejected
                                    </Badge>
                                  ) : (
                                    <Badge
                                      variant="warning"
                                      className="px-1.5 py-0 font-bold text-[9px] uppercase shrink-0"
                                    >
                                      Pending
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                                  <MapPin className="w-3 h-3 text-primary" />
                                  {property.location}
                                </p>
                                <p className="font-bold text-sm text-primary">
                                  ₦{property.priceMonthly?.toLocaleString()}
                                  <span className="text-[10px] text-muted-foreground font-normal">
                                    /yr
                                  </span>
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  {(property.inspectionSlots?.length ?? 0) > 0 ? (
                                    <p className="text-[10px] text-primary/70 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {property.inspectionSlots!.length} slot{property.inspectionSlots!.length !== 1 ? "s" : ""}
                                    </p>
                                  ) : (
                                    <p className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      No slots
                                    </p>
                                  )}
                                  {property.notes && (
                                    <p className="text-[10px] text-primary/70 flex items-center gap-1">
                                      <StickyNote className="w-3 h-3" />
                                      Has notes
                                    </p>
                                  )}
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                            </Link>
                          ))}
                        </div>

                        {/* Desktop table layout */}
                        <div className="hidden md:block overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-border/40 text-muted-foreground/70 bg-muted/30">
                                <th className="text-left font-semibold py-4 px-6 uppercase tracking-wider text-[10px]">
                                  Property Details
                                </th>
                                <th className="text-left font-semibold py-4 px-6 uppercase tracking-wider text-[10px]">
                                  Annual Price
                                </th>
                                <th className="text-left font-semibold py-4 px-6 uppercase tracking-wider text-[10px]">
                                  Status
                                </th>
                                <th className="text-left font-semibold py-4 px-6 uppercase tracking-wider text-[10px]">
                                  Inspection Slots
                                </th>
                                <th className="text-right font-semibold py-4 px-6 uppercase tracking-wider text-[10px]">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                              {myProperties.map((property) => (
                                <React.Fragment key={property.id}>
                                <tr
                                  className="hover:bg-muted/40 transition-all duration-200 group"
                                >
                                  <td className="py-4 px-6">
                                    <div className="flex items-center gap-4">
                                      <div className="w-14 h-14 rounded-xl bg-muted overflow-hidden shadow-sm group-hover:shadow-md transition-shadow ring-1 ring-border/50">
                                        <img
                                          src={
                                            property.images?.[0] ||
                                            "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=100&q=80"
                                          }
                                          alt={property.title}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                      </div>
                                      <div className="space-y-0.5">
                                        <p className="font-bold text-base tracking-tight">
                                          {property.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                          <MapPin className="w-3.5 h-3.5 text-primary" />
                                          {property.location}
                                        </p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-4 px-6">
                                    <div className="space-y-0.5">
                                      <p className="font-bold text-foreground">
                                        ₦
                                        {property.priceMonthly?.toLocaleString()}
                                      </p>
                                      <p className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">
                                        Per Year
                                      </p>
                                    </div>
                                  </td>
                                  <td className="py-4 px-6">
                                    {property.status === "APPROVED" ||
                                    property.approved ? (
                                      <Badge
                                        variant="success"
                                        className="px-3 py-1 font-bold text-[10px] uppercase tracking-wide"
                                      >
                                        Approved
                                      </Badge>
                                    ) : property.status === "REJECTED" ? (
                                      <Badge
                                        variant="destructive"
                                        className="px-3 py-1 font-bold text-[10px] uppercase tracking-wide"
                                      >
                                        Rejected
                                      </Badge>
                                    ) : (
                                      <Badge
                                        variant="warning"
                                        className="px-3 py-1 font-bold text-[10px] uppercase tracking-wide"
                                      >
                                        Pending Review
                                      </Badge>
                                    )}
                                  </td>
                                  <td className="py-4 px-6">
                                    {(property.inspectionSlots?.length ?? 0) > 0 ? (
                                      <div className="flex items-center gap-1.5 text-primary/80">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span className="text-xs font-medium">
                                          {property.inspectionSlots!.length} slot{property.inspectionSlots!.length !== 1 ? "s" : ""}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-xs text-muted-foreground/60 flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        None set
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-4 px-6 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        asChild
                                        className="rounded-xl border-border/60 hover:border-primary/40 hover:bg-primary/5"
                                      >
                                        <Link to={`/properties/${property.id}`}>
                                          <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                                          View
                                        </Link>
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className={`rounded-xl border-border/60 hover:border-primary/40 hover:bg-primary/5 ${editingNotesId === property.id ? "bg-primary/5 border-primary/40" : ""}`}
                                        onClick={() => {
                                          if (editingNotesId === property.id) {
                                            setEditingNotesId(null);
                                          } else {
                                            setEditingNotesId(property.id);
                                            setNotesText(property.notes ?? "");
                                          }
                                        }}
                                      >
                                        <StickyNote className="w-3.5 h-3.5 mr-1.5" />
                                        Notes
                                      </Button>
                                      {user?.landlordStatus === "VERIFIED" && (
                                        <>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            asChild
                                            className="rounded-xl border-border/60 hover:border-primary/40 hover:bg-primary/5"
                                          >
                                            <Link to={`/properties/edit/${property.id}`}>
                                              <Pencil className="w-3.5 h-3.5 mr-1.5" />
                                              Edit
                                            </Link>
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="rounded-xl border-destructive/30 text-destructive hover:bg-destructive/5 hover:border-destructive/60"
                                            onClick={() => {
                                              setDeleteTarget({ id: property.id, title: property.title });
                                              setDeleteConfirmText("");
                                            }}
                                          >
                                            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                                            Delete
                                          </Button>
                                        </>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                                {editingNotesId === property.id && (
                                  <tr>
                                    <td colSpan={5} className="px-6 py-4 bg-muted/20 border-b border-border/40">
                                      <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                          <StickyNote className="w-4 h-4 text-primary" />
                                          <span className="text-sm font-bold">Landlord Notes</span>
                                          <span className="text-[10px] text-muted-foreground bg-muted/50 rounded-full px-2 py-0.5">Visible to students</span>
                                        </div>
                                        <Textarea
                                          value={notesText}
                                          onChange={(e) => setNotesText(e.target.value)}
                                          placeholder="Add notes for tenants — e.g. generator schedule, house rules, caretaker contact..."
                                          className="min-h-[80px] rounded-xl bg-background/80 border-border/60 text-sm"
                                          maxLength={2000}
                                        />
                                        <div className="flex items-center justify-between">
                                          <span className="text-[11px] text-muted-foreground">{notesText.length}/2000</span>
                                          <div className="flex items-center gap-2">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => setEditingNotesId(null)}
                                              className="rounded-lg text-xs"
                                            >
                                              Cancel
                                            </Button>
                                            <Button
                                              size="sm"
                                              className="gradient-primary rounded-lg text-xs"
                                              disabled={notesMutation.isPending}
                                              onClick={() => notesMutation.mutate({ id: property.id, notes: notesText.trim() || null })}
                                            >
                                              {notesMutation.isPending ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                                              ) : (
                                                <Save className="w-3.5 h-3.5 mr-1.5" />
                                              )}
                                              Save Notes
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                                </React.Fragment>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    ) : (
                      <div className="py-16 md:py-24 text-center px-4">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
                          <Building2 className="w-8 h-8 md:w-10 md:h-10 text-muted-foreground/40" />
                        </div>
                        <p className="font-bold text-lg md:text-xl font-display mb-1">
                          No properties yet
                        </p>
                        <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-6">
                          Start listing your properties to receive booking
                          requests.
                        </p>
                        {user?.landlordStatus === "VERIFIED" ? (
                          <Button
                            asChild
                            className="gradient-primary rounded-full px-6 md:px-8 h-11"
                          >
                            <Link to="/properties/add">
                              <Plus className="w-4 h-4 mr-2" />
                              Add Your First Property
                            </Link>
                          </Button>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Complete verification to start listing properties.
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* ── Bookings Tab ── */}
            <TabsContent value="bookings" className="space-y-6 outline-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-border/40 bg-background/60 backdrop-blur-md shadow-primary-md">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold font-display tracking-tight">
                      Booking Requests
                    </CardTitle>
                    <CardDescription>
                      Review and manage booking requests from students.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    {bookingsLoading ? (
                      <div className="py-24 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-10 h-10 animate-spin text-primary opacity-50" />
                        <p className="text-sm font-medium text-muted-foreground">
                          Loading requests...
                        </p>
                      </div>
                    ) : bookings.length > 0 ? (
                      <div className="space-y-3 md:space-y-4">
                        {bookings.map((booking) => (
                          <div
                            key={booking.id}
                            className="group flex flex-col gap-4 md:gap-6 p-4 md:p-6 rounded-2xl border border-border/40 hover:border-primary/30 hover:bg-muted/30 transition-all duration-300"
                          >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                              <div className="flex-1 space-y-2 md:space-y-3">
                                <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                                  <div className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-primary/5 text-primary">
                                    <Building2 className="w-4 h-4 md:w-5 md:h-5" />
                                  </div>
                                  <p className="font-bold text-base md:text-lg tracking-tight">
                                    {booking.property?.title || "Property"}
                                  </p>
                                  <StatusBadge status={booking.status} />
                                </div>

                                {/* Student contact info */}
                                {booking.student && (
                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pl-0 md:pl-1">
                                    <span className="font-semibold text-foreground">
                                      {booking.student.name}
                                    </span>
                                    <a
                                      href={`mailto:${booking.student.email}`}
                                      className="flex items-center gap-1 hover:text-primary transition-colors"
                                    >
                                      <Mail className="w-3 h-3" />
                                      {booking.student.email}
                                    </a>
                                    {booking.student.phone && (
                                      <a
                                        href={`tel:${booking.student.phone}`}
                                        className="flex items-center gap-1 hover:text-primary transition-colors"
                                      >
                                        <Phone className="w-3 h-3" />
                                        {booking.student.phone}
                                      </a>
                                    )}
                                    <Link
                                      to={`/messages/${booking.student.id}`}
                                      className="flex items-center gap-1 hover:text-primary transition-colors"
                                    >
                                      <MessageSquare className="w-3 h-3" />
                                      Message
                                    </Link>
                                  </div>
                                )}

                                <div className="flex flex-wrap gap-x-4 md:gap-x-6 gap-y-1.5 md:gap-y-2 text-xs md:text-sm text-muted-foreground font-medium">
                                  <div className="flex items-center gap-1.5">
                                    <CalendarCheck className="w-3.5 h-3.5 text-primary/60" />
                                    <span>
                                      {new Date(
                                        booking.leaseStart,
                                      ).toLocaleDateString()}{" "}
                                      –{" "}
                                      {new Date(
                                        booking.leaseEnd,
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/60">
                                      Requested
                                    </span>
                                    <span>
                                      {new Date(
                                        booking.createdAt,
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Desktop actions */}
                              <div className="hidden md:flex items-center gap-3">
                                {booking.status === "PENDING" && (
                                  <>
                                    <Button
                                      size="sm"
                                      className="bg-success hover:bg-success/90 text-success-foreground rounded-xl px-5 h-11"
                                      disabled={bookingMutation.isPending}
                                      onClick={() =>
                                        bookingMutation.mutate({
                                          id: booking.id,
                                          status: "APPROVED",
                                        })
                                      }
                                    >
                                      <CheckCircle2 className="w-4 h-4 mr-2" />
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      className="rounded-xl px-5 h-11"
                                      disabled={bookingMutation.isPending}
                                      onClick={() =>
                                        bookingMutation.mutate({
                                          id: booking.id,
                                          status: "REJECTED",
                                        })
                                      }
                                    >
                                      <XCircle className="w-4 h-4 mr-2" />
                                      Reject
                                    </Button>
                                  </>
                                )}
                                {booking.status === "APPROVED" && (
                                  booking.lease ? (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="rounded-xl px-5 h-11 border-primary/20 hover:bg-primary/5 text-primary"
                                      asChild
                                    >
                                      <a href={booking.lease.documentUrl} target="_blank" rel="noopener noreferrer">
                                        <FileText className="w-4 h-4 mr-2" />
                                        View Lease
                                      </a>
                                    </Button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="rounded-xl px-5 h-11 border-primary/20 hover:bg-primary/5 text-primary"
                                      onClick={() =>
                                        setLeaseUploadBookingId(booking.id)
                                      }
                                    >
                                      <Upload className="w-4 h-4 mr-2" />
                                      Upload Lease
                                    </Button>
                                  )
                                )}
                              </div>
                            </div>

                            {/* Mobile actions - full width */}
                            <div className="md:hidden">
                              {booking.status === "PENDING" && (
                                <div className="grid grid-cols-2 gap-2">
                                  <Button
                                    size="sm"
                                    className="bg-success hover:bg-success/90 text-success-foreground rounded-xl h-11 w-full"
                                    disabled={bookingMutation.isPending}
                                    onClick={() =>
                                      bookingMutation.mutate({
                                        id: booking.id,
                                        status: "APPROVED",
                                      })
                                    }
                                  >
                                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="rounded-xl h-11 w-full"
                                    disabled={bookingMutation.isPending}
                                    onClick={() =>
                                      bookingMutation.mutate({
                                        id: booking.id,
                                        status: "REJECTED",
                                      })
                                    }
                                  >
                                    <XCircle className="w-4 h-4 mr-1.5" />
                                    Reject
                                  </Button>
                                </div>
                              )}
                              {booking.status === "APPROVED" && (
                                booking.lease ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="rounded-xl h-11 w-full border-primary/20 hover:bg-primary/5 text-primary"
                                    asChild
                                  >
                                    <a href={booking.lease.documentUrl} target="_blank" rel="noopener noreferrer">
                                      <FileText className="w-4 h-4 mr-1.5" />
                                      View Lease
                                    </a>
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="rounded-xl h-11 w-full border-primary/20 hover:bg-primary/5 text-primary"
                                    onClick={() =>
                                      setLeaseUploadBookingId(booking.id)
                                    }
                                  >
                                    <Upload className="w-4 h-4 mr-1.5" />
                                    Upload Lease
                                  </Button>
                                )
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-24 text-center">
                        <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4 text-muted-foreground/40 font-display text-4xl font-bold">
                          !
                        </div>
                        <p className="font-bold text-xl font-display mb-1">
                          No requests yet
                        </p>
                        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                          Booking requests from interested students will appear
                          here.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Lease Upload Dialog - Enhanced */}
              {leaseUploadBookingId && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="border-primary/20 bg-primary/5 backdrop-blur-sm shadow-primary-md overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                    <CardHeader>
                      <CardTitle className="text-xl font-bold font-display tracking-tight text-primary">
                        Upload Lease Document
                      </CardTitle>
                      <CardDescription>
                        Upload a completed lease agreement for booking #
                        {leaseUploadBookingId.slice(0, 8)}…
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 relative">
                      <div className="space-y-3">
                        <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
                          Lease Document (PDF)
                        </Label>
                        <div className="group relative">
                          <Input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            className="h-20 cursor-pointer opacity-0 absolute inset-0 z-10"
                            onChange={(e) =>
                              setLeaseFile(e.target.files?.[0] || null)
                            }
                          />
                          <div
                            className={`h-20 border-2 border-dashed rounded-2xl flex items-center justify-center transition-all duration-300 ${leaseFile ? "bg-success/5 border-success/30" : "bg-background/50 border-primary/10 group-hover:border-primary/30"}`}
                          >
                            {leaseFile ? (
                              <div className="flex items-center gap-3 text-success">
                                <CheckCircle2 className="w-6 h-6" />
                                <span className="font-bold">
                                  {leaseFile.name}
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-1 text-muted-foreground">
                                <Upload className="w-6 h-6 opacity-40 mb-1" />
                                <span className="font-medium">
                                  Drop your lease file here or{" "}
                                  <span className="text-primary">
                                    click to browse
                                  </span>
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          className="gradient-primary rounded-xl px-8 h-12 shadow-md shadow-primary/20"
                          disabled={!leaseFile || leaseUploading}
                          onClick={handleLeaseUpload}
                        >
                          {leaseUploading ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Uploading...</span>
                            </div>
                          ) : (
                            "Finalize & Send Lease"
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          className="rounded-xl px-8 h-12"
                          onClick={() => {
                            setLeaseUploadBookingId(null);
                            setLeaseFile(null);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </TabsContent>

            {/* ── Maintenance Tab ── */}
            <TabsContent value="maintenance" className="space-y-6 outline-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-border/40 bg-background/60 backdrop-blur-md shadow-primary-md">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold font-display tracking-tight">
                      Maintenance Requests
                    </CardTitle>
                    <CardDescription>
                      View and update maintenance requests from tenants.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    {maintenanceLoading ? (
                      <div className="py-24 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-10 h-10 animate-spin text-primary opacity-50" />
                        <p className="text-sm font-medium text-muted-foreground">
                          Loading requests...
                        </p>
                      </div>
                    ) : maintenanceRequests.length > 0 ? (
                      <div className="space-y-3 md:space-y-4">
                        {maintenanceRequests.map((req) => (
                          <div
                            key={req.id}
                            className="group flex flex-col gap-3 md:gap-6 p-4 md:p-6 rounded-2xl border border-border/40 hover:border-primary/30 hover:bg-muted/30 transition-all duration-300"
                          >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-6">
                              <div className="flex-1 space-y-2 md:space-y-3">
                                <div className="flex items-start gap-2 md:gap-3">
                                  <div className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-destructive/5 text-destructive shrink-0 mt-0.5">
                                    <Wrench className="w-4 h-4 md:w-5 md:h-5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                      <p className="font-bold text-sm md:text-base tracking-tight leading-snug">
                                        {expandedMaintenance.has(req.id)
                                          ? req.description
                                          : req.description.slice(0, 80) + (req.description.length > 80 ? "…" : "")}
                                      </p>
                                      <Badge
                                        variant="outline"
                                        className="px-2 md:px-3 py-0.5 font-bold text-[9px] md:text-[10px] uppercase tracking-wide border-primary/20 bg-primary/5 text-primary italic shrink-0"
                                      >
                                        {req.status.replace("_", " ")}
                                      </Badge>
                                    </div>
                                    {req.description.length > 80 && (
                                      <button
                                        type="button"
                                        className="text-xs text-primary hover:underline flex items-center gap-0.5 mt-1"
                                        onClick={() =>
                                          setExpandedMaintenance((prev) => {
                                            const next = new Set(prev);
                                            next.has(req.id) ? next.delete(req.id) : next.add(req.id);
                                            return next;
                                          })
                                        }
                                      >
                                        {expandedMaintenance.has(req.id)
                                          ? <><ChevronUp className="w-3 h-3" /> Show less</>
                                          : <><ChevronDown className="w-3 h-3" /> Read more</>}
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground font-medium pl-8 md:pl-0">
                                  {req.property && (
                                    <div className="flex items-center gap-1.5">
                                      <Building2 className="w-3 h-3 text-primary/60" />
                                      <span>{req.property.title}</span>
                                    </div>
                                  )}
                                  {req.student && (
                                    <>
                                      <span className="font-semibold text-foreground">
                                        {req.student.name}
                                      </span>
                                      <Link
                                        to={`/messages/${req.student.id}`}
                                        className="flex items-center gap-1 hover:text-primary transition-colors"
                                      >
                                        <MessageSquare className="w-3 h-3" />
                                        Message tenant
                                      </Link>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="md:self-end">
                              <select
                                value={req.status}
                                onChange={(e) =>
                                  maintenanceMutation.mutate({
                                    id: req.id,
                                    status: e.target.value as
                                      | "OPEN"
                                      | "IN_PROGRESS"
                                      | "RESOLVED",
                                  })
                                }
                                disabled={maintenanceMutation.isPending}
                                className="flex h-10 md:h-11 w-full md:w-[160px] rounded-xl border border-border/60 bg-background/50 backdrop-blur-sm px-3 md:px-4 py-2 text-sm font-bold ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 appearance-none cursor-pointer hover:border-primary/40 transition-all shadow-sm"
                              >
                                <option value="OPEN">🔴 Open</option>
                                <option value="IN_PROGRESS">
                                  🟡 In Progress
                                </option>
                                <option value="RESOLVED">🟢 Resolved</option>
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-24 text-center">
                        <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
                          <Wrench className="w-10 h-10 text-muted-foreground/40" />
                        </div>
                        <p className="font-bold text-xl font-display mb-1">
                          Clear skies!
                        </p>
                        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                          No maintenance requests reported for your properties
                          at the moment.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />

      {/* Delete confirmation dialog */}
      {(() => {
        const activeBookings = deleteTarget
          ? bookings.filter(
              (b) =>
                b.propertyId === deleteTarget.id &&
                (b.status === "PENDING" || b.status === "APPROVED"),
            )
          : [];
        const hasActiveBookings = activeBookings.length > 0;

        return (
          <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) { setDeleteTarget(null); setDeleteConfirmText(""); } }}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-destructive">Delete Property</DialogTitle>
                <DialogDescription>
                  {hasActiveBookings
                    ? "This property has active bookings and cannot be deleted until they are resolved."
                    : "This action cannot be undone. Type the property name to confirm deletion."}
                </DialogDescription>
              </DialogHeader>
              {hasActiveBookings ? (
                <div className="space-y-3 py-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Property: <span className="text-foreground font-bold">"{deleteTarget?.title}"</span>
                  </p>
                  <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 space-y-1">
                    <p className="text-sm font-semibold text-warning-foreground">
                      {activeBookings.length} active booking{activeBookings.length > 1 ? "s" : ""} pending
                    </p>
                    <p className="text-xs text-muted-foreground">
                      You must settle all pending and approved bookings with students before deleting this property. Go to the Bookings tab to reject or resolve them.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 py-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Property: <span className="text-foreground font-bold">"{deleteTarget?.title}"</span>
                  </p>
                  <Input
                    placeholder={`Type "${deleteTarget?.title}" to confirm`}
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                  />
                </div>
              )}
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => { setDeleteTarget(null); setDeleteConfirmText(""); }}>
                  {hasActiveBookings ? "Close" : "Cancel"}
                </Button>
                {!hasActiveBookings && (
                  <Button
                    variant="destructive"
                    disabled={deleteConfirmText !== deleteTarget?.title || deleteMutation.isPending}
                    onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
                  >
                    {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                    Delete Property
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}

      {/* Mobile FAB - Add Property */}
      {user?.landlordStatus === "VERIFIED" && (
        <Link
          to="/properties/add"
          className="md:hidden fixed bottom-6 right-4 z-40 gradient-primary text-white rounded-full w-14 h-14 flex items-center justify-center shadow-xl shadow-primary/30 active:scale-95 transition-transform"
          aria-label="Add Property"
        >
          <Plus className="w-6 h-6" />
        </Link>
      )}
    </div>
  );
};

export default LandlordDashboard;
