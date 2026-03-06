import { useState, useMemo, useEffect } from "react";
import SEO from "@/components/SEO";
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
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchProperty } from "@/services/properties";
import { fetchPropertyReviews } from "@/services/reviews";
import { toFrontendProperty } from "@/lib/propertyAdapter";
import { Loader2, ArrowLeft, Phone, ShieldCheck, Info, Star, TrendingUp, MessageSquare, ChevronRight, Check } from "lucide-react";
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
  const { markViewed } = useUserActivity(isAuthenticated ? user?.id : undefined);
  const { toast } = useToast();
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
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
    if (id) {
      markViewed(id);
    }
  }, [property, activeImage, id, markViewed]);

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
        <h2 className="text-2xl font-bold tracking-tight">Property not found</h2>
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
      <SEO
        title={property.title}
        description={property.description?.slice(0, 160) || `${property.title} - Student accommodation near FUTA.`}
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
      <div className="pt-24 max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">{property.title}</h1>
          <p className="text-muted-foreground">{property.location}</p>
        </div>
        {/* Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="md:col-span-2 relative group overflow-hidden rounded-[2rem] shadow-2xl">
            <img
              src={activeImage || property.images[0]}
              alt="main"
              className="h-[500px] w-full object-cover cursor-pointer transition-transform duration-700 group-hover:scale-105"
              onClick={() => {
                setLightboxIndex(property.images.indexOf(activeImage || property.images[0]));
                setIsLightboxOpen(true);
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute bottom-6 left-6 text-white opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
               <p className="font-bold text-lg">Click to expand gallery</p>
               <p className="text-sm opacity-80">{property.images.length} high-resolution captures</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {thumbnails.map((img, i) => {
              const isLastVisible = !showAll && i === 3 && remaining > 0;

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * i }}
                  className="relative h-[242px] w-full cursor-pointer overflow-hidden rounded-[1.5rem] shadow-lg group"
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
                      "h-full w-full object-cover transition duration-500 group-hover:scale-110",
                      activeImage === img ? "brightness-75" : "brightness-100"
                    )}
                  />

                  {activeImage === img && !isLastVisible && (
                    <div className="absolute inset-0 border-4 border-primary rounded-[1.5rem] z-10" />
                  )}

                  {isLastVisible && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white backdrop-blur-sm transition-all group-hover:bg-black/40">
                      <span className="text-3xl font-black">+{remaining}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Discover</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Lightbox Modal */}
        <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
          <DialogContent className="max-w-[95vw] h-[90vh] p-0 bg-black/95 border-none flex flex-col overflow-hidden rounded-[2rem]">
            <DialogHeader className="p-8 bg-gradient-to-b from-black/80 to-transparent z-20 absolute top-0 left-0 right-0">
              <DialogTitle className="text-white text-2xl font-black font-display tracking-tight">Gallery Exploration</DialogTitle>
              <DialogDescription className="text-white/60 font-medium uppercase tracking-widest text-xs">
                {property.title} — Item {lightboxIndex + 1} of {property.images.length}
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 relative flex items-center justify-center p-8">
              <AnimatePresence mode="wait">
                <motion.img
                  key={lightboxIndex}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  src={property.images[lightboxIndex]}
                  alt={`gallery-full-${lightboxIndex}`}
                  className="max-w-full max-h-full object-contain shadow-2xl rounded-2xl"
                />
              </AnimatePresence>

              {/* Navigation Controls */}
              <div className="absolute inset-0 flex items-center justify-between p-8 pointer-events-none">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-16 h-16 rounded-full bg-white/5 hover:bg-white/10 text-white pointer-events-auto backdrop-blur-xl border border-white/10 transition-all hover:scale-110"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((prev) => (prev > 0 ? prev - 1 : property.images.length - 1));
                  }}
                >
                  <ArrowLeft className="w-8 h-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-16 h-16 rounded-full bg-white/5 hover:bg-white/10 text-white pointer-events-auto backdrop-blur-xl border border-white/10 transition-all hover:scale-110"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((prev) => (prev < property.images.length - 1 ? prev + 1 : 0));
                  }}
                >
                  <ChevronRight className="w-8 h-8" />
                </Button>
              </div>
            </div>

            {/* Thumbnail Strip */}
            <div className="p-8 bg-gradient-to-t from-black/80 to-transparent overflow-x-auto">
              <div className="flex gap-4 justify-center min-w-max mx-auto px-4">
                {property.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setLightboxIndex(i)}
                    className={cn(
                      "w-24 h-16 rounded-xl overflow-hidden border-2 transition-all duration-300",
                      lightboxIndex === i ? "border-primary scale-110 shadow-lg shadow-primary/20" : "border-transparent opacity-40 hover:opacity-100"
                    )}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="thumb" />
                  </button>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <Card className="border-white/20 bg-white/5 backdrop-blur-2xl rounded-[1.5rem] shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-8 p-8">
                <Stat
                  label="Premium Rate"
                  value={`${formatNaira(property.price)}`}
                  subValue={property.priceType === "yearly" ? "Per Annum" : "Per Month"}
                  icon={TrendingUp}
                />
                <Stat label="Bedrooms" value={property.bedrooms} subValue="Private Spaces" icon={Info} />
                <Stat label="Bathrooms" value={property.bathrooms} subValue="Sanitary Units" icon={ShieldCheck} />
                <Stat label="FUTA Proximity" value={property.distance} subValue="Walking Distance" icon={Star} />
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="description" className="space-y-6">
              <TabsList className="bg-white/5 backdrop-blur-xl border border-white/10 p-1 rounded-2xl h-14">
                <TabsTrigger value="description" className="rounded-xl px-6 font-bold text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Description</TabsTrigger>
                <TabsTrigger value="info" className="rounded-xl px-6 font-bold text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Protocol</TabsTrigger>
                <TabsTrigger value="features" className="rounded-xl px-6 font-bold text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Amenities</TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-xl px-6 font-bold text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Insights</TabsTrigger>
                <TabsTrigger value="history" className="rounded-xl px-6 font-bold text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Metrics</TabsTrigger>
              </TabsList>

              <TabsContent value="description">
                <Card className="border-white/20 bg-white/5 backdrop-blur-2xl rounded-[1.5rem] shadow-2xl relative overflow-hidden">
                  <CardContent className="p-8 leading-relaxed text-base text-muted-foreground/80 space-y-4">
                     <p className="first-letter:text-4xl first-letter:font-bold first-letter:text-primary first-letter:mr-1 first-letter:float-left">
                       {property.description}
                     </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="info">
                <Card className="border-white/20 bg-white/5 backdrop-blur-2xl rounded-[1.5rem] shadow-2xl relative overflow-hidden">
                  <CardContent className="p-8 space-y-4">
                    {[
                      { label: "Furnishing Status", value: property.furnished ? "Fully Furnished" : "Unfurnished" },
                      { label: "Availability Date", value: new Date(property.availableFrom || '').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) },
                      { label: "Contract Duration", value: "Standard 12-Month Lease" },
                      { label: "Energy Solutions", value: property.amenities.includes("Electricity Backup") ? "Integrated Backup" : "None" },
                      { label: "External Entitles", value: "Policy available on request" }
                    ].map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center border-b border-white/5 pb-4 last:border-0 last:pb-0 group">
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60 group-hover:text-primary/70 transition-colors">{item.label}</span>
                        <span className="font-bold text-foreground tracking-tight">{item.value}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="features">
                <Card className="border-white/20 bg-white/5 backdrop-blur-2xl rounded-[1.5rem] shadow-2xl relative overflow-hidden">
                  <CardContent className="p-8 grid grid-cols-2 lg:grid-cols-3 gap-6">
                    {property.amenities.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 group">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                           <Check className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-sm text-muted-foreground group-hover:text-foreground transition-colors">{item}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews">
                <PropertyReviews propertyId={id!} />
              </TabsContent>

              <TabsContent value="history">
                <Card className="border-white/20 bg-white/5 backdrop-blur-2xl rounded-[1.5rem] shadow-2xl relative overflow-hidden">
                  <CardContent className="p-12 text-center">
                    <div className="w-20 h-20 rounded-3xl bg-secondary/10 flex items-center justify-center mx-auto mb-6 text-secondary shadow-lg shadow-secondary/5">
                      <TrendingUp className="w-10 h-10" />
                    </div>
                    <h4 className="text-xl font-bold mb-2">Market Stability Report</h4>
                    <p className="text-sm text-muted-foreground font-medium max-w-xs mx-auto mb-8">This property reflects current market excellence for the FUTA region.</p>
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl">
                       <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Current Valuation</span>
                       <span className="text-2xl font-black text-primary">{formatNaira(property.price)}</span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Agent Lead info */}
            <Card className="border-primary/20 bg-primary/5 backdrop-blur-xl rounded-[1.5rem] shadow-none overflow-hidden relative">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -mr-24 -mt-24 blur-3xl" />
              <CardContent className="p-8">
                <div className="flex gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 shadow-lg shadow-primary/5">
                    <ShieldCheck className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-foreground tracking-tight mb-2">Sanctuary Verification Protocol</h4>
                    <p className="text-muted-foreground/80 font-medium leading-relaxed">
                      Every dimension of this residence has been scrutinized by verified CampusShelter personnel.
                      Our protocol ensures transactional integrity, accurate documentation, and elite-tier coordination
                      throughout your tenancy.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            <Card className="border-white/20 bg-white/5 backdrop-blur-2xl rounded-[1.5rem] shadow-2xl overflow-hidden relative">
              <CardContent className="p-8 space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 border-b border-white/5 pb-4">Authorized Representative</h3>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="w-16 h-16 border-2 border-primary/20 p-1">
                      <AvatarImage src={property.landlord.avatar} className="rounded-full" />
                      <AvatarFallback className="bg-primary/5 text-primary font-black text-lg">
                        {property.landlord.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full flex items-center justify-center border-4 border-background">
                       <Check className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="font-black text-lg tracking-tight text-foreground">
                      {property.landlord.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-success/10 text-success border-success/20 font-bold text-[10px] uppercase tracking-widest px-2">
                        Tier 1 Agent
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <Button
                    className="h-14 rounded-2xl gap-3 font-black uppercase tracking-widest text-xs gradient-primary shadow-lg shadow-primary/20"
                    onClick={() => window.location.href = `tel:${property.landlord.phone || '+2348000000000'}`}
                  >
                    <Phone className="w-4 h-4" />
                    Secure Audio Link
                  </Button>
                  <Button
                    variant="outline"
                    className="h-14 rounded-2xl gap-3 border-white/10 bg-white/5 font-black uppercase tracking-widest text-xs hover:bg-white/10"
                    asChild
                  >
                    <Link to={`/messages/${property.landlord.id}`}>
                      <MessageSquare className="w-4 h-4" />
                      Digital Correspondence
                    </Link>
                  </Button>
                </div>

                <div className="flex items-center justify-center gap-2 p-4 bg-white/5 rounded-2xl border border-white/5">
                   <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                   <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Available for live briefing</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5 backdrop-blur-2xl rounded-[1.5rem] shadow-2xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl" />
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-primary/10 pb-4">
                  <h3 className="font-black text-xl tracking-tight text-foreground">Initiate Lease</h3>
                  <Badge className="bg-primary/20 text-primary border-primary/30 font-bold text-[10px] uppercase tracking-widest">Express Entry</Badge>
                </div>

                <p className="text-sm font-medium text-muted-foreground/80 leading-relaxed">
                  Join the elite cluster of residents. Submit your formal booking request for immediate agent priority.
                </p>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full h-16 rounded-2xl font-black uppercase tracking-widest text-xs gradient-primary shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                      Establish Residency
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px] border-white/20 bg-background/80 backdrop-blur-3xl p-10 rounded-[2rem]">
                    <DialogHeader className="space-y-4">
                      <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-lg shadow-primary/5 mb-2 mx-auto">
                         <Calendar className="w-8 h-8" />
                      </div>
                      <DialogTitle className="text-3xl font-black font-display text-center">Lease Configuration</DialogTitle>
                      <DialogDescription className="text-center font-medium text-muted-foreground/70">
                        Specify your tenure window. Our executive agents will finalize the logistics within 24 hours.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-8 py-8">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Arrival Date</Label>
                          <Input
                            id="start"
                            type="date"
                            className="h-14 rounded-2xl bg-white/5 border-white/10 focus:border-primary/40 focus:bg-white/10 font-bold"
                            value={bookingDates.start}
                            onChange={(e) => setBookingDates({ ...bookingDates, start: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Departure Date</Label>
                          <Input
                            id="end"
                            type="date"
                            className="h-14 rounded-2xl bg-white/5 border-white/10 focus:border-primary/40 focus:bg-white/10 font-bold"
                            value={bookingDates.end}
                            onChange={(e) => setBookingDates({ ...bookingDates, end: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="p-6 bg-primary/5 rounded-[1.5rem] border border-primary/20 flex gap-4 items-start relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl" />
                        <Info className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                        <p className="text-xs font-bold text-muted-foreground/80 leading-relaxed z-10">
                          PLATFORM PROTOCOL: Your secure identification and verification status will be relayed to the primary agent to expedite this transaction.
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        className="w-full h-16 rounded-2xl font-black uppercase tracking-widest text-xs gradient-primary shadow-2xl shadow-primary/30 mt-4"
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
                        {isBookingLoading ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : null}
                        Authorize Request
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 justify-center pt-4 border-t border-primary/10">
                  <ShieldCheck className="w-4 h-4 text-success opacity-70" />
                  Cryptographic Integrity Guaranteed
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/20 bg-white/5 backdrop-blur-2xl rounded-[1.5rem] shadow-2xl overflow-hidden relative group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
              <CardContent className="p-8 space-y-6">
                <h3 className="font-black text-xl tracking-tight text-foreground border-b border-white/5 pb-4">Schedule Inspection</h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Select Window</Label>
                    <div className="relative group">
                      <Input type="date" className="h-14 rounded-2xl bg-white/5 border-white/10 pl-12 focus:bg-white/10 focus:border-primary/40 font-bold" />
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Preferred Timeframe</Label>
                    <div className="relative group">
                      <Input placeholder="12:00 PM - 02:00 PM" className="h-14 rounded-2xl bg-white/5 border-white/10 pl-12 focus:bg-white/10 focus:border-primary/40 font-bold" />
                      <Info className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                    </div>
                  </div>
                </div>

                <Button className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs border border-white/10 bg-white/5 hover:bg-white/10 text-foreground shadow-lg transition-all group-hover:border-primary/30">
                  Request Authorization
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

  return (
    <Card className="border-white/20 bg-white/5 backdrop-blur-2xl rounded-[2rem] shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-warning/5 rounded-full -mr-32 -mt-32 blur-[80px]" />
      <CardHeader className="p-8 border-b border-white/5 bg-white/2">
        <div className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-black font-display tracking-tight mb-1">Student Intel</CardTitle>
            <CardDescription className="font-bold text-[10px] uppercase tracking-[0.3em] text-muted-foreground/50">Verified occupant feedback</CardDescription>
          </div>
          <div className="flex items-center gap-3 px-6 py-3 bg-warning/10 border border-warning/20 rounded-2xl shadow-lg shadow-warning/5">
            <Star className="w-6 h-6 fill-warning text-warning" />
            <span className="font-black text-2xl text-warning">{reviews.length > 0 ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1) : "0.0"}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary opacity-50" /></div>
        ) : reviews.length > 0 ? (
          <div className="space-y-8">
            {reviews.map(review => (
              <div key={review.id} className="space-y-4 border-b border-white/5 pb-8 last:border-0 last:pb-0 group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xs font-black text-primary uppercase">
                        {review.student?.name?.[0] || "S"}
                     </div>
                     <span className="font-black text-base tracking-tight">{review.student?.name || "Verified Student"}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-warning text-warning" : "text-muted-foreground/20"}`} />
                    ))}
                  </div>
                </div>
                <p className="text-muted-foreground/80 font-medium italic leading-relaxed pl-13">
                  "{review.comment}"
                </p>
                <div className="flex justify-end">
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/2 rounded-[1.5rem] border border-dashed border-white/10">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10">
               <MessageSquare className="w-6 h-6 text-muted-foreground/30" />
            </div>
            <p className="text-sm font-bold text-muted-foreground/50 uppercase tracking-widest">Awaiting verification Intel</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({ label, value, subValue, icon: Icon }: { label: string; value: string | number; subValue?: string; icon?: any }) {
  return (
    <div className="space-y-3 group">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:bg-primary group-hover:text-white transition-all duration-300">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div className="space-y-0.5">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 transition-colors group-hover:text-primary/70">{label}</p>
          <p className="text-xl font-black tracking-tight text-foreground">{value}</p>
          {subValue && <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">{subValue}</p>}
        </div>
      </div>
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
