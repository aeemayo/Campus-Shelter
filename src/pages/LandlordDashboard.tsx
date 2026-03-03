import { useState, useMemo } from "react";
import { Navigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { fetchProperties } from "@/services/properties";
import { fetchMyBookings, updateBookingStatus, type Booking } from "@/services/bookings";
import {
  fetchMyMaintenanceRequests,
  updateMaintenanceStatus,
  type MaintenanceRequest,
} from "@/services/maintenance";
import { uploadDocument } from "@/services/documents";
import { createLease } from "@/services/leases";
import { toFrontendProperty } from "@/lib/propertyAdapter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
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
} from "lucide-react";
import { StatusBadge } from "@/lib/status-badge";
import { useToast } from "@/hooks/use-toast";

const LandlordDashboard = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("properties");

  // Fetch landlord's properties
  const { data: propertiesResponse, isLoading: propsLoading } = useQuery({
    queryKey: ["landlord-properties"],
    queryFn: () => fetchProperties({ limit: 100 }),
    enabled: isAuthenticated && user?.role === "LANDLORD",
  });

  const myProperties = useMemo(() => {
    if (!propertiesResponse?.data || !user) return [];
    return propertiesResponse.data
      .filter((p) => p.landlordId === user.id)
      .map(toFrontendProperty);
  }, [propertiesResponse, user]);

  // Fetch bookings (role-aware — returns bookings on landlord's properties)
  const { data: bookingsResponse, isLoading: bookingsLoading } = useQuery({
    queryKey: ["landlord-bookings"],
    queryFn: fetchMyBookings,
    enabled: isAuthenticated && user?.role === "LANDLORD",
  });

  const bookings = bookingsResponse?.data || [];

  // Fetch maintenance requests
  const { data: maintenanceResponse, isLoading: maintenanceLoading } = useQuery({
    queryKey: ["landlord-maintenance"],
    queryFn: fetchMyMaintenanceRequests,
    enabled: isAuthenticated && user?.role === "LANDLORD",
  });

  const maintenanceRequests = maintenanceResponse?.data || [];

  // Booking status mutation
  const bookingMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "APPROVED" | "REJECTED" }) =>
      updateBookingStatus(id, status),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["landlord-bookings"] });
      toast({
        title: vars.status === "APPROVED" ? "Booking Approved" : "Booking Rejected",
        description: `The booking has been ${vars.status.toLowerCase()}.`,
      });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update booking status.", variant: "destructive" });
    },
  });

  // Maintenance status mutation
  const maintenanceMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "OPEN" | "IN_PROGRESS" | "RESOLVED" }) =>
      updateMaintenanceStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landlord-maintenance"] });
      toast({ title: "Status Updated", description: "Maintenance request status has been updated." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
    },
  });

  // Lease upload state
  const [leaseUploadBookingId, setLeaseUploadBookingId] = useState<string | null>(null);
  const [leaseFile, setLeaseFile] = useState<File | null>(null);
  const [leaseUploading, setLeaseUploading] = useState(false);

  const handleLeaseUpload = async () => {
    if (!leaseFile || !leaseUploadBookingId) return;
    setLeaseUploading(true);
    try {
      const uploadRes = await uploadDocument(leaseFile, "LEASE");
      await createLease({ bookingId: leaseUploadBookingId, documentUrl: uploadRes.data.url });
      toast({ title: "Lease Created", description: "Lease document has been uploaded and linked." });
      setLeaseUploadBookingId(null);
      setLeaseFile(null);
      queryClient.invalidateQueries({ queryKey: ["landlord-bookings"] });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to upload lease.", variant: "destructive" });
    } finally {
      setLeaseUploading(false);
    }
  };

  // Auth guard
  if (!authLoading && (!isAuthenticated || user?.role !== "LANDLORD")) {
    return <Navigate to="/" replace />;
  }

  if (authLoading) {
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
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold tracking-tight">Landlord Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage your properties, bookings, and maintenance requests.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="properties" className="gap-2">
                <Building2 className="w-4 h-4" />
                Properties
              </TabsTrigger>
              <TabsTrigger value="bookings" className="gap-2">
                <CalendarCheck className="w-4 h-4" />
                Bookings
              </TabsTrigger>
              <TabsTrigger value="maintenance" className="gap-2">
                <Wrench className="w-4 h-4" />
                Maintenance
              </TabsTrigger>
            </TabsList>

            {/* ── Properties Tab ── */}
            <TabsContent value="properties" className="space-y-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>My Properties</CardTitle>
                  <CardDescription>Properties you've listed on the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                  {propsLoading ? (
                    <div className="py-12 flex justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : myProperties.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border/50 text-muted-foreground">
                            <th className="text-left font-medium py-3 px-2">Property</th>
                            <th className="text-left font-medium py-3 px-2">Price</th>
                            <th className="text-left font-medium py-3 px-2">Status</th>
                            <th className="text-right font-medium py-3 px-2">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          {myProperties.map((property) => (
                            <tr key={property.id} className="hover:bg-muted/30 transition-colors">
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
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {property.location}
                                    </p>
                                  </div>
                                </div>
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
                              <td className="py-4 px-2 text-right">
                                <Button variant="ghost" size="sm" asChild>
                                  <Link to={`/properties/${property.id}`}>
                                    <ExternalLink className="w-4 h-4 mr-1" />
                                    View
                                  </Link>
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-muted-foreground">
                      <Building2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                      <p className="font-medium">No properties listed yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Bookings Tab ── */}
            <TabsContent value="bookings" className="space-y-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Booking Requests</CardTitle>
                  <CardDescription>Review and manage booking requests from students.</CardDescription>
                </CardHeader>
                <CardContent>
                  {bookingsLoading ? (
                    <div className="py-12 flex justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : bookings.length > 0 ? (
                    <div className="space-y-4">
                      {bookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg border border-border/50 hover:border-primary/20 transition-all"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <p className="font-semibold">{booking.property?.title || "Property"}</p>
                              <StatusBadge status={booking.status} />
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <span>Student: {booking.studentId.slice(0, 8)}…</span>
                              <span>
                                {new Date(booking.leaseStart).toLocaleDateString()} –{" "}
                                {new Date(booking.leaseEnd).toLocaleDateString()}
                              </span>
                              <span>Requested: {new Date(booking.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {booking.status === "PENDING" && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-success hover:bg-success/90 text-success-foreground"
                                  disabled={bookingMutation.isPending}
                                  onClick={() => bookingMutation.mutate({ id: booking.id, status: "APPROVED" })}
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  disabled={bookingMutation.isPending}
                                  onClick={() => bookingMutation.mutate({ id: booking.id, status: "REJECTED" })}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                            {booking.status === "APPROVED" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setLeaseUploadBookingId(booking.id)}
                              >
                                <Upload className="w-4 h-4 mr-1" />
                                Upload Lease
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-muted-foreground">
                      <CalendarCheck className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                      <p className="font-medium">No booking requests yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Lease Upload Dialog */}
              {leaseUploadBookingId && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-lg">Upload Lease Document</CardTitle>
                    <CardDescription>Upload a lease document for booking #{leaseUploadBookingId.slice(0, 8)}…</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Lease Document (PDF)</Label>
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setLeaseFile(e.target.files?.[0] || null)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="gradient-primary"
                        disabled={!leaseFile || leaseUploading}
                        onClick={handleLeaseUpload}
                      >
                        {leaseUploading ? "Uploading..." : "Upload & Create Lease"}
                      </Button>
                      <Button variant="outline" onClick={() => { setLeaseUploadBookingId(null); setLeaseFile(null); }}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* ── Maintenance Tab ── */}
            <TabsContent value="maintenance" className="space-y-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Maintenance Requests</CardTitle>
                  <CardDescription>View and update maintenance requests from tenants.</CardDescription>
                </CardHeader>
                <CardContent>
                  {maintenanceLoading ? (
                    <div className="py-12 flex justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : maintenanceRequests.length > 0 ? (
                    <div className="space-y-4">
                      {maintenanceRequests.map((req) => (
                        <div
                          key={req.id}
                          className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg border border-border/50"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <p className="font-semibold">
                                {req.description.slice(0, 80)}{req.description.length > 80 ? "…" : ""}
                              </p>
                              <Badge variant="outline">{req.status.replace("_", " ")}</Badge>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              {req.property && <span>Property: {req.property.title}</span>}
                              {req.student && <span>Student: {req.student.name}</span>}
                              <span>Submitted: {new Date(req.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div>
                            <select
                              value={req.status}
                              onChange={(e) =>
                                maintenanceMutation.mutate({
                                  id: req.id,
                                  status: e.target.value as "OPEN" | "IN_PROGRESS" | "RESOLVED",
                                })
                              }
                              disabled={maintenanceMutation.isPending}
                              className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              <option value="OPEN">Open</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="RESOLVED">Resolved</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-muted-foreground">
                      <Wrench className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                      <p className="font-medium">No maintenance requests.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LandlordDashboard;
