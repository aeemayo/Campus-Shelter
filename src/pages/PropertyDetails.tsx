import { useState, useMemo, useEffect } from "react";
import { useFutaGates } from "@/hooks/useFutaGates";
import SEO from "@/components/SEO";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchProperty } from "@/services/properties";
import { fetchPropertyReviews } from "@/services/reviews";
import { toFrontendProperty } from "@/lib/propertyAdapter";
import {
  Loader2,
  ArrowLeft,
  Phone,
  ShieldCheck,
  Info,
  Star,
  TrendingUp,
  MessageSquare,
  ChevronRight,
  Check,
  Pencil,
  MapPin,
  Bed,
  Bath,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { createBooking } from "@/services/bookings";
import { useToast } from "@/hooks/use-toast";
import { useUserActivity } from "@/hooks/use-user-activity";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PropertyDetailsSkeleton } from "@/components/ui/skeleton-loaders";

interface ParamTypes extends Record<string, string> {
  id: string;
}

export default function RentalDetailsPage() {
  const { id } = useParams<ParamTypes>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { distancesTo } = useFutaGates();
  const { markViewed } = useUserActivity(isAuthenticated ? user?.id : undefined);
  const { toast } = useToast();
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [bookingDates, setBookingDates] = useState({
    start: new Date().toISOString().split("T")[0],
    end: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      .toISOString()
      .split("T")[0],
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
    if (property && !activeImage) setActiveImage(property.images[0]);
    if (id) markViewed(id);
    if (property && user?.role === "LANDLORD" && property.landlord?.id !== user.id) {
      navigate("/landlord", { replace: true });
    }
  }, [property, activeImage, id, markViewed, user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <PropertyDetailsSkeleton />
        <Footer />
      </div>
    );
  }

  if (isError || !property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-semibold tracking-tight">Property not found</h2>
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
    <section className="min-h-screen bg-background">
      <SEO
        title={property.title}
        description={
          property.description?.slice(0, 160) ||
          `${property.title} - Student accommodation near FUTA.`
        }
        path={`/properties/${property.id}`}
        image={property.images?.[0]}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Accommodation",
          name: property.title,
          description: property.description,
          image: property.images,
          url: `https://campus-shelter.vercel.app/properties/${property.id}`,
          address: {
            "@type": "PostalAddress",
            addressLocality: property.location,
          },
          offers: {
            "@type": "Offer",
            price: property.price,
            priceCurrency: "NGN",
            availability: "https://schema.org/InStock",
          },
          numberOfBedrooms: property.bedrooms,
          numberOfBathroomsTotal: property.bathrooms,
          amenityFeature: property.amenities?.map((a: string) => ({
            "@type": "LocationFeatureSpecification",
            name: a,
            value: true,
          })),
        }}
      />
      <Header />

      <div className="pt-24 max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Breadcrumb + title */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 gap-1.5"
                onClick={() => navigate("/properties")}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Properties
              </Button>
              <ChevronRight className="w-3 h-3" />
              <span className="text-foreground truncate max-w-xs">{property.title}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {property.title}
            </h1>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              {property.location}
              <span className="text-muted-foreground/50">·</span>
              <span>{property.distance}</span>
            </div>
          </div>
          {user?.role === "LANDLORD" && property.landlord?.id === user.id && (
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 gap-2 rounded-lg"
              onClick={() => navigate(`/properties/edit/${property.id}`)}
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </Button>
          )}
        </div>

        {/* Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-3"
        >
          <div
            className="md:col-span-2 relative group overflow-hidden rounded-xl cursor-pointer"
            onClick={() => {
              setLightboxIndex(
                property.images.indexOf(activeImage || property.images[0])
              );
              setIsLightboxOpen(true);
            }}
          >
            <img
              src={activeImage || property.images[0]}
              alt="main"
              className="h-[420px] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-all duration-300">
              <p className="text-sm font-medium">View gallery</p>
            </div>
            {!property.available && (
              <div className="absolute top-3 left-3">
                <Badge variant="destructive" className="text-[10px] rounded-md">Occupied</Badge>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {thumbnails.map((img, i) => {
              const isLastVisible = !showAll && i === 3 && remaining > 0;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.05 * i }}
                  className="relative h-[200px] cursor-pointer overflow-hidden rounded-xl group"
                  onClick={() => {
                    if (isLastVisible) {
                      setLightboxIndex(4);
                      setIsLightboxOpen(true);
                    } else {
                      setActiveImage(img);
                    }
                  }}
                >
                  <img
                    src={img}
                    alt={`gallery-${i}`}
                    className={cn(
                      "h-full w-full object-cover transition duration-300 group-hover:scale-105",
                      activeImage === img ? "brightness-75" : ""
                    )}
                  />
                  {activeImage === img && !isLastVisible && (
                    <div className="absolute inset-0 border-2 border-primary rounded-xl z-10" />
                  )}
                  {isLastVisible && (
                    <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center text-white">
                      <span className="text-2xl font-bold">+{remaining}</span>
                      <span className="text-xs mt-0.5">more</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Lightbox */}
        <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
          <DialogContent className="max-w-[95vw] h-[90vh] p-0 bg-black/95 border-none flex flex-col overflow-hidden rounded-2xl">
            <DialogHeader className="p-6 absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/70 to-transparent">
              <DialogTitle className="text-white font-semibold">{property.title}</DialogTitle>
              <DialogDescription className="text-white/50 text-xs">
                {lightboxIndex + 1} / {property.images.length}
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 relative flex items-center justify-center p-6 pt-20">
              <AnimatePresence mode="wait">
                <motion.img
                  key={lightboxIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  src={property.images[lightboxIndex]}
                  alt={`gallery-${lightboxIndex}`}
                  className="max-w-full max-h-full object-contain rounded-xl"
                />
              </AnimatePresence>
              <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10 rounded-full bg-white/10 text-white pointer-events-auto hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((p) => (p > 0 ? p - 1 : property.images.length - 1));
                  }}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10 rounded-full bg-white/10 text-white pointer-events-auto hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((p) => (p < property.images.length - 1 ? p + 1 : 0));
                  }}
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="p-4 overflow-x-auto">
              <div className="flex gap-2 justify-center">
                {property.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setLightboxIndex(i)}
                    className={cn(
                      "w-16 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0",
                      lightboxIndex === i
                        ? "border-primary opacity-100"
                        : "border-transparent opacity-40 hover:opacity-70"
                    )}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Stats */}
            <Card className="border-border/60">
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6">
                <Stat
                  label="Yearly Rent"
                  value={formatNaira(property.price)}
                  icon={TrendingUp}
                />
                <Stat label="Bedrooms" value={`${property.bedrooms} bed`} icon={Bed} />
                <Stat label="Bathrooms" value={`${property.bathrooms} bath`} icon={Bath} />
                {property.latitude && property.longitude ? (
                  distancesTo(property.latitude, property.longitude)
                    .slice(0, 1)
                    .map(({ gate, km, walkMinutes }) => (
                      <Stat
                        key={gate.id}
                        label={gate.label}
                        value={walkMinutes < 60 ? `${walkMinutes} min walk` : `${km} km`}
                        icon={MapPin}
                      />
                    ))
                ) : (
                  <Stat label="FUTA Distance" value={property.distance} icon={MapPin} />
                )}
              </CardContent>
            </Card>

            {/* Gate distances (if coordinates available) */}
            {property.latitude && property.longitude && (
              <div className="grid grid-cols-3 gap-3">
                {distancesTo(property.latitude, property.longitude).map(({ gate, km, walkMinutes }) => (
                  <div
                    key={gate.id}
                    className="flex items-center gap-2.5 p-3 rounded-lg border border-border/60 bg-muted/20"
                  >
                    <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">{gate.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {walkMinutes < 60 ? `${walkMinutes} min walk` : `${km} km`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tabs */}
            <Tabs defaultValue="description" className="space-y-4">
              <TabsList className="bg-muted/40 border border-border/60 p-1 rounded-lg h-auto w-full justify-start gap-0.5 flex-wrap">
                <TabsTrigger value="description" className="rounded-md text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">Description</TabsTrigger>
                <TabsTrigger value="info" className="rounded-md text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">Details</TabsTrigger>
                <TabsTrigger value="features" className="rounded-md text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">Amenities</TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-md text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="description">
                <Card className="border-border/60">
                  <CardContent className="p-5 text-sm text-muted-foreground leading-relaxed">
                    {property.description}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="info">
                <Card className="border-border/60">
                  <CardContent className="p-5 space-y-3">
                    {[
                      { label: "Furnishing", value: property.furnished ? "Furnished" : "Unfurnished" },
                      {
                        label: "Available From",
                        value: new Date(property.availableFrom || "").toLocaleDateString("en-US", {
                          month: "long", day: "numeric", year: "numeric",
                        }),
                      },
                      { label: "Lease Duration", value: "12-month standard lease" },
                      {
                        label: "Electricity Backup",
                        value: property.amenities.includes("Electricity Backup") ? "Yes" : "No",
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center py-2.5 border-b border-border/40 last:border-0"
                      >
                        <span className="text-sm text-muted-foreground">{item.label}</span>
                        <span className="text-sm font-medium text-foreground">{item.value}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="features">
                <Card className="border-border/60">
                  <CardContent className="p-5 grid grid-cols-2 gap-3">
                    {property.amenities.length > 0 ? (
                      property.amenities.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <span className="text-sm text-foreground">{item}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground col-span-2">No amenities listed.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews">
                <PropertyReviews propertyId={id!} />
              </TabsContent>
            </Tabs>

            {/* Verified badge */}
            {property.landlord?.verified && (
              <div className="flex items-start gap-3 p-4 rounded-lg border border-primary/20 bg-primary/5">
                <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Verified property</p>
                  <p className="text-sm text-muted-foreground">
                    This listing has been reviewed and verified by CampusShelter.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Price */}
            <Card className="border-border/60">
              <CardContent className="p-5 space-y-1.5">
                <p className="text-2xl font-bold text-foreground">{formatNaira(property.price)}</p>
                <p className="text-sm text-muted-foreground">per year</p>
                {property.priceWeekly && (
                  <p className="text-xs text-muted-foreground">
                    {formatNaira(property.priceWeekly)} / week
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Landlord */}
            <Card className="border-border/60">
              <CardContent className="p-5 space-y-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Landlord</p>
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={(property.landlord as any).avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                      {property.landlord.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground text-sm">{property.landlord.name}</p>
                    {property.landlord.verified && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <ShieldCheck className="w-3 h-3 text-primary" />
                        <span className="text-xs text-primary">Verified</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    className="w-full gradient-primary rounded-lg h-10"
                    onClick={() =>
                      (window.location.href = `tel:${property.landlord.phone || "+2348000000000"}`)
                    }
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call Landlord
                  </Button>
                  <Button variant="outline" className="w-full rounded-lg h-10" asChild>
                    <Link to={`/messages/${property.landlord.id}`}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Send Message
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Book */}
            <Card className="border-border/60">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-foreground">Book this property</p>
                  {property.available ? (
                    <Badge variant="success" className="text-[10px] rounded-md">Available</Badge>
                  ) : (
                    <Badge variant="destructive" className="text-[10px] rounded-md">Occupied</Badge>
                  )}
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full gradient-primary rounded-lg h-10">
                      Book Now
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[440px] rounded-xl">
                    <DialogHeader>
                      <DialogTitle className="text-lg font-semibold">Request Booking</DialogTitle>
                      <DialogDescription className="text-sm text-muted-foreground">
                        Choose your lease start and end dates. The landlord will confirm within 24 hours.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-sm">Move-in date</Label>
                          <Input
                            type="date"
                            className="rounded-lg h-10"
                            value={bookingDates.start}
                            onChange={(e) =>
                              setBookingDates({ ...bookingDates, start: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-sm">Move-out date</Label>
                          <Input
                            type="date"
                            className="rounded-lg h-10"
                            value={bookingDates.end}
                            onChange={(e) =>
                              setBookingDates({ ...bookingDates, end: e.target.value })
                            }
                          />
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 p-3 rounded-lg bg-muted/40 border border-border/60">
                        <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Your contact details will be shared with the landlord to process this booking.
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        className="w-full gradient-primary rounded-lg h-10"
                        onClick={async () => {
                          if (!isAuthenticated) {
                            toast({
                              title: "Sign in required",
                              description: "Please sign in to book a property.",
                              variant: "destructive",
                            });
                            navigate("/login");
                            return;
                          }
                          setIsBookingLoading(true);
                          try {
                            await createBooking({
                              propertyId: property.id,
                              leaseStart: bookingDates.start,
                              leaseEnd: bookingDates.end,
                            });
                            toast({ title: "Booking request sent!", description: "The landlord will contact you shortly." });
                            navigate("/my-bookings");
                          } catch (err: any) {
                            toast({ title: "Booking failed", description: err.message, variant: "destructive" });
                          } finally {
                            setIsBookingLoading(false);
                          }
                        }}
                        disabled={isBookingLoading}
                      >
                        {isBookingLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        Confirm Booking
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
                  <Shield className="w-3.5 h-3.5" />
                  Verified and safe to book
                </div>
              </CardContent>
            </Card>

            {/* Schedule inspection */}
            <Card className="border-border/60">
              <CardContent className="p-5 space-y-3">
                <p className="font-medium text-foreground text-sm">Schedule inspection</p>
                <div className="space-y-2">
                  <div className="relative">
                    <Input type="date" className="rounded-lg h-10 pl-9" />
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input placeholder="Preferred time (e.g. 12:00 PM)" className="rounded-lg h-10" />
                </div>
                <Button variant="outline" className="w-full rounded-lg h-10 text-sm">
                  Request Inspection
                </Button>
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
  const avg =
    reviews.length > 0
      ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <Card className="border-border/60">
      <CardHeader className="p-5 pb-4 border-b border-border/40">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Reviews</CardTitle>
          {avg && (
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-sm">{avg}</span>
              <span className="text-xs text-muted-foreground">({reviews.length})</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-5">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-5">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="space-y-2 border-b border-border/40 pb-5 last:border-0 last:pb-0"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-primary uppercase">
                      {review.student?.name?.[0] || "S"}
                    </div>
                    <span className="font-medium text-sm">{review.student?.name || "Student"}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground/25"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-muted-foreground leading-relaxed pl-10">
                    {review.comment}
                  </p>
                )}
                <p className="text-xs text-muted-foreground/50 pl-10">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <MessageSquare className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No reviews yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon?: React.ElementType;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        <p className="text-xs">{label}</p>
      </div>
      <p className="text-base font-semibold text-foreground">{value}</p>
    </div>
  );
}

const formatNaira = (amount: number): string =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
