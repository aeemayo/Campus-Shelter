import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useProperties } from "@/hooks/use-properties";
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
import {
  Building2,
  Users,
  FileText,
  Plus,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Search,
  LayoutDashboard,
  Filter,
  MoreVertical,
  MapPin,
  Save,
  Trash2,
  Loader2,
  DollarSign,
  TrendingUp,
  CalendarCheck,
  Flag,
  ShieldAlert,
  UserX,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  adminApproveProperty,
  adminDeleteProperty,
  adminVerifyLandlord,
  adminFlagUser,
  adminDeleteUser,
  fetchAdminAnalytics,
  fetchAdminUsers,
} from "@/services/properties";
import { useToast } from "@/components/ui/use-toast";
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

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("properties");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all properties
  const { data: apiResponse, refetch } = useProperties({ limit: 100 });

  const properties = useMemo(() => {
    if (!apiResponse?.data) return [];
    return apiResponse.data.map(toFrontendProperty);
  }, [apiResponse]);

  const filteredProperties = properties.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleApprove = async (id: string, approved: boolean) => {
    try {
      // Use the new status-based approval
      await adminApproveProperty(id, approved ? "APPROVED" : "REJECTED");
      toast({
        title: approved ? "Property Approved" : "Property Rejected",
        description: `The property listing has been ${approved ? "approved" : "rejected"} successfully.`,
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update property status.",
        variant: "destructive",
      });
    }
  };

