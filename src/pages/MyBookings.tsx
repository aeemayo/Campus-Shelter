import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMyBookings, type Booking } from "@/services/bookings";
import { createReview } from "@/services/reviews";
import { createMaintenanceRequest } from "@/services/maintenance";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Calendar,
  MapPin,
  Clock,
  Loader2,
  Home,
  ChevronRight,
  Phone,
  FileText,
  Star,
  Wrench,
} from "lucide-react";
import { StatusBadge } from "@/lib/status-badge";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const MyBookings = () => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [reviewTarget, setReviewTarget] = useState<Booking | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");

  const [issueTarget, setIssueTarget] = useState<Booking | null>(null);
  const [issueDescription, setIssueDescription] = useState("");

  const prevStatusMap = useRef<Record<string, string>>({});

  const { data: response, isLoading } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: fetchMyBookings,
    enabled: isAuthenticated,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });

  const bookings = response?.data || [];

  // Notify when a booking status changes
  useEffect(() => {
    bookings.forEach((b) => {
      const prev = prevStatusMap.current[b.id];
      if (prev && prev !== b.status) {
        const title = b.status === "APPROVED" ? "Booking approved! 🎉" : "Booking update";
        const description =
          b.status === "APPROVED"
            ? `Your booking for "${b.property?.title}" was approved by the landlord.`
            : `Your booking for "${b.property?.title}" was ${b.status.toLowerCase()}.`;
        toast({
          title,
          description,
          variant: b.status === "REJECTED" ? "destructive" : "default",
        });
      }
      prevStatusMap.current[b.id] = b.status;
    });
  }, [bookings, toast]);

  const reviewMutation = useMutation({
    mutationFn: () =>
      createReview({
        propertyId: reviewTarget!.propertyId,
        rating,
        comment: reviewComment,
      }),
    onSuccess: () => {
      toast({ title: "Review submitted!", description: "Thank you for your feedback." });
      setReviewTarget(null);
      setRating(0);
      setReviewComment("");
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
    },
    onError: (err: any) => {
      toast({ title: "Couldn't submit review", description: err.message, variant: "destructive" });
    },
  });

  const issueMutation = useMutation({
    mutationFn: () =>
      createMaintenanceRequest({
        propertyId: issueTarget!.propertyId,
        description: issueDescription,
      }),
    onSuccess: () => {
      toast({ title: "Issue reported!", description: "The landlord has been notified." });
      setIssueTarget(null);
      setIssueDescription("");
    },
    onError: (err: any) => {
      toast({ title: "Couldn't report issue", description: err.message, variant: "destructive" });
    },
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="My Bookings"
        description="View and manage your accommodation bookings on CampusShelter."
        path="/my-bookings"
        noIndex
      />
      <Header />

      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Home className="w-4 h-4" />
            <Link to="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground">My Bookings</span>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">
                My <span className="text-primary">Bookings</span>
              </h1>
              <p className="text-muted-foreground mt-2">
                Track your accommodation requests and history.
              </p>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground">Fetching your bookings...</p>
              </div>
            ) : bookings.length > 0 ? (
              <div className="space-y-6">
                {bookings.map((booking) => (
                  <Card
                    key={booking.id}
                    className="overflow-hidden border-border/60 hover:border-primary/20 transition-all"
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="w-full md:w-64 h-48 md:h-auto overflow-hidden">
                        <img
                          src={
                            booking.property?.images?.[0] ||
                            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400"
                          }
                          alt={booking.property?.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 p-6">
                        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-foreground mb-1 tracking-tight">
                              {booking.property?.title || "Property Listing"}
                            </h3>
                            <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                              <MapPin className="w-4 h-4 text-primary" />
                              {booking.property?.location || "FUTA Area"}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <StatusBadge status={booking.status} />
                            <p className="text-xs text-muted-foreground">
                              Requested on{" "}
                              {new Date(booking.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                              <Calendar className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                                Lease Period
                              </p>
                              <p className="text-sm font-medium">
                                {new Date(booking.leaseStart).toLocaleDateString()} -{" "}
                                {new Date(booking.leaseEnd).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                              <Phone className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                                Annual Rent
                              </p>
                              <p className="text-sm font-medium">
                                ₦{(booking.property?.priceMonthly || 0).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/60">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/properties/${booking.propertyId}`}>
                              View Listing
                            </Link>
                          </Button>

                          <div className="flex items-center gap-2 flex-wrap">
                            {booking.status === "APPROVED" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="rounded-lg gap-1.5 text-muted-foreground"
                                  onClick={() => {
                                    setIssueTarget(booking);
                                    setIssueDescription("");
                                  }}
                                >
                                  <Wrench className="w-3.5 h-3.5" />
                                  Report Issue
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="rounded-lg gap-1.5"
                                  onClick={() => {
                                    setReviewTarget(booking);
                                    setRating(0);
                                    setReviewComment("");
                                  }}
                                >
                                  <Star className="w-3.5 h-3.5" />
                                  Rate Stay
                                </Button>
                                {booking.lease ? (
                                  <Button
                                    className="gradient-primary rounded-lg"
                                    size="sm"
                                    asChild
                                  >
                                    <a
                                      href={booking.lease.documentUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <FileText className="w-4 h-4 mr-1" />
                                      View Lease
                                    </a>
                                  </Button>
                                ) : (
                                  <Badge variant="warning">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Lease Pending
                                  </Badge>
                                )}
                              </>
                            )}
                          </div>
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
                <h3 className="text-xl font-semibold mb-2 tracking-tight">
                  No bookings yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  You haven't requested any accommodations yet.
                </p>
                <Button asChild>
                  <Link to="/properties">Browse Properties</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* ── Rate your stay dialog ── */}
      <Dialog
        open={!!reviewTarget}
        onOpenChange={(open) => !open && setReviewTarget(null)}
      >
        <DialogContent className="sm:max-w-[420px] rounded-xl">
          <DialogHeader>
            <DialogTitle>Rate your stay</DialogTitle>
            <DialogDescription>
              {reviewTarget?.property?.title} · Your review helps other students.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Star picker */}
            <div className="space-y-1.5">
              <Label className="text-sm">Rating</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={cn(
                        "w-7 h-7 transition-colors",
                        star <= (hoverRating || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground/40",
                      )}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-xs text-muted-foreground">
                  {["", "Poor", "Fair", "Good", "Very good", "Excellent"][rating]}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Comment (optional)</Label>
              <Textarea
                placeholder="Share your experience — facilities, landlord responsiveness, value for money..."
                className="resize-none rounded-lg text-sm h-24"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setReviewTarget(null)}
              disabled={reviewMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              className="gradient-primary rounded-lg"
              disabled={rating === 0 || reviewMutation.isPending}
              onClick={() => reviewMutation.mutate()}
            >
              {reviewMutation.isPending && (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              )}
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Report issue dialog ── */}
      <Dialog
        open={!!issueTarget}
        onOpenChange={(open) => !open && setIssueTarget(null)}
      >
        <DialogContent className="sm:max-w-[420px] rounded-xl">
          <DialogHeader>
            <DialogTitle>Report an issue</DialogTitle>
            <DialogDescription>
              {issueTarget?.property?.title} · Describe the problem and the
              landlord will be notified.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <Textarea
              placeholder="e.g. The bathroom tap is leaking, no electricity in one room..."
              className="resize-none rounded-lg text-sm h-28"
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIssueTarget(null)}
              disabled={issueMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              className="gradient-primary rounded-lg"
              disabled={!issueDescription.trim() || issueMutation.isPending}
              onClick={() => issueMutation.mutate()}
            >
              {issueMutation.isPending && (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              )}
              Send Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyBookings;
