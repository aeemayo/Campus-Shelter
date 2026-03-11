import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { verifyPayment } from "@/services/payments";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, ArrowRight, Clock } from "lucide-react";

const POLL_INTERVAL_MS = 3_000;
const POLL_TIMEOUT_MS = 30_000;

export default function PaymentVerify() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference") || searchParams.get("trxref");

  // Track how long we've been polling
  const [pollingElapsed, setPollingElapsed] = useState(0);
  const [pollingActive, setPollingActive] = useState(true);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["verify-payment", reference],
    queryFn: () => verifyPayment(reference!),
    enabled: !!reference,
    retry: 2,
    // Poll every 3 seconds while active and payment not yet confirmed
    refetchInterval: (query) => {
      const payment = query.state.data?.data;
      const paid =
        payment?.booking?.paymentStatus === "PAID" ||
        payment?.paystackStatus === "success";
      if (paid || !pollingActive) return false;
      return POLL_INTERVAL_MS;
    },
  });

  const payment = data?.data;
  const isPaid =
    payment?.booking?.paymentStatus === "PAID" ||
    payment?.paystackStatus === "success";

  // Advance elapsed timer every second while polling is active
  useEffect(() => {
    if (!reference || isPaid || !pollingActive) return;

    const interval = setInterval(() => {
      setPollingElapsed((prev) => {
        const next = prev + 1_000;
        if (next >= POLL_TIMEOUT_MS) {
          setPollingActive(false);
          clearInterval(interval);
        }
        return next;
      });
    }, 1_000);

    return () => clearInterval(interval);
  }, [reference, isPaid, pollingActive]);

  // Stop polling once paid
  useEffect(() => {
    if (isPaid) setPollingActive(false);
  }, [isPaid]);

  // True while we have data but it isn't PAID yet AND we haven't timed out
  const isPollingPending = !isLoading && !isError && !isPaid && pollingActive;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO title="Payment Verification" noIndex />
      <Header />

      <main className="flex-1 pt-24 pb-12 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4">
          {!reference ? (
            <Card className="border-border/60">
              <CardContent className="p-8 text-center space-y-4">
                <XCircle className="w-14 h-14 text-destructive mx-auto" />
                <h2 className="text-xl font-bold tracking-tight">Missing Reference</h2>
                <p className="text-sm text-muted-foreground">
                  No payment reference was provided. Please try again from your bookings page.
                </p>
                <Button asChild>
                  <Link to="/my-bookings">Go to My Bookings</Link>
                </Button>
              </CardContent>
            </Card>
          ) : isLoading ? (
            <Card className="border-border/60">
              <CardContent className="p-8 text-center space-y-4">
                <Loader2 className="w-14 h-14 text-primary animate-spin mx-auto" />
                <h2 className="text-xl font-bold tracking-tight">Verifying Payment</h2>
                <p className="text-sm text-muted-foreground">
                  Please wait while we confirm your payment...
                </p>
              </CardContent>
            </Card>
          ) : isError ? (
            <Card className="border-border/60">
              <CardContent className="p-8 text-center space-y-4">
                <XCircle className="w-14 h-14 text-destructive mx-auto" />
                <h2 className="text-xl font-bold tracking-tight">Verification Failed</h2>
                <p className="text-sm text-muted-foreground">
                  {(error as any)?.message || "We couldn't verify your payment. Please contact support."}
                </p>
                <Button asChild>
                  <Link to="/my-bookings">Go to My Bookings</Link>
                </Button>
              </CardContent>
            </Card>
          ) : isPaid ? (
            <Card className="border-border/60 border-emerald-200/60">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">Payment Successful!</h2>
                <p className="text-sm text-muted-foreground">
                  Your payment of{" "}
                  <span className="font-semibold text-foreground">
                    ₦{payment?.amount?.toLocaleString()}
                  </span>{" "}
                  has been confirmed.
                </p>
                {payment?.booking?.property && (
                  <div className="p-3 rounded-lg bg-muted/40 text-sm">
                    <p className="font-medium">{payment.booking.property.title}</p>
                    <p className="text-xs text-muted-foreground">{payment.booking.property.location}</p>
                  </div>
                )}
                <Button className="gradient-primary rounded-lg w-full" asChild>
                  <Link to="/my-bookings">
                    View My Bookings
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : isPollingPending ? (
            // Webhook hasn't arrived yet — actively polling
            <Card className="border-border/60 border-amber-200/60">
              <CardContent className="p-8 text-center space-y-4">
                <div className="relative w-14 h-14 mx-auto">
                  <Loader2 className="w-14 h-14 text-amber-500 animate-spin" />
                </div>
                <h2 className="text-xl font-bold tracking-tight">Confirming Payment</h2>
                <p className="text-sm text-muted-foreground">
                  Your payment is being processed. We're checking for confirmation
                  every few seconds&hellip;
                </p>
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-1.5 bg-amber-400 rounded-full transition-all duration-1000"
                    style={{ width: `${(pollingElapsed / POLL_TIMEOUT_MS) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((POLL_TIMEOUT_MS - pollingElapsed) / 1_000)}s remaining
                </p>
              </CardContent>
            </Card>
          ) : (
            // Timed out — webhook still hasn't arrived
            <Card className="border-border/60 border-amber-200/60">
              <CardContent className="p-8 text-center space-y-4">
                <Clock className="w-14 h-14 text-amber-500 mx-auto" />
                <h2 className="text-xl font-bold tracking-tight">Payment Pending</h2>
                <p className="text-sm text-muted-foreground">
                  Your payment is still being processed. This can take a few minutes.
                  Check your bookings page for the latest status.
                </p>
                <Button asChild>
                  <Link to="/my-bookings">Go to My Bookings</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