<<<<<<< HEAD
  const handleVerifyLandlord = async (
    id: string,
    status: "VERIFIED" | "REJECTED" | "SUSPENDED",
  ) => {
    try {
      await adminVerifyLandlord(id, status);
      const labels: Record<string, string> = {
        VERIFIED: "Verified",
        REJECTED: "Rejected",
        SUSPENDED: "Suspended",
      };
=======
  const handleVerifyLandlord = async (id: string, status: "VERIFIED" | "REJECTED" | "SUSPENDED", suspensionReason?: string) => {
    try {
      await adminVerifyLandlord(id, status, suspensionReason);
      const labels: Record<string, string> = { VERIFIED: "Verified", REJECTED: "Rejected", SUSPENDED: "Suspended" };
>>>>>>> 4a6035fb1fcfa172f9c32935c26a029c8ee0b7aa
      toast({
        title: `Landlord ${labels[status]}`,
        description: `The landlord account has been ${status.toLowerCase()} successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to update landlord status.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this property? This action cannot be undone.",
      )
    )
      return;
    try {
      await adminDeleteProperty(id);
      toast({
        title: "Property Deleted",
        description: "The property has been removed.",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete property.",
        variant: "destructive",
      });
    }
  };

  const handleFlagUser = async (id: string, flagged: boolean) => {
    try {
      await adminFlagUser(id, flagged);
      toast({
        title: flagged ? "Account Flagged" : "Flag Removed",
        description: `The user account has been ${flagged ? "flagged" : "unflagged"}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this user account? This action cannot be undone.",
      )
    )
      return;
    try {
      await adminDeleteUser(id);
      toast({
        title: "Account Deleted",
        description: "The user account has been removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header bgColor="white" />

      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-8 md:mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-2xl md:text-4xl font-display font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground mt-1 md:mt-2 font-medium text-sm md:text-base">
                Manage properties, landlords, and platform integrity.
              </p>
            </motion.div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6 md:space-y-8"
          >
            <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
              <TabsList className="bg-muted/50 backdrop-blur-md p-1 md:p-1.5 rounded-xl md:rounded-2xl h-auto border border-border/40 inline-flex w-full md:w-auto">
                <TabsTrigger
                  value="properties"
                  className="gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold text-xs md:text-sm flex-1 md:flex-none"
                >
                  <Building2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Properties</span>
                  <span className="sm:hidden">Props</span>
                </TabsTrigger>
                <TabsTrigger
                  value="landlords"
                  className="gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold text-xs md:text-sm flex-1 md:flex-none"
                >
                  <Users className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  Landlords
                </TabsTrigger>
                <TabsTrigger
                  value="users"
                  className="gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold text-xs md:text-sm flex-1 md:flex-none"
                >
                  <ShieldAlert className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Users</span>
                  <span className="sm:hidden">Users</span>
                </TabsTrigger>
                <TabsTrigger
                  value="documents"
                  className="gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold text-xs md:text-sm flex-1 md:flex-none"
                >
                  <FileText className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  Docs
                </TabsTrigger>
                <TabsTrigger
                  value="appeals"
                  className="gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold text-xs md:text-sm flex-1 md:flex-none"
                >
                  <ShieldAlert className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  Appeals
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold text-xs md:text-sm flex-1 md:flex-none"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Analytics</span>
                  <span className="sm:hidden">Stats</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <AnimatePresence mode="wait">
              <TabsContent value="properties" className="mt-0 outline-none">
                <motion.div
                  key="properties-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="border-border/40 bg-background/60 backdrop-blur-md shadow-primary-md overflow-hidden">
                    <CardHeader className="pb-6 border-b border-border/40">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                          <CardTitle className="text-xl font-bold font-display tracking-tight">
                            Global Listings
                          </CardTitle>
                          <CardDescription className="font-medium text-muted-foreground/70">
                            Audit and manage every property on the platform.
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                              placeholder="Search by title or location..."
                              className="pl-10 h-11 w-full md:w-72 bg-muted/20 border-border/40 rounded-xl focus:bg-background/80 transition-all font-medium"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                            />
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-11 w-11 rounded-xl border-border/40 hover:bg-muted/50"
                          >
                            <Filter className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-muted/20 text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60">
                              <th className="text-left py-4 px-6">
                                Property Details
                              </th>
                              <th className="text-left py-4 px-6">
                                Landlord / Owner
                              </th>
                              <th className="text-left py-4 px-6">Base Rent</th>
                              <th className="text-left py-4 px-6">Status</th>
                              <th className="text-right py-4 px-6">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/40">
                            {filteredProperties.length > 0 ? (
                              filteredProperties.map((property) => (
                                <tr
                                  key={property.id}
                                  className="group hover:bg-muted/10 transition-colors"
                                >
                                  <td className="py-6 px-6">
                                    <div className="flex items-center gap-4">
                                      <div className="relative w-16 h-16 rounded-2xl bg-muted overflow-hidden border border-border/40 group-hover:scale-105 transition-transform duration-500 shadow-sm">
                                        <img
                                          src={
                                            property.images?.[0] ||
                                            "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=200&q=80"
                                          }
                                          alt={property.title}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <p className="font-bold text-base tracking-tight leading-tight">
                                          {property.title}
                                        </p>
                                        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                          <MapPin className="w-3 h-3 text-primary/60" />
                                          {property.location}
                                        </p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-6 px-6">
                                    <div className="space-y-1">
                                      <p className="font-bold text-sm tracking-tight">
                                        {property.landlord?.name ||
                                          "System Base"}
                                      </p>
                                      <p className="text-xs font-medium text-muted-foreground/70">
                                        {property.landlord?.email ||
                                          "internal@app.com"}
                                      </p>
                                    </div>
                                  </td>
                                  <td className="py-6 px-6">
                                    <div className="space-y-1">
                                      <p className="font-bold text-sm text-primary">
                                        ₦
                                        {property.priceMonthly?.toLocaleString()}
                                      </p>
                                      <div className="flex gap-1">
                                        {[1, 2, 3].map((_, i) => (
                                          <div
                                            key={i}
                                            className="w-1.5 h-1.5 rounded-full bg-primary/20"
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-6 px-6">
                                    {property.status === "APPROVED" ||
                                    property.approved ? (
                                      <Badge
                                        variant="success"
                                        className="px-3 py-1 font-bold text-[10px] uppercase border-success/20 bg-success/5 italic"
                                      >
                                        Live Listing
                                      </Badge>
                                    ) : property.status === "REJECTED" ? (
                                      <Badge
                                        variant="destructive"
                                        className="px-3 py-1 font-bold text-[10px] uppercase border-destructive/20 bg-destructive/5"
                                      >
                                        Rejected
                                      </Badge>
                                    ) : (
                                      <Badge
                                        variant="warning"
                                        className="px-3 py-1 font-bold text-[10px] uppercase border-warning/20 bg-warning/5 animate-pulse"
                                      >
                                        Audit Needed
                                      </Badge>
                                    )}
                                  </td>
                                  <td className="py-6 px-6 text-right">
                                    <div className="flex items-center justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                                      {property.status === "APPROVED" ? (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="rounded-xl h-10 px-4 text-destructive hover:bg-destructive/5 font-bold text-xs"
                                          onClick={() =>
                                            handleApprove(property.id, false)
                                          }
                                        >
                                          Deactivate
                                        </Button>
                                      ) : (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="rounded-xl h-10 px-4 text-success hover:bg-success/5 font-bold text-xs"
                                          onClick={() =>
                                            handleApprove(property.id, true)
                                          }
                                        >
                                          Activate
                                        </Button>
                                      )}
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-10 w-10 rounded-xl hover:bg-muted/50"
                                          >
                                            <MoreVertical className="w-4 h-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                          align="end"
                                          className="rounded-xl border-border/40 backdrop-blur-xl p-1.5 min-w-[160px]"
                                        >
                                          <DropdownMenuItem
                                            asChild
                                            className="rounded-lg h-10 px-3 cursor-pointer"
                                          >
                                            <Link
                                              to={`/properties/${property.id}`}
                                              className="flex items-center gap-2 font-medium"
                                            >
                                              <ExternalLink className="w-4 h-4 text-primary" />
                                              Public Preview
                                            </Link>
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            asChild
                                            className="rounded-lg h-10 px-3 cursor-pointer"
                                          >
                                            <Link
                                              to={`/admin/properties/edit/${property.id}`}
                                              className="flex items-center gap-2 font-medium"
                                            >
                                              <Save className="w-4 h-4 text-primary" />
                                              Edit Records
                                            </Link>
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator className="bg-border/40" />
                                          <DropdownMenuItem
                                            className="rounded-lg h-10 px-3 text-destructive focus:text-destructive cursor-pointer flex items-center gap-2 font-medium"
                                            onClick={() =>
                                              handleDelete(property.id)
                                            }
                                          >
                                            <Trash2 className="w-4 h-4" />
                                            Purge Data
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={5} className="py-24 text-center">
                                  <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4 font-display text-4xl font-bold text-muted-foreground/30">
                                    ?
                                  </div>
                                  <p className="font-bold text-xl text-muted-foreground mb-1">
                                    No property matches
                                  </p>
                                  <p className="text-sm text-muted-foreground/60 max-w-xs mx-auto">
                                    Try adjusting your search query or filters.
                                  </p>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="landlords" className="mt-0 outline-none">
                <motion.div
                  key="landlords-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <LandlordsTab onVerify={handleVerifyLandlord} />
                </motion.div>
              </TabsContent>

              <TabsContent value="users" className="mt-0 outline-none">
                <motion.div
                  key="users-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <UsersTab
                    onFlag={handleFlagUser}
                    onDelete={handleDeleteUser}
                    onVerify={handleVerifyLandlord}
                  />
                </motion.div>
              </TabsContent>

              <TabsContent value="documents" className="mt-0 outline-none">
                <motion.div
                  key="documents-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="border-border/40 bg-background/60 backdrop-blur-md shadow-primary-md overflow-hidden relative">
                    <CardContent className="py-20 text-center">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-semibold tracking-tight mb-2">
                        Documents
                      </h3>
                      <p className="text-muted-foreground max-w-md mx-auto mb-6">
                        Manage lease agreements, ID verifications, and
                        compliance documents.
                      </p>
                      <Button asChild className="gradient-primary">
                        <Link to="/admin/documents/upload">
                          <Plus className="w-4 h-4 mr-2" />
                          Upload Document
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="appeals" className="mt-0 outline-none">
                <motion.div
                  key="appeals-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <AppealsTab />
                </motion.div>
              </TabsContent>

              <TabsContent value="analytics" className="mt-0 outline-none">
                <motion.div
                  key="analytics-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <AnalyticsTab />
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

function AppealsTab() {
  const { toast } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const LIMIT = 10;

<<<<<<< HEAD
  const {
    data: response,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin-appeals"],
    queryFn: () =>
      import("@/services/appeals").then((m) => m.fetchAllAppeals()),
=======
  const { data: response, isLoading, refetch } = useQuery({
    queryKey: ["admin-appeals", statusFilter, searchQuery, page],
    queryFn: () =>
      import("@/services/appeals").then(m =>
        m.fetchAllAppeals({
          page,
          limit: LIMIT,
          status: statusFilter !== "ALL" ? statusFilter : undefined,
          search: searchQuery || undefined,
        }),
      ),
>>>>>>> 4a6035fb1fcfa172f9c32935c26a029c8ee0b7aa
  });

  const appeals = response?.data || [];
  const meta = response?.meta;

<<<<<<< HEAD
  const handleProcess = async (
    id: string,
    status: "APPROVED" | "REJECTED",
    adminNote?: string,
  ) => {
=======
  const handleProcess = async (id: string, status: "APPROVED" | "REJECTED") => {
>>>>>>> 4a6035fb1fcfa172f9c32935c26a029c8ee0b7aa
    setProcessingId(id);
    try {
      const { processAppeal } = await import("@/services/appeals");
      await processAppeal(id, status, adminNotes[id] || undefined);
      toast({
        title: status === "APPROVED" ? "Appeal Approved" : "Appeal Rejected",
        description:
          status === "APPROVED"
            ? "The landlord's account has been reinstated."
            : "The appeal has been rejected.",
      });
      setAdminNotes(prev => { const n = { ...prev }; delete n[id]; return n; });
      refetch();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to process appeal.",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="border-border/40 bg-background/60 backdrop-blur-md shadow-primary-md overflow-hidden">
      <CardHeader className="pb-4 md:pb-6 border-b border-border/40">
<<<<<<< HEAD
        <CardTitle className="text-lg md:text-xl font-bold font-display tracking-tight">
          Suspension Appeals
        </CardTitle>
        <CardDescription className="font-medium text-muted-foreground/70 text-sm">
          Review appeals from suspended landlords.
        </CardDescription>
=======
        <CardTitle className="text-lg md:text-xl font-bold font-display tracking-tight">Suspension Appeals</CardTitle>
        <CardDescription className="font-medium text-muted-foreground/70 text-sm">Review appeals from suspended landlords.</CardDescription>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              className="pl-9 h-9 rounded-xl"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
            />
          </div>
          <div className="flex gap-1.5">
            {["ALL", "PENDING", "APPROVED", "REJECTED"].map(s => (
              <Button
                key={s}
                variant={statusFilter === s ? "default" : "outline"}
                size="sm"
                className="h-9 rounded-xl text-xs font-bold"
                onClick={() => { setStatusFilter(s); setPage(1); }}
              >
                {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
              </Button>
            ))}
          </div>
        </div>
>>>>>>> 4a6035fb1fcfa172f9c32935c26a029c8ee0b7aa
      </CardHeader>
      <CardContent className="p-0">
        {appeals.length > 0 ? (
          <div className="divide-y divide-border/40">
            {appeals.map((appeal: any) => (
              <div key={appeal.id} className="p-4 md:p-6 space-y-4">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-sm">{appeal.user?.name}</p>
                      <span className="text-xs text-muted-foreground">
                        {appeal.user?.email}
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
                    <p className="text-sm text-muted-foreground">
                      {appeal.reason}
                    </p>
                    <p className="text-xs text-muted-foreground/60">
<<<<<<< HEAD
                      Submitted{" "}
                      {new Date(appeal.createdAt).toLocaleDateString()}
                    </p>
                    {appeal.adminNote && (
                      <p className="text-xs text-muted-foreground italic">
=======
                      Submitted {new Date(appeal.createdAt).toLocaleDateString()}
                      {appeal.processedAt && (
                        <> &middot; Processed {new Date(appeal.processedAt).toLocaleDateString()}</>
                      )}
                    </p>
                    {appeal.adminNote && (
                      <p className="text-xs text-muted-foreground italic">
                        <MessageSquare className="w-3 h-3 inline mr-1" />
>>>>>>> 4a6035fb1fcfa172f9c32935c26a029c8ee0b7aa
                        Admin note: {appeal.adminNote}
                      </p>
                    )}
                  </div>
                  {appeal.status === "PENDING" && (
                    <div className="space-y-3 min-w-[220px]">
                      <textarea
                        placeholder="Admin note (optional)..."
                        className="flex w-full rounded-xl border border-border bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 min-h-[60px] resize-none"
                        value={adminNotes[appeal.id] || ""}
                        onChange={e => setAdminNotes(prev => ({ ...prev, [appeal.id]: e.target.value }))}
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 flex-1 text-success border-success/20 hover:bg-success/10 rounded-xl"
                          disabled={processingId === appeal.id}
                          onClick={() => handleProcess(appeal.id, "APPROVED")}
                        >
                          {processingId === appeal.id ? (
                            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                          )}
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 flex-1 text-destructive border-destructive/20 hover:bg-destructive/10 rounded-xl"
                          disabled={processingId === appeal.id}
                          onClick={() => handleProcess(appeal.id, "REJECTED")}
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1.5" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            <ShieldAlert className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="font-medium">No appeals found.</p>
          </div>
        )}
        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border/40">
            <p className="text-xs text-muted-foreground">
              Page {meta.page} of {meta.totalPages} ({meta.total} total)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-xl"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-xl"
                disabled={page >= meta.totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AnalyticsTab() {
  const { data: response, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: fetchAdminAnalytics,
  });

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const analytics = response?.data || {};
  const overview = analytics.overview || {};

  const stats = [
    {
      label: "Total Users",
      value: overview.totalUsers ?? 0,
      icon: Users,
      color: "text-primary",
    },
    {
      label: "Total Properties",
      value: overview.totalProperties ?? 0,
      icon: Building2,
      color: "text-success",
    },
    {
      label: "Active Bookings",
      value: overview.totalBookings ?? 0,
      icon: CalendarCheck,
      color: "text-warning",
    },
    {
      label: "Revenue",
      value: overview.totalRevenue
        ? `₦${Number(overview.totalRevenue).toLocaleString()}`
        : "₦0",
      icon: DollarSign,
      color: "text-accent",
    },
  ];

  const COLORS = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff8042",
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
  ];

  const bookingData = (
    (analytics.bookingsByStatus as Array<{ status: string; count: number }>) ||
    []
  ).map((item) => ({
    name: item.status.toLowerCase(),
    value: item.count,
  }));

  const userData = (
    (analytics.usersByRole as Array<{ role: string; count: number }>) || []
  ).map((item) => ({
    name: item.role.toLowerCase(),
    value: item.count,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="border-border/40 bg-background/60 backdrop-blur-md shadow-primary-sm group overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-primary/10 transition-colors" />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 rounded-2xl bg-muted/40 group-hover:bg-primary/10 transition-colors">
                  <stat.icon className={`w-7 h-7 ${stat.color}`} />
                </div>
                <TrendingUp className="w-4 h-4 text-primary/40 group-hover:text-primary transition-colors" />
              </div>
              <p className="text-3xl font-black font-display tracking-tight leading-none mb-2">
                {stat.value}
              </p>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                {stat.label}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Bookings by Status</CardTitle>
            <CardDescription>Distribution of booking requests</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {bookingData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bookingData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {bookingData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                No booking data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Users by Role</CardTitle>
            <CardDescription>Platform user distribution</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {userData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userData} layout="vertical">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={true}
                    vertical={false}
                    stroke="#E2E8F0"
                  />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    fontSize={12}
                    tick={{ fill: "#64748B" }}
                    width={80}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                    {userData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[(index + 2) % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                No user data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

<<<<<<< HEAD
function LandlordsTab({
  onVerify,
}: {
  onVerify: (
    id: string,
    status: "VERIFIED" | "REJECTED" | "SUSPENDED",
  ) => Promise<void>;
}) {
=======
function LandlordsTab({ onVerify }: { onVerify: (id: string, status: "VERIFIED" | "REJECTED" | "SUSPENDED", suspensionReason?: string) => Promise<void> }) {
>>>>>>> 4a6035fb1fcfa172f9c32935c26a029c8ee0b7aa
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const {
    data: response,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin-landlords"],
    queryFn: () => fetchAdminUsers("LANDLORD"),
  });

<<<<<<< HEAD
  const handleVerify = async (
    id: string,
    status: "VERIFIED" | "REJECTED" | "SUSPENDED",
  ) => {
=======
  const handleVerify = async (id: string, status: "VERIFIED" | "REJECTED" | "SUSPENDED") => {
    let suspensionReason: string | undefined;
    if (status === "SUSPENDED") {
      const reason = window.prompt("Provide a reason for suspending this landlord:");
      if (reason === null) return; // cancelled
      suspensionReason = reason || undefined;
    }
>>>>>>> 4a6035fb1fcfa172f9c32935c26a029c8ee0b7aa
    setVerifyingId(id);
    try {
      await onVerify(id, status, suspensionReason);
      refetch();
    } catch {
      // error toast already shown by parent
    } finally {
      setVerifyingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const landlords = response?.data || [];

  return (
    <Card className="border-border/40 bg-background/60 backdrop-blur-md shadow-primary-md overflow-hidden">
      <CardHeader className="pb-4 md:pb-6 border-b border-border/40">
        <CardTitle className="text-lg md:text-xl font-bold font-display tracking-tight">
          Landlord Verification
        </CardTitle>
        <CardDescription className="font-medium text-muted-foreground/70 text-sm">
          Review and verify landlord accounts.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {landlords.length > 0 ? (
          <>
            {/* Mobile card layout */}
            <div className="md:hidden divide-y divide-border/40">
              {landlords.map((landlord: any) => (
                <div key={landlord.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-sm truncate">
                          {landlord.name}
                        </p>
                        {landlord.landlordStatus === "VERIFIED" ? (
                          <Badge
                            variant="success"
                            className="text-[9px] px-1.5 py-0 shrink-0"
                          >
                            Verified
                          </Badge>
                        ) : landlord.landlordStatus === "REJECTED" ? (
                          <Badge
                            variant="destructive"
                            className="text-[9px] px-1.5 py-0 shrink-0"
                          >
                            Rejected
                          </Badge>
                        ) : landlord.landlordStatus === "SUSPENDED" ? (
                          <Badge
                            variant="destructive"
                            className="text-[9px] px-1.5 py-0 shrink-0"
                          >
                            Suspended
                          </Badge>
                        ) : (
                          <Badge
                            variant="warning"
                            className="text-[9px] px-1.5 py-0 shrink-0"
                          >
                            Pending
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {landlord.email}
                      </p>
                      <div className="mt-1.5">
                        {landlord.idCardUrl ? (
                          <a
                            href={landlord.idCardUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary text-xs hover:underline flex items-center gap-1 w-fit"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            View ID Card
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">
                            No ID uploaded
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {landlord.landlordStatus !== "VERIFIED" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 flex-1 text-success border-success/20 hover:bg-success/10 rounded-xl"
                        disabled={verifyingId === landlord.id}
                        onClick={() => handleVerify(landlord.id, "VERIFIED")}
                      >
                        {verifyingId === landlord.id ? (
                          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                        )}
                        Approve
                      </Button>
                    )}
                    {(landlord.landlordStatus === "PENDING" ||
                      landlord.landlordStatus === "VERIFIED") && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 flex-1 text-destructive border-destructive/20 hover:bg-destructive/10 rounded-xl"
                        disabled={verifyingId === landlord.id}
                        onClick={() => handleVerify(landlord.id, "REJECTED")}
                      >
                        {verifyingId === landlord.id ? (
                          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 mr-1.5" />
                        )}
                        Reject
                      </Button>
                    )}
                    {landlord.landlordStatus === "VERIFIED" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 flex-1 text-destructive border-destructive/20 hover:bg-destructive/10 rounded-xl"
                        disabled={verifyingId === landlord.id}
                        onClick={() => handleVerify(landlord.id, "SUSPENDED")}
                      >
                        <ShieldAlert className="w-3.5 h-3.5 mr-1.5" />
                        Suspend
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table layout */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground">
                    <th className="text-left font-medium py-4 px-3">Name</th>
                    <th className="text-left font-medium py-4 px-3">Email</th>
                    <th className="text-left font-medium py-4 px-3">ID Card</th>
                    <th className="text-left font-medium py-4 px-3">Status</th>
                    <th className="text-right font-medium py-4 px-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {landlords.map((landlord: any) => (
                    <tr
                      key={landlord.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-5 px-3 font-medium">{landlord.name}</td>
                      <td className="py-5 px-3 text-muted-foreground">
                        {landlord.email}
                      </td>
                      <td className="py-5 px-3">
                        {landlord.idCardUrl ? (
                          <a
                            href={landlord.idCardUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            <FileText className="w-4 h-4" />
                            View ID
                          </a>
                        ) : (
                          <span className="text-muted-foreground italic">
                            No ID uploaded
                          </span>
                        )}
                      </td>
                      <td className="py-5 px-3">
                        {landlord.landlordStatus === "VERIFIED" ? (
                          <Badge variant="success">Verified</Badge>
                        ) : landlord.landlordStatus === "REJECTED" ? (
                          <Badge variant="destructive">Rejected</Badge>
                        ) : landlord.landlordStatus === "SUSPENDED" ? (
                          <Badge variant="destructive">Suspended</Badge>
                        ) : (
                          <Badge variant="warning">Pending</Badge>
                        )}
                      </td>
                      <td className="py-5 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {landlord.landlordStatus !== "VERIFIED" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-success border-success/20 hover:bg-success/10"
                              disabled={verifyingId === landlord.id}
                              onClick={() =>
                                handleVerify(landlord.id, "VERIFIED")
                              }
                            >
                              {verifyingId === landlord.id ? (
                                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                              ) : null}
                              Approve
                            </Button>
                          )}
                          {(landlord.landlordStatus === "PENDING" ||
                            landlord.landlordStatus === "VERIFIED") && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-destructive border-destructive/20 hover:bg-destructive/10"
                              disabled={verifyingId === landlord.id}
                              onClick={() =>
                                handleVerify(landlord.id, "REJECTED")
                              }
                            >
                              {verifyingId === landlord.id ? (
                                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                              ) : null}
                              Reject
                            </Button>
                          )}
                          {landlord.landlordStatus === "VERIFIED" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-destructive border-destructive/20 hover:bg-destructive/10"
                              disabled={verifyingId === landlord.id}
                              onClick={() =>
                                handleVerify(landlord.id, "SUSPENDED")
                              }
                            >
                              Suspend
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="font-medium">No landlords registered yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function UsersTab({
  onFlag,
  onDelete,
  onVerify,
}: {
  onFlag: (id: string, flagged: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
<<<<<<< HEAD
  onVerify: (
    id: string,
    status: "VERIFIED" | "REJECTED" | "SUSPENDED",
  ) => Promise<void>;
=======
  onVerify: (id: string, status: "VERIFIED" | "REJECTED" | "SUSPENDED", suspensionReason?: string) => Promise<void>;
>>>>>>> 4a6035fb1fcfa172f9c32935c26a029c8ee0b7aa
}) {
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  const {
    data: allUsersRes,
    isLoading: allLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin-all-users"],
    queryFn: () => fetchAdminUsers(),
  });

  if (allLoading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const allUsers: any[] = allUsersRes?.data || [];
  const filteredUsers =
    roleFilter === "ALL"
      ? allUsers
      : allUsers.filter((u: any) => u.role === roleFilter);

  return (
    <Card className="border-border/40 bg-background/60 backdrop-blur-md shadow-primary-md overflow-hidden">
      <CardHeader className="pb-4 md:pb-6 border-b border-border/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg md:text-xl font-bold font-display tracking-tight">
              User Management
            </CardTitle>
            <CardDescription className="font-medium text-muted-foreground/70 text-sm">
              View, flag, or remove user accounts.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {["ALL", "STUDENT", "LANDLORD"].map((role) => (
              <Button
                key={role}
                variant={roleFilter === role ? "default" : "outline"}
                size="sm"
                className="text-xs"
                onClick={() => setRoleFilter(role)}
              >
                {role === "ALL"
                  ? "All"
                  : role === "STUDENT"
                    ? "Students"
                    : "Landlords"}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {filteredUsers.length > 0 ? (
          <>
            {/* Mobile card layout */}
            <div className="md:hidden divide-y divide-border/40">
              {filteredUsers.map((u: any) => (
                <div key={u.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-bold text-sm truncate">{u.name}</p>
                        <Badge
                          variant="outline"
                          className="text-[9px] px-1.5 py-0 shrink-0"
                        >
                          {u.role}
                        </Badge>
                        {u.flagged && (
                          <Badge
                            variant="destructive"
                            className="text-[9px] px-1.5 py-0 shrink-0"
                          >
                            <Flag className="w-2.5 h-2.5 mr-0.5" />
                            Flagged
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {u.email}
                      </p>
                      {u.role === "LANDLORD" && (
                        <div className="mt-1">
                          <Badge
                            variant={
                              u.landlordStatus === "VERIFIED"
                                ? "success"
                                : u.landlordStatus === "REJECTED" ||
                                    u.landlordStatus === "SUSPENDED"
                                  ? "destructive"
                                  : "warning"
                            }
                            className="text-[9px]"
                          >
                            {u.landlordStatus || "PENDING"}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
<<<<<<< HEAD
                    {u.role === "LANDLORD" &&
                      u.landlordStatus !== "VERIFIED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs text-success border-success/20 hover:bg-success/10"
                          onClick={async () => {
                            await onVerify(u.id, "VERIFIED");
                            refetch();
                          }}
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Verify
                        </Button>
                      )}
                    {u.role === "LANDLORD" &&
                      u.landlordStatus === "VERIFIED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs text-destructive border-destructive/20 hover:bg-destructive/10"
                          onClick={async () => {
                            await onVerify(u.id, "SUSPENDED");
                            refetch();
                          }}
                        >
                          <ShieldAlert className="w-3 h-3 mr-1" />
                          Suspend
                        </Button>
                      )}
=======
                    {u.role === "LANDLORD" && u.landlordStatus !== "VERIFIED" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs text-success border-success/20 hover:bg-success/10"
                        onClick={async () => { await onVerify(u.id, "VERIFIED"); refetch(); }}
                      >
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Verify
                      </Button>
                    )}
                    {u.role === "LANDLORD" && u.landlordStatus === "VERIFIED" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs text-destructive border-destructive/20 hover:bg-destructive/10"
                        onClick={async () => { const r = window.prompt("Provide a reason for suspending this landlord:"); if (r === null) return; await onVerify(u.id, "SUSPENDED", r || undefined); refetch(); }}
                      >
                        <ShieldAlert className="w-3 h-3 mr-1" />
                        Suspend
                      </Button>
                    )}
>>>>>>> 4a6035fb1fcfa172f9c32935c26a029c8ee0b7aa
                    <Button
                      variant="outline"
                      size="sm"
                      className={`h-8 text-xs ${u.flagged ? "text-warning border-warning/20 hover:bg-warning/10" : "text-orange-500 border-orange-200 hover:bg-orange-50"}`}
                      onClick={async () => {
                        await onFlag(u.id, !u.flagged);
                        refetch();
                      }}
                    >
                      <Flag className="w-3 h-3 mr-1" />
                      {u.flagged ? "Unflag" : "Flag"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs text-destructive border-destructive/20 hover:bg-destructive/10"
                      onClick={async () => {
                        await onDelete(u.id);
                        refetch();
                      }}
                    >
                      <UserX className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table layout */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground">
                    <th className="text-left font-medium py-4 px-4">Name</th>
                    <th className="text-left font-medium py-4 px-4">Email</th>
                    <th className="text-left font-medium py-4 px-4">Role</th>
                    <th className="text-left font-medium py-4 px-4">Status</th>
                    <th className="text-right font-medium py-4 px-4">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredUsers.map((u: any) => (
                    <tr
                      key={u.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{u.name}</span>
                          {u.flagged && (
                            <Badge
                              variant="destructive"
                              className="text-[9px] px-1.5 py-0"
                            >
                              <Flag className="w-2.5 h-2.5 mr-0.5" />
                              Flagged
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">
                        {u.email}
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline">{u.role}</Badge>
                      </td>
                      <td className="py-4 px-4">
                        {u.role === "LANDLORD" ? (
                          <Badge
                            variant={
                              u.landlordStatus === "VERIFIED"
                                ? "success"
                                : u.landlordStatus === "REJECTED" ||
                                    u.landlordStatus === "SUSPENDED"
                                  ? "destructive"
                                  : "warning"
                            }
                          >
                            {u.landlordStatus || "PENDING"}
                          </Badge>
                        ) : (
                          <Badge variant={u.verified ? "success" : "outline"}>
                            {u.verified ? "Verified" : "Active"}
                          </Badge>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
<<<<<<< HEAD
                          {u.role === "LANDLORD" &&
                            u.landlordStatus !== "VERIFIED" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-success border-success/20 hover:bg-success/10"
                                onClick={async () => {
                                  await onVerify(u.id, "VERIFIED");
                                  refetch();
                                }}
                              >
                                Verify
                              </Button>
                            )}
                          {u.role === "LANDLORD" &&
                            u.landlordStatus === "VERIFIED" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-destructive border-destructive/20 hover:bg-destructive/10"
                                onClick={async () => {
                                  await onVerify(u.id, "SUSPENDED");
                                  refetch();
                                }}
                              >
                                Suspend
                              </Button>
                            )}
=======
                          {u.role === "LANDLORD" && u.landlordStatus !== "VERIFIED" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-success border-success/20 hover:bg-success/10"
                              onClick={async () => { await onVerify(u.id, "VERIFIED"); refetch(); }}
                            >
                              Verify
                            </Button>
                          )}
                          {u.role === "LANDLORD" && u.landlordStatus === "VERIFIED" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-destructive border-destructive/20 hover:bg-destructive/10"
                              onClick={async () => { const r = window.prompt("Provide a reason for suspending this landlord:"); if (r === null) return; await onVerify(u.id, "SUSPENDED", r || undefined); refetch(); }}
                            >
                              Suspend
                            </Button>
                          )}
>>>>>>> 4a6035fb1fcfa172f9c32935c26a029c8ee0b7aa
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="min-w-[150px]"
                            >
                              <DropdownMenuItem
                                onClick={async () => {
                                  await onFlag(u.id, !u.flagged);
                                  refetch();
                                }}
                                className="cursor-pointer"
                              >
                                <Flag className="w-4 h-4 mr-2 text-orange-500" />
                                {u.flagged ? "Remove Flag" : "Flag Account"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive cursor-pointer"
                                onClick={async () => {
                                  await onDelete(u.id);
                                  refetch();
                                }}
                              >
                                <UserX className="w-4 h-4 mr-2" />
                                Delete Account
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="font-medium">No users found.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AdminDashboard;
