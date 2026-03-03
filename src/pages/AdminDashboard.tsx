import { useState, useMemo } from "react";
import { Navigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useProperties } from "@/hooks/use-properties";
import { toFrontendProperty } from "@/lib/propertyAdapter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  Loader2,
  Trash2,
  TrendingUp,
  CalendarCheck,
  DollarSign,
} from "lucide-react";
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
  fetchAdminAnalytics,
  fetchAdminUsers,
} from "@/services/properties";
import { useToast } from "@/components/ui/use-toast";

const AdminDashboard = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("properties");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all properties
  const { data: apiResponse, refetch } = useProperties({ limit: 100 });

  const properties = useMemo(() => {
    if (!apiResponse?.data) return [];
    return apiResponse.data.map(toFrontendProperty);
  }, [apiResponse]);

  const filteredProperties = properties.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApprove = async (id: string, approved: boolean) => {
    try {
      await adminApproveProperty(id, approved);
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

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this property? This action cannot be undone.")) return;
    try {
      await adminDeleteProperty(id);
      toast({ title: "Property Deleted", description: "The property has been removed." });
      refetch();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete property.", variant: "destructive" });
    }
  };

  // Auth Guard
  if (!isLoading && (!isAuthenticated || user?.role !== "ADMIN")) {
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold tracking-tight">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-1">Manage properties, landlords, and documents for the platform.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button asChild className="gradient-primary">
                <Link to="/admin/properties/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Property
                </Link>
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="properties" className="gap-2">
                <Building2 className="w-4 h-4" />
                Properties
              </TabsTrigger>
              <TabsTrigger value="landlords" className="gap-2">
                <Users className="w-4 h-4" />
                Landlords
              </TabsTrigger>
              <TabsTrigger value="documents" className="gap-2">
                <FileText className="w-4 h-4" />
                Documents
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="properties" className="space-y-6">
              <Card className="border-border/50 shadow-primary-sm bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle>All Listings</CardTitle>
                      <CardDescription>View and manage all property listings on the platform.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Search listings..."
                          className="pl-9 h-9"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <Button variant="outline" size="icon" className="h-9 w-9">
                        <Filter className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/50 text-muted-foreground">
                          <th className="text-left font-medium py-3 px-2">Property</th>
                          <th className="text-left font-medium py-3 px-2">Landlord</th>
                          <th className="text-left font-medium py-3 px-2">Price</th>
                          <th className="text-left font-medium py-3 px-2">Status</th>
                          <th className="text-right font-medium py-3 px-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {filteredProperties.length > 0 ? (
                          filteredProperties.map((property) => (
                            <tr key={property.id} className="group hover:bg-muted/30 transition-colors">
                              <td className="py-4 px-2">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden">
                                    <img
                                      src={property.images?.[0] || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=100&q=80"}
                                      alt={property.title}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div>
                                    <p className="font-semibold">{property.title}</p>
                                    <p className="text-xs text-muted-foreground">{property.location}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-2">
                                <p className="font-medium">{property.landlord?.name || "System"}</p>
                                <p className="text-xs text-muted-foreground">{property.landlord?.email || ""}</p>
                              </td>
                              <td className="py-4 px-2">
                                <p className="font-semibold">₦{property.priceMonthly?.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">monthly</p>
                              </td>
                              <td className="py-4 px-2">
                                {property.approved ? (
                                  <Badge variant="success">Approved</Badge>
                                ) : (
                                  <Badge variant="warning">Pending</Badge>
                                )}
                              </td>
                              <td className="py-4 px-2 text-right text-xs">
                                <div className="flex items-center justify-end gap-2">
                                  {property.approved ? (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 text-destructive border-destructive/20 hover:bg-destructive/10"
                                      onClick={() => handleApprove(property.id, false)}
                                    >
                                      Reject
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 text-success border-success/20 hover:bg-success/10"
                                      onClick={() => handleApprove(property.id, true)}
                                    >
                                      Approve
                                    </Button>
                                  )}
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <MoreVertical className="w-4 h-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem asChild>
                                        <Link to={`/properties/${property.id}`} className="flex items-center">
                                          <ExternalLink className="w-4 h-4 mr-2" />
                                          View Public
                                        </Link>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem asChild>
                                        <Link to={`/admin/properties/edit/${property.id}`} className="flex items-center">
                                          <Plus className="w-4 h-4 mr-2 rotate-45" />
                                          Edit Details
                                        </Link>
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        className="text-destructive focus:text-destructive"
                                        onClick={() => handleDelete(property.id)}
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete Property
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-muted-foreground">
                              No properties found matching your criteria.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="landlords">
              <LandlordsTab />
            </TabsContent>

            <TabsContent value="documents">
               <Card className="border-border/50">
                <CardContent className="py-20 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Agent Document Upload</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    Upload lease documents, IDs, or utility bills for specific landlords and tenants.
                  </p>
                  <Button asChild className="gradient-primary">
                    <Link to="/admin/documents/upload">
                      <Plus className="w-4 h-4 mr-2" />
                      New Upload
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <AnalyticsTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

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

  const stats = [
    { label: "Total Users", value: analytics.totalUsers ?? 0, icon: Users, color: "text-primary" },
    { label: "Total Properties", value: analytics.totalProperties ?? 0, icon: Building2, color: "text-success" },
    { label: "Active Bookings", value: analytics.activeBookings ?? analytics.totalBookings ?? 0, icon: CalendarCheck, color: "text-warning" },
    { label: "Revenue", value: analytics.revenue ? `₦${Number(analytics.revenue).toLocaleString()}` : "₦0", icon: DollarSign, color: "text-accent" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {analytics.bookingsByStatus && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Bookings by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(analytics.bookingsByStatus as Record<string, number>).map(([status, count]) => (
                <div key={status} className="text-center p-4 rounded-lg bg-muted/30">
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-sm text-muted-foreground capitalize">{status.toLowerCase()}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {analytics.usersByRole && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Users by Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(analytics.usersByRole as Record<string, number>).map(([role, count]) => (
                <div key={role} className="text-center p-4 rounded-lg bg-muted/30">
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-sm text-muted-foreground capitalize">{role.toLowerCase()}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function LandlordsTab() {
  const { data: response, isLoading } = useQuery({
    queryKey: ["admin-landlords"],
    queryFn: () => fetchAdminUsers("LANDLORD"),
  });

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const landlords = response?.data || [];

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Registered Landlords</CardTitle>
        <CardDescription>All landlord accounts on the platform.</CardDescription>
      </CardHeader>
      <CardContent>
        {landlords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-muted-foreground">
                  <th className="text-left font-medium py-3 px-2">Name</th>
                  <th className="text-left font-medium py-3 px-2">Email</th>
                  <th className="text-left font-medium py-3 px-2">Phone</th>
                  <th className="text-left font-medium py-3 px-2">Verified</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {landlords.map((landlord: any) => (
                  <tr key={landlord.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-2 font-medium">{landlord.name}</td>
                    <td className="py-4 px-2 text-muted-foreground">{landlord.email}</td>
                    <td className="py-4 px-2 text-muted-foreground">{landlord.phone || "—"}</td>
                    <td className="py-4 px-2">
                      {landlord.verified ? (
                        <Badge variant="success">Verified</Badge>
                      ) : (
                        <Badge variant="warning">Pending</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

export default AdminDashboard;
