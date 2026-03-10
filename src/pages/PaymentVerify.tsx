import { useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { verifyPayment } from "@/services/payments";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, ArrowRight } from "lucide-react";

export default function PaymentVerify() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference") || searchParams.get("trxref");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["verify-payment", reference],
    queryFn: () => verifyPayment(reference!),
    enabled: !!reference,
    retry: 2,
  });

  const payment = data?.data;
  const isPaid = payment?.booking?.paymentStatus === "PAID" || payment?.paystackStatus === "success";

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
                  Your payment of <span className="font-semibold text-foreground">₦{payment?.amount?.toLocaleString()}</span> has been confirmed.
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
          ) : (
            <Card className="border-border/60 border-amber-200/60">
              <CardContent className="p-8 text-center space-y-4">
                <Loader2 className="w-14 h-14 text-amber-500 mx-auto" />
                <h2 className="text-xl font-bold tracking-tight">Payment Pending</h2>
                <p className="text-sm text-muted-foreground">
                  Your payment is still being processed. This may take a moment.
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
