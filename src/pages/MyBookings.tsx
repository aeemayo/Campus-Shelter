import { useQuery } from "@tanstack/react-query";
import { fetchMyBookings, type Booking } from "@/services/bookings";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Clock,
  Loader2,
  Home,
  ChevronRight,
  Phone,
  FileText,
} from "lucide-react";
import { StatusBadge } from "@/lib/status-badge";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const MyBookings = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: fetchMyBookings,
    enabled: isAuthenticated,
  });

  const bookings = response?.data || [];

  // Auth guard
  if (!authLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
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
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Home className="w-4 h-4" />
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground">My Bookings</span>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">My <span className="text-primary">Bookings</span></h1>
              <p className="text-muted-foreground mt-2">Track your accommodation requests and history.</p>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground">Fetching your bookings...</p>
              </div>
            ) : bookings.length > 0 ? (
              <div className="space-y-6">
                {bookings.map((booking) => (
                  <Card key={booking.id} className="overflow-hidden border-border/60 hover:border-primary/20 transition-all">
                    <div className="flex flex-col md:flex-row">
                      <div className="w-full md:w-64 h-48 md:h-auto overflow-hidden">
                        <img
                          src={booking.property?.images?.[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400"}
                          alt={booking.property?.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 p-6">
                        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-foreground mb-1 tracking-tight">{booking.property?.title || "Property Listing"}</h3>
                            <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                              <MapPin className="w-4 h-4 text-primary" />
                              {booking.property?.location || "FUTA Area"}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <StatusBadge status={booking.status} />
                            <p className="text-xs text-muted-foreground">Requested on {new Date(booking.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                              <Calendar className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Lease Period</p>
                              <p className="text-sm font-medium">{new Date(booking.leaseStart).toLocaleDateString()} - {new Date(booking.leaseEnd).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                              <Phone className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Monthly Rent</p>
                              <p className="text-sm font-medium">₦{(booking.property?.priceMonthly || 0).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-border/60">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/properties/${booking.propertyId}`}>View Listing</Link>
                          </Button>

                          {booking.status === "APPROVED" && (
                            booking.lease ? (
                              <Button
                                className="gradient-primary"
                                size="sm"
                                asChild
                              >
                                <a href={booking.lease.documentUrl} target="_blank" rel="noopener noreferrer">
                                  <FileText className="w-4 h-4 mr-1" />
                                  View Lease
                                </a>
                              </Button>
                            ) : (
                              <Badge variant="warning">
                                <Clock className="w-3 h-3 mr-1" />
                                Lease Pending
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-muted/20 rounded-xl border-2 border-dashed border-border/60">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2 tracking-tight">No bookings yet</h3>
                <p className="text-muted-foreground mb-6">You haven't requested any accommodations yet.</p>
                <Button asChild>
                  <Link to="/properties">Browse Properties</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyBookings;
