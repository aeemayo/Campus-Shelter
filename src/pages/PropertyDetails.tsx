import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Divide, Shield } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchProperty } from "@/services/properties";
import { fetchPropertyReviews } from "@/services/reviews";
import { toFrontendProperty } from "@/lib/propertyAdapter";
import { Loader2, ArrowLeft, Phone, ShieldCheck, Info, Star, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { createBooking } from "@/services/bookings";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ParamTypes extends Record<string, string> {
  id: string;
}

export default function RentalDetailsPage() {
  const { id } = useParams<ParamTypes>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [bookingDates, setBookingDates] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
  });

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ["property", id],
    queryFn: () => fetchProperty(id!),
    enabled: !!id,
  });

  const property = useMemo(() => {
    return response?.data ? toFrontendProperty(response.data) : null;
  }, [response]);

  useEffect(() => {
    if (property && !activeImage) {
      setActiveImage(property.images[0]);
    }
  }, [property, activeImage]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (isError || !property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold">Property not found</h2>
        <Button onClick={() => navigate("/properties")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Properties
        </Button>
      </div>
    );
  }

  const thumbnails = showAll ? property.images : property.images.slice(0, 4);
  const remaining = property.images.length - 4;

  return (
    <section>
      <Header />
      <div className="pt-24 max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">{property.title}</h1>
          <p className="text-muted-foreground">{property.location}</p>
        </div>
        {/* Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <img
            src={activeImage || property.images[0]}
            alt="main"
            className="md:col-span-2 h-[420px] w-full object-cover rounded-2xl cursor-pointer"
          />

          <div className="grid grid-cols-2 gap-4">
            {thumbnails.map((img, i) => {
              const isLastVisible = !showAll && i === 3 && remaining > 0;

              return (
                <div
                  key={i}
                  className="relative h-[200px] w-full cursor-pointer"
                  onClick={() => {
                    if (isLastVisible) {
                      setShowAll(true);
                    } else {
                      setActiveImage(img);
                    }
                  }}
                >
                  <img
                    src={img}
                    alt={`gallery-${i}`}
                    className={`h-full w-full object-cover rounded-2xl transition hover:opacity-80 ${
                      activeImage === img ? "ring-2 ring-primary" : ""
                    }`}
                  />

                  {isLastVisible && (
                    <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center text-white text-xl font-semibold">
                      +{remaining}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <Card className="rounded-2xl shadow-sm">
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 text-sm">
                <Stat
                  label="Price"
                  value={`${formatNaira(property.price)}/ ${property.priceType === "yearly" ? "year" : "month"}`}
                />
                <Stat label="Bedrooms" value={property.bedrooms} />
                <Stat label="Bathrooms" value={property.bathrooms} />
                <Stat label="Distance" value={property.distance} />
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="description" className="space-y-4">
              <TabsList>
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="info">Information</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="history">Price History</TabsTrigger>
              </TabsList>

              <TabsContent value="description">
                <Card className="rounded-2xl shadow-sm">
                  <CardContent className="p-6 leading-relaxed text-sm text-muted-foreground space-y-3">
                    <p>{property.description}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="info">
                <Card className="rounded-2xl shadow-sm">
                  <CardContent className="p-6 text-sm text-muted-foreground space-y-3">
                    <p className="flex justify-between border-b border-border/50 pb-2">
                      <span className="font-medium text-foreground">Furnished</span>
                      <span>{property.furnished ? "Yes" : "No"}</span>
                    </p>
                    <p className="flex justify-between border-b border-border/50 pb-2">
                      <span className="font-medium text-foreground">Available From</span>
                      <span>{new Date(property.availableFrom || '').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </p>
                    <p className="flex justify-between border-b border-border/50 pb-2">
                      <span className="font-medium text-foreground">Lease Term</span>
                      <span>12 months (standard)</span>
                    </p>
                    <p className="flex justify-between border-b border-border/50 pb-2">
                      <span className="font-medium text-foreground">Electricity Backup</span>
                      <span>{property.amenities.includes("Electricity Backup") ? "Available" : "No"}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-medium text-foreground">Pets Policy</span>
                      <span className="italic">Contact Agent</span>
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="features">
                <Card className="rounded-2xl shadow-sm">
                  <CardContent className="p-6 text-sm text-muted-foreground grid grid-cols-2 gap-2">
                    {property.amenities.map((item) => (
                      <p>•{item}</p>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews">
                <PropertyReviews propertyId={id!} />
              </TabsContent>

              <TabsContent value="history">
                <Card className="rounded-2xl shadow-sm">
                  <CardContent className="p-6 text-center py-12">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="w-6 h-6 text-muted-foreground/40" />
                    </div>
                    <p className="text-sm text-muted-foreground italic">Price history is currently limited for this property.</p>
                    <p className="font-bold text-foreground mt-2">Current Listing: {formatNaira(property.price)}</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Agent Lead info */}
            <Card className="rounded-2xl border-primary/20 bg-primary/5 shadow-none">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">Platform Verified & Managed</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      This property has been inspected and uploaded by a CampusShelter Agent.
                      We handle the verification, documentation, and coordination between you and the landlord
                      to ensure a safe and transparent rental experience.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            <Card className="rounded-2xl shadow-sm">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-medium">Agent Details</h3>
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 border-2 border-primary/10">
                    <AvatarImage src={property.landlord.avatar} />
                    <AvatarFallback className="bg-primary/5 text-primary font-bold">
                      {property.landlord.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">
                      {property.landlord.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {property.landlord.verified && (
                        <Badge variant="success">
                          <ShieldCheck className="w-3 h-3 mr-1" />
                          Verified Agent
                        </Badge>
                      )}
                    </p>
                  </div>
                </div>
                <Button
                  className="w-full rounded-xl gap-2"
                  onClick={() => window.location.href = `tel:${property.landlord.phone || '+2348000000000'}`}
                >
                  <Phone className="w-4 h-4" />
                  Call Agent
                </Button>
                <Button
                  variant="outline"
                  className="w-full rounded-xl gap-2 border-primary/20 text-primary hover:bg-primary/5"
                  asChild
                >
                  <Link to={`/messages/${property.landlord.id}`}>
                    <MessageSquare className="w-4 h-4" />
                    Message Agent
                  </Link>
                </Button>
                <p className="text-[10px] text-center text-muted-foreground">
                  Typical response time: <span className="font-semibold text-foreground">&lt; 2 hours</span>
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm border-primary/10">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">Request Booking</h3>
                  <Badge variant="outline" className="font-normal text-primary border-primary/20">Fast Track</Badge>
                </div>

                <p className="text-sm text-muted-foreground">
                  Submit a request to book this property. Our agents will review and coordinate with the landlord.
                </p>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full rounded-xl gradient-primary shadow-lg shadow-primary/20">
                      Reserve this Home
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Complete Your Booking Request</DialogTitle>
                      <DialogDescription>
                        Set your preferred lease dates. The agent will contact you to finalize the agreement.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="start">Lease Start Date</Label>
                        <Input
                          id="start"
                          type="date"
                          value={bookingDates.start}
                          onChange={(e) => setBookingDates({ ...bookingDates, start: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="end">Lease End Date</Label>
                        <Input
                          id="end"
                          type="date"
                          value={bookingDates.end}
                          onChange={(e) => setBookingDates({ ...bookingDates, end: e.target.value })}
                        />
                      </div>
                      <div className="bg-muted/50 p-3 rounded-lg flex gap-3 items-start">
                        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Your contact information (name, email, phone) will be shared with the verified agent to facilitate this booking.
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        className="w-full gradient-primary"
                        onClick={async () => {
                          if (!isAuthenticated) {
                            toast({ title: "Auth required", description: "Please sign in to book a property.", variant: "destructive" });
                            navigate("/login");
                            return;
                          }
                          setIsBookingLoading(true);
                          try {
                            await createBooking({
                              propertyId: property.id,
                              leaseStart: bookingDates.start,
                              leaseEnd: bookingDates.end
                            });
                            toast({ title: "Request Sent!", description: "An agent will contact you shortly." });
                            navigate("/my-bookings");
                          } catch (err: any) {
                            toast({ title: "Booking failed", description: err.message, variant: "destructive" });
                          } finally {
                            setIsBookingLoading(false);
                          }
                        }}
                        disabled={isBookingLoading}
                      >
                        {isBookingLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Confirm Booking Request
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <div className="flex items-center gap-2 text-[10px] text-muted-foreground justify-center">
                  <ShieldCheck className="w-3 h-3 text-success" />
                  Secure & Protected Transaction
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-medium">Schedule a Tour</h3>

                <div className="space-y-2">
                  <Label>Select date</Label>
                  <div className="relative">
                    <Input type="date" />
                    <Calendar className="absolute right-3 top-3 h-4 w-4 opacity-50" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Available time</Label>
                  <Input placeholder="12:00 PM" />
                </div>

                <Button className="w-full rounded-xl">Book Appointment</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </section>
  );
}

function PropertyReviews({ propertyId }: { propertyId: string }) {
  const { data: response, isLoading } = useQuery({
    queryKey: ["property-reviews", propertyId],
    queryFn: () => fetchPropertyReviews(propertyId),
  });

  const reviews = response?.data || [];

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">Student Reviews</CardTitle>
          <CardDescription>What others say about this place.</CardDescription>
        </div>
        <div className="flex items-center gap-1 text-warning">
          <Star className="w-5 h-5 fill-current" />
          <span className="font-bold text-xl">{reviews.length > 0 ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1) : "0.0"}</span>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map(review => (
              <div key={review.id} className="space-y-2 border-b border-border/50 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">{review.student?.name || "Student"}</span>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-warning text-warning" : "text-muted-foreground"}`} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{review.comment}</p>
                <p className="text-[10px] text-muted-foreground uppercase">{new Date(review.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground italic">No reviews yet. Be the first to leave one!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="space-y-1">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

const formatNaira = (amount: number): string => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
};
