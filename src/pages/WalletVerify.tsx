import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { verifyWalletFunding } from "@/services/wallet";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, ArrowRight, Clock, Wallet } from "lucide-react";

const POLL_INTERVAL_MS = 3_000;
const POLL_TIMEOUT_MS = 30_000;

export default function WalletVerify() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference") || searchParams.get("trxref");

  const [pollingElapsed, setPollingElapsed] = useState(0);
  const [pollingActive, setPollingActive] = useState(true);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["verify-wallet-funding", reference],
    queryFn: () => verifyWalletFunding(reference!),
    enabled: !!reference,
    retry: 2,
    refetchInterval: (query) => {
      const wallet = query.state.data?.data;
      // If we got wallet data back the verification succeeded
      const verified = !!wallet?.id;
      if (verified || !pollingActive) return false;
      return POLL_INTERVAL_MS;
    },
  });

  const wallet = data?.data;
  const isVerified = !!wallet?.id;

  // Advance elapsed timer every second while polling is active
  useEffect(() => {
    if (!reference || isVerified || !pollingActive) return;

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
  }, [reference, isVerified, pollingActive]);

  // Stop polling once verified
  useEffect(() => {
    if (isVerified) setPollingActive(false);
  }, [isVerified]);

  const isPollingPending = !isLoading && !isError && !isVerified && pollingActive;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO title="Wallet Funding Verification" noIndex />
      <Header />

      <main className="flex-1 pt-24 pb-12 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4">
          {!reference ? (
            <Card className="border-border/60">
              <CardContent className="p-8 text-center space-y-4">
                <XCircle className="w-14 h-14 text-destructive mx-auto" />
                <h2 className="text-xl font-bold tracking-tight">Missing Reference</h2>
                <p className="text-sm text-muted-foreground">
                  No payment reference was provided. Please try again from your wallet.
                </p>
                <Button asChild>
                  <Link to="/wallet">Back to Wallet</Link>
                </Button>
              </CardContent>
            </Card>
          ) : isLoading ? (
            <Card className="border-border/60">
              <CardContent className="p-8 text-center space-y-4">
                <Loader2 className="w-14 h-14 text-primary animate-spin mx-auto" />
                <h2 className="text-xl font-bold tracking-tight">Verifying Payment</h2>
                <p className="text-sm text-muted-foreground">
                  Please wait while we confirm your wallet funding...
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
                  <Link to="/wallet">Back to Wallet</Link>
                </Button>
              </CardContent>
            </Card>
          ) : isVerified ? (
            <Card className="border-border/60 border-emerald-200/60">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">Wallet Funded!</h2>
                <p className="text-sm text-muted-foreground">
                  Your wallet has been credited successfully.
                </p>
                <div className="p-4 rounded-lg bg-muted/40">
                  <p className="text-xs text-muted-foreground mb-1">New Balance</p>
                  <p className="text-3xl font-display font-bold tracking-tight text-foreground">
                    ₦{(wallet?.balance || 0).toLocaleString()}
                  </p>
                </div>
                <Button className="gradient-primary rounded-lg w-full" asChild>
                  <Link to="/wallet">
                    <Wallet className="w-4 h-4 mr-2" />
                    Back to Wallet
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : isPollingPending ? (
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
            <Card className="border-border/60 border-amber-200/60">
              <CardContent className="p-8 text-center space-y-4">
                <Clock className="w-14 h-14 text-amber-500 mx-auto" />
                <h2 className="text-xl font-bold tracking-tight">Payment Pending</h2>
                <p className="text-sm text-muted-foreground">
                  Your payment is still being processed. This can take a few minutes.
                  Check your wallet for the latest status.
                </p>
                <Button asChild>
                  <Link to="/wallet">Back to Wallet</Link>
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
