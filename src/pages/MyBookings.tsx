import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMyBookings, cancelBooking, type Booking } from "@/services/bookings";
import { createReview } from "@/services/reviews";
import { createMaintenanceRequest } from "@/services/maintenance";
import { initializePayment, fetchPayments, type Payment } from "@/services/payments";
import { payFromWallet, fetchWallet } from "@/services/wallet";
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
  AlertCircle,
  Ban,
  CreditCard,
  ShieldAlert,
  CheckCircle2,
  Wallet,
  XCircle,
  TriangleAlert,
} from "lucide-react";
import { StatusBadge } from "@/lib/status-badge";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

/* ── Booking Progress Stepper ── */
const STEPS = ["Requested", "Approved", "Paid", "Active"] as const;

function getStepIndex(booking: Booking): number {
  if (booking.status === "REJECTED" || booking.status === "EVICTED" || booking.status === "CANCELLED") return -1;
  if (booking.paymentStatus === "PAID" && booking.status === "APPROVED") return 3; // Active
  if (booking.paymentStatus === "PAID") return 2;
  if (booking.status === "APPROVED") return 1;
  return 0; // PENDING = Requested
}

function BookingStepper({ booking }: { booking: Booking }) {
  const current = getStepIndex(booking);
  if (current === -1) return null; // Don't show for rejected/cancelled/evicted

  return (
    <div className="flex items-center gap-1 w-full mb-4">
      {STEPS.map((step, i) => {
        const done = i <= current;
        const active = i === current;
        return (
          <div key={step} className="flex items-center flex-1 gap-1">
            <div className="flex flex-col items-center gap-1 flex-1">
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all",
                  done
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                  active && "ring-2 ring-primary/30 ring-offset-1",
                )}
              >
                {done && i < current ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium leading-none",
                  done ? "text-primary" : "text-muted-foreground",
                )}
              >
                {step}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 rounded-full -mt-4",
                  i < current ? "bg-primary" : "bg-muted",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

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

  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);

  const prevStatusMap = useRef<Record<string, string>>({});

  const { data: response, isLoading } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: fetchMyBookings,
    enabled: isAuthenticated,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });

  const bookings = response?.data || [];

  // Fetch student's payment history
  const { data: paymentsResponse } = useQuery({
    queryKey: ["my-payments"],
    queryFn: () => fetchPayments(1, 50),
    enabled: isAuthenticated,
  });
  const myPayments = paymentsResponse?.data || [];

  // Fetch wallet balance
  const { data: walletResponse } = useQuery({
    queryKey: ["wallet"],
    queryFn: fetchWallet,
    enabled: isAuthenticated,
  });
  const walletBalance = walletResponse?.data?.balance ?? 0;

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

  const payMutation = useMutation({
    mutationFn: (bookingId: string) => initializePayment(bookingId),
    onSuccess: (res) => {
      window.location.href = res.data.authorizationUrl;
    },
    onError: (err: any) => {
      toast({ title: "Payment failed", description: err.message, variant: "destructive" });
    },
  });

  const walletPayMutation = useMutation({
    mutationFn: (bookingId: string) => payFromWallet(bookingId),
    onSuccess: (res) => {
      toast({ title: "Payment successful!", description: res.data.message });
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["my-payments"] });
    },
    onError: (err: any) => {
      toast({ title: "Wallet payment failed", description: err.message, variant: "destructive" });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (bookingId: string) => cancelBooking(bookingId),
    onSuccess: () => {
      toast({ title: "Booking cancelled", description: "Your booking has been cancelled." });
      setCancelTarget(null);
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
    },
    onError: (err: any) => {
      toast({ title: "Cancellation failed", description: err.message, variant: "destructive" });
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
                            {booking.room && (
                              <p className="text-xs font-medium text-primary mb-0.5">
                                {booking.room.name}
                                {" · "}
                                {({ SINGLE: "Single", SELF_CON: "Self Con", MINI_FLAT: "Mini Flat" } as Record<string, string>)[booking.room.roomType] ?? booking.room.roomType}
                              </p>
                            )}
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

                        {/* Booking progress stepper */}
                        <BookingStepper booking={booking} />

                        {/* Eviction banner */}
                        {booking.status === "EVICTED" && (
                          <div className="mb-4 p-4 rounded-xl border-2 border-destructive/30 bg-destructive/5">
                            <div className="flex items-start gap-3">
                              <Ban className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                              <div>
                                <p className="font-semibold text-sm text-destructive">You have been evicted</p>
                                {booking.evictionReason && (
                                  <p className="text-sm text-destructive/80 mt-1">{booking.evictionReason}</p>
                                )}
                                {booking.evictionDate && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Evicted on {new Date(booking.evictionDate).toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" })}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Lease expiry warning banner */}
                        {booking.status === "APPROVED" && (() => {
                          const leaseEnd = new Date(booking.leaseEnd);
                          const now = new Date();
                          const daysRemaining = Math.ceil((leaseEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                          if (daysRemaining > 0 && daysRemaining <= 30) {
                            return (
                              <div className="mb-4 p-3.5 rounded-xl border border-amber-300/60 bg-amber-50/60 dark:bg-amber-950/20">
                                <div className="flex items-start gap-2.5">
                                  <TriangleAlert className="w-4.5 h-4.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                  <p className="text-sm text-amber-800 dark:text-amber-300">
                                    <span className="font-semibold">Lease expiring soon — </span>
                                    Your lease expires on{" "}
                                    {leaseEnd.toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" })}{" "}
                                    — <span className="font-semibold">{daysRemaining} day{daysRemaining !== 1 ? "s" : ""} remaining</span>
                                  </p>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })()}

                        {/* Lease terms display */}
                        {booking.status === "APPROVED" && booking.lease && (
                          <div className="mb-4 space-y-2">
                            {booking.lease.gracePeriodDays && booking.lease.gracePeriodDays > 0 ? (
                              <p className="text-xs text-primary/80 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                Grace period: {booking.lease.gracePeriodDays} days after lease ends
                              </p>
                            ) : null}
                            {booking.lease.duration && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                Duration: {booking.lease.duration}
                              </p>
                            )}
                            {booking.lease.terms && (
                              <details className="text-xs">
                                <summary className="cursor-pointer text-muted-foreground hover:text-foreground flex items-center gap-1.5">
                                  <FileText className="w-3.5 h-3.5" />
                                  View Lease Terms
                                </summary>
                                <p className="mt-2 p-3 rounded-lg bg-muted/30 text-muted-foreground whitespace-pre-wrap">
                                  {booking.lease.terms}
                                </p>
                              </details>
                            )}
                          </div>
                        )}

                        {/* Payment status + Pay button */}
                        {booking.status === "APPROVED" && (
                          <div className="mb-4">
                            {(!booking.paymentStatus || booking.paymentStatus === "UNPAID") && (
                              <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
                                <div className="flex items-center gap-2.5">
                                  <CreditCard className="w-4.5 h-4.5 text-primary" />
                                  <div>
                                    <p className="text-sm font-semibold">Payment required</p>
                                    <p className="text-xs text-muted-foreground">
                                      Pay ₦{(booking.property?.priceMonthly || 0).toLocaleString()} to secure your booking
                                    </p>
                                  </div>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2">
                                  <Button
                                    variant="outline"
                                    className="rounded-lg flex-1 gap-1.5"
                                    size="sm"
                                    disabled={walletPayMutation.isPending || payMutation.isPending || walletBalance < (booking.property?.priceMonthly || 0)}
                                    onClick={() => walletPayMutation.mutate(booking.id)}
                                  >
                                    {walletPayMutation.isPending ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Wallet className="w-4 h-4" />
                                    )}
                                    Pay from Wallet (₦{walletBalance.toLocaleString()})
                                  </Button>
                                  <Button
                                    className="gradient-primary rounded-lg flex-1 gap-1.5"
                                    size="sm"
                                    disabled={payMutation.isPending || walletPayMutation.isPending}
                                    onClick={() => payMutation.mutate(booking.id)}
                                  >
                                    {payMutation.isPending ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <CreditCard className="w-4 h-4" />
                                    )}
                                    Pay with Paystack
                                  </Button>
                                </div>
                                {walletBalance < (booking.property?.priceMonthly || 0) && walletBalance > 0 && (
                                  <p className="text-[11px] text-muted-foreground">
                                    Insufficient wallet balance.{" "}
                                    <Link to="/wallet" className="text-primary hover:underline">Fund your wallet</Link>
                                  </p>
                                )}
                              </div>
                            )}
                            {booking.paymentStatus === "PENDING_PAYMENT" && (
                              <div className="p-3 rounded-xl border border-amber-200/60 bg-amber-50/50 dark:bg-amber-950/20 flex items-center gap-2.5">
                                <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                                <p className="text-sm text-amber-800 dark:text-amber-300">Payment processing...</p>
                              </div>
                            )}
                            {booking.paymentStatus === "PAID" && (
                              <div className="p-3 rounded-xl border border-emerald-200/60 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-center gap-2.5">
                                <CreditCard className="w-4 h-4 text-emerald-600" />
                                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Payment confirmed</p>
                              </div>
                            )}
                            {booking.paymentStatus === "REFUNDED" && (
                              <div className="p-3 rounded-xl border border-blue-200/60 bg-blue-50/50 dark:bg-blue-950/20 flex items-center gap-2.5">
                                <ShieldAlert className="w-4 h-4 text-blue-600" />
                                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Payment refunded</p>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/60">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/properties/${booking.propertyId}`}>
                                View Listing
                              </Link>
                            </Button>
                            {booking.status === "PENDING" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-lg gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/5 hover:border-destructive/60"
                                onClick={() => setCancelTarget(booking)}
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Cancel Booking
                              </Button>
                            )}
                          </div>

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
            {/* ── Payment History ── */}
            {myPayments.length > 0 && (
              <div className="mt-10">
                <h2 className="text-xl font-display font-bold text-foreground tracking-tight mb-4">
                  Payment <span className="text-primary">History</span>
                </h2>
                <Card className="border-border/40 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="divide-y divide-border/40">
                      {myPayments.map((payment) => (
                        <div
                          key={payment.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                              <CreditCard className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm">
                                {payment.booking?.property?.title || "Property"}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {payment.paidAt
                                  ? new Date(payment.paidAt).toLocaleDateString("en-NG", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    })
                                  : new Date(payment.createdAt).toLocaleDateString("en-NG", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    })}
                                {" · "}Ref: {payment.paystackReference.slice(0, 8)}...
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 pl-12 sm:pl-0">
                            <Badge
                              variant={
                                payment.refundedAt
                                  ? "destructive"
                                  : payment.paystackStatus === "success"
                                    ? "default"
                                    : "secondary"
                              }
                            >
                              {payment.refundedAt
                                ? "Refunded"
                                : payment.paystackStatus === "success"
                                  ? "Paid"
                                  : payment.paystackStatus || "Pending"}
                            </Badge>
                            <p className="font-bold text-sm whitespace-nowrap">
                              ₦{payment.amount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
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

      {/* ── Cancel booking confirmation dialog ── */}
      <Dialog
        open={!!cancelTarget}
        onOpenChange={(open) => !open && setCancelTarget(null)}
      >
        <DialogContent className="sm:max-w-[420px] rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-destructive" />
              Cancel Booking
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your booking for{" "}
              <span className="font-semibold text-foreground">
                {cancelTarget?.property?.title}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setCancelTarget(null)}
              disabled={cancelMutation.isPending}
            >
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              className="rounded-lg"
              disabled={cancelMutation.isPending}
              onClick={() => cancelTarget && cancelMutation.mutate(cancelTarget.id)}
            >
              {cancelMutation.isPending && (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              )}
              Yes, Cancel It
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyBookings;
