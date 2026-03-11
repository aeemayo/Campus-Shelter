import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  fetchProperty,
  adminApproveProperty,
  adminDeleteProperty,
} from "@/services/properties";
import { toFrontendProperty } from "@/lib/propertyAdapter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ChevronRight,
  MapPin,
  Bed,
  Bath,
  Calendar,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  Wifi,
  Zap,
  Droplets,
  ShieldCheck,
  Sofa,
  User,
  Mail,
  Phone,
  Clock,
  Home,
  Trash2,
  Pencil,
  Star,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function AdminPropertyReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionNote, setRejectionNote] = useState("");

  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["property", id],
    queryFn: () => fetchProperty(id!),
    enabled: !!id,
  });

  const property = useMemo(() => {
    return response?.data ? toFrontendProperty(response.data) : null;
  }, [response]);

  const raw = response?.data;

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await adminApproveProperty(id!, "APPROVED");
      toast({
        title: "Property Approved",
        description: "The listing is now live on the platform.",
      });
      refetch();
    } catch {
      toast({
        title: "Error",
        description: "Failed to approve property.",
        variant: "destructive",
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = () => {
    setRejectionNote("");
    setShowRejectDialog(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectionNote.trim()) return;
    setIsRejecting(true);
    try {
      await adminApproveProperty(id!, "REJECTED", rejectionNote.trim());
      toast({
        title: "Property Rejected",
        description: "The listing has been rejected with a note.",
      });
      setShowRejectDialog(false);
      refetch();
    } catch {
      toast({
        title: "Error",
        description: "Failed to reject property.",
        variant: "destructive",
      });
    } finally {
      setIsRejecting(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this property? This cannot be undone.",
      )
    )
      return;
    setIsDeleting(true);
    try {
      await adminDeleteProperty(id!);
      toast({
        title: "Property Deleted",
        description: "The property has been removed.",
      });
      navigate("/admin");
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete property.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header bgColor="white" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (isError || !property || !raw) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header bgColor="white" />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            Property not found
          </h2>
          <Button onClick={() => navigate("/admin")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const statusBadge =
    property.status === "APPROVED" || property.approved ? (
      <Badge variant="success" className="text-sm px-3 py-1">
        Approved
      </Badge>
    ) : property.status === "REJECTED" ? (
      <Badge variant="destructive" className="text-sm px-3 py-1">
        Rejected
      </Badge>
    ) : (
      <Badge variant="warning" className="text-sm px-3 py-1">
        Pending Review
      </Badge>
    );

  const roomTypeLabels: Record<string, string> = {
    "single-room": "Single Room",
    "self-con": "Self-Contained",
    "mini-flat": "Mini Flat",
    "luxury-flat": "Luxury Flat",
  };

  const amenityIcons: Record<string, React.ReactNode> = {
    "Wi-Fi": <Wifi className="w-4 h-4" />,
    "Electricity Backup": <Zap className="w-4 h-4" />,
    "Water Supply": <Droplets className="w-4 h-4" />,
    Security: <ShieldCheck className="w-4 h-4" />,
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO title={`Review: ${property.title}`} noIndex />
      <Header bgColor="white" />

      <main className="flex-1 pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 gap-1.5"
              onClick={() => navigate("/admin")}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Admin
            </Button>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground">Property Review</span>
          </div>

          {/* Header with status + actions */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  {property.title}
                </h1>
                {statusBadge}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                {property.location}
                <span className="text-muted-foreground/50">·</span>
                <span>{property.distance}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Submitted{" "}
                {new Date(raw.createdAt).toLocaleDateString("en-NG", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                {raw.updatedAt !== raw.createdAt && (
                  <>
                    {" "}
                    · Updated{" "}
                    {new Date(raw.updatedAt).toLocaleDateString("en-NG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-lg"
                asChild
              >
                <Link to={`/properties/${property.id}`}>
                  <ExternalLink className="w-3.5 h-3.5" />
                  Public View
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-lg"
                asChild
              >
                <Link to={`/admin/properties/edit/${property.id}`}>
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </Link>
              </Button>
              {property.status !== "APPROVED" && !property.approved ? (
                <Button
                  size="sm"
                  className="gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={handleApprove}
                  disabled={isApproving}
                >
                  {isApproving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  Approve
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 rounded-lg text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={handleReject}
                  disabled={isRejecting}
                >
                  {isRejecting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  Deactivate
                </Button>
              )}
              {property.status === "REJECTED" && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="gap-2 rounded-lg"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  Delete
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Images + Description */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image gallery */}
              <Card className="border-border/60 overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    Photos ({property.images.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  {property.images.length > 0 ? (
                    <div className="space-y-3">
                      {/* Main image */}
                      <div
                        className="relative rounded-xl overflow-hidden cursor-pointer group"
                        onClick={() => {
                          setLightboxIndex(0);
                          setLightboxOpen(true);
                        }}
                      >
                        <img
                          src={property.images[0]}
                          alt={property.title}
                          className="w-full h-[320px] object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      {/* Thumbnail grid */}
                      {property.images.length > 1 && (
                        <div className="grid grid-cols-4 gap-2">
                          {property.images.slice(1, 5).map((img, i) => (
                            <div
                              key={i}
                              className="relative h-20 rounded-lg overflow-hidden cursor-pointer group"
                              onClick={() => {
                                setLightboxIndex(i + 1);
                                setLightboxOpen(true);
                              }}
                            >
                              <img
                                src={img}
                                alt={`Photo ${i + 2}`}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              />
                              {i === 3 && property.images.length > 5 && (
                                <div className="absolute inset-0 bg-black/55 flex items-center justify-center text-white font-bold">
                                  +{property.images.length - 5}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-48 rounded-xl bg-muted/30 flex items-center justify-center">
                      <p className="text-sm text-muted-foreground">
                        No images uploaded
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Description */}
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {property.description || "No description provided."}
                  </p>
                </CardContent>
              </Card>

              {/* Amenities */}
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    Amenities & Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      {
                        label: "Furnished",
                        value: raw.furnished,
                        icon: <Sofa className="w-4 h-4" />,
                      },
                      {
                        label: "Wi-Fi",
                        value: raw.wifi,
                        icon: <Wifi className="w-4 h-4" />,
                      },
                      {
                        label: "Electricity Backup",
                        value: raw.electricityBackup,
                        icon: <Zap className="w-4 h-4" />,
                      },
                      {
                        label: "Water Supply",
                        value: raw.water,
                        icon: <Droplets className="w-4 h-4" />,
                      },
                      {
                        label: "Security",
                        value: raw.security,
                        icon: <ShieldCheck className="w-4 h-4" />,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={cn(
                          "flex items-center gap-2.5 p-3 rounded-lg border text-sm",
                          item.value
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400"
                            : "bg-muted/30 border-border/40 text-muted-foreground",
                        )}
                      >
                        {item.icon}
                        <span className="font-medium">{item.label}</span>
                        {item.value ? (
                          <CheckCircle2 className="w-3.5 h-3.5 ml-auto" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 ml-auto opacity-40" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Inspection Slots */}
              {property.inspectionSlots &&
                property.inspectionSlots.length > 0 && (
                  <Card className="border-border/60">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        Inspection Slots ({property.inspectionSlots.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {property.inspectionSlots.map((slot, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="text-xs px-3 py-1.5 font-medium"
                          >
                            <Clock className="w-3 h-3 mr-1.5" />
                            {slot}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
            </div>

            {/* Right column - Property details + Landlord info */}
            <div className="space-y-6">
              {/* Rejection note banner */}
              {raw.rejectionNote && (
                <Card className="border-destructive/30 bg-destructive/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-destructive flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Rejection Reason
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-destructive/80 whitespace-pre-wrap">{raw.rejectionNote}</p>
                  </CardContent>
                </Card>
              )}

              {/* Quick facts */}
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Property Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    className={`grid gap-3 ${raw.priceWeekly ? "grid-cols-2" : "grid-cols-1"}`}
                  >
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/40 text-center">
                      <p className="text-xs text-muted-foreground mb-1">
                        Monthly
                      </p>
                      <p className="text-lg font-bold text-foreground">
                        {raw.priceMonthly?.toLocaleString("en-NG", {
                          style: "currency",
                          currency: "NGN",
                          maximumFractionDigits: 0,
                        })}
                      </p>
                    </div>
                    {raw.priceWeekly && (
                      <div className="p-3 rounded-lg bg-muted/30 border border-border/40 text-center">
                        <p className="text-xs text-muted-foreground mb-1">
                          Weekly
                        </p>
                        <p className="text-lg font-bold text-foreground">
                          {raw.priceWeekly.toLocaleString("en-NG", {
                            style: "currency",
                            currency: "NGN",
                            maximumFractionDigits: 0,
                          })}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        icon: <Home className="w-4 h-4" />,
                        label: "Type",
                        value: roomTypeLabels[property.type] || property.type,
                      },
                      {
                        icon: <Bed className="w-4 h-4" />,
                        label: "Rooms",
                        value: raw.rooms,
                      },
                      {
                        icon: <Bath className="w-4 h-4" />,
                        label: "Bathrooms",
                        value: raw.bathrooms,
                      },
                      {
                        icon: <MapPin className="w-4 h-4" />,
                        label: "Distance",
                        value: property.distance,
                      },
                      {
                        icon: <Calendar className="w-4 h-4" />,
                        label: "Available From",
                        value: raw.availableFrom
                          ? new Date(raw.availableFrom).toLocaleDateString(
                              "en-NG",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )
                          : "Not set",
                      },
                      {
                        icon: <Star className="w-4 h-4" />,
                        label: "Rating",
                        value:
                          property.rating > 0
                            ? `${property.rating} (${property.reviewCount} reviews)`
                            : "No reviews yet",
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between text-sm py-2 border-b border-border/30 last:border-0"
                      >
                        <span className="flex items-center gap-2 text-muted-foreground">
                          {item.icon}
                          {item.label}
                        </span>
                        <span className="font-medium text-foreground">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {raw.latitude && raw.longitude && (
                    <div className="pt-1">
                      <p className="text-xs text-muted-foreground mb-1">
                        Coordinates
                      </p>
                      <p className="text-xs font-mono text-foreground">
                        {raw.latitude.toFixed(6)}, {raw.longitude.toFixed(6)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Landlord info */}
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    Landlord Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">
                        {property.landlord?.name || "Unknown"}
                      </p>
                      {property.landlord?.verifiedAt && (
                        <Badge
                          variant="outline"
                          className="text-[10px] mt-0.5 text-emerald-600 border-emerald-200"
                        >
                          <ShieldCheck className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>

                  {property.landlord?.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-3.5 h-3.5" />
                      <span className="truncate">
                        {property.landlord.email}
                      </span>
                    </div>
                  )}
                  {property.landlord?.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-3.5 h-3.5" />
                      {property.landlord.phone}
                    </div>
                  )}

                  <p className="text-[11px] text-muted-foreground/60 pt-1">
                    Landlord ID: {raw.landlordId}
                  </p>
                </CardContent>
              </Card>

              {/* Metadata */}
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Property ID</span>
                    <span className="font-mono text-foreground truncate ml-2 max-w-[160px]">
                      {raw.id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Created</span>
                    <span className="text-foreground">
                      {new Date(raw.createdAt).toLocaleString("en-NG")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Updated</span>
                    <span className="text-foreground">
                      {new Date(raw.updatedAt).toLocaleString("en-NG")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bookings</span>
                    <span className="text-foreground">
                      {raw._count?.bookings ?? 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reviews</span>
                    <span className="text-foreground">
                      {raw._count?.reviews ?? 0}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Rejection Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Property</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this listing. The landlord will see this note and can edit &amp; resubmit.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Textarea
              placeholder="Explain why this property is being rejected..."
              value={rejectionNote}
              onChange={(e) => setRejectionNote(e.target.value)}
              rows={4}
              maxLength={2000}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {rejectionNote.length}/2000
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmReject}
              disabled={!rejectionNote.trim() || isRejecting}
            >
              {isRejecting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
              ) : (
                <XCircle className="w-3.5 h-3.5 mr-1" />
              )}
              Reject Property
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className=" w-full md:w-auto object-contain h-[90vh] p-0 bg-black/95 border-none flex flex-col overflow-hidden rounded-2xl">
          <DialogHeader className="p-6 absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/70 to-transparent">
            <DialogTitle className="text-white font-semibold">
              {property.title}
            </DialogTitle>
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
                alt={`Photo ${lightboxIndex + 1}`}
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
                  setLightboxIndex((p) =>
                    p > 0 ? p - 1 : property.images.length - 1,
                  );
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
                  setLightboxIndex((p) =>
                    p < property.images.length - 1 ? p + 1 : 0,
                  );
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
                  type="button"
                  aria-label={`View photo ${i + 1}`}
                  onClick={() => setLightboxIndex(i)}
                  className={cn(
                    "w-16 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0",
                    lightboxIndex === i
                      ? "border-primary opacity-100"
                      : "border-transparent opacity-40 hover:opacity-70",
                  )}
                >
                  <img
                    src={img}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
