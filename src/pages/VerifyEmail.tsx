import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { verifyEmail, resendVerification } from "@/services/auth";
import { useAuth } from "@/contexts/AuthContext";
import { fetchProfile } from "@/services/auth";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, Mail, ArrowRight } from "lucide-react";

type Status = "loading" | "success" | "error" | "no-token";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { user, isAuthenticated, updateUser } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<Status>(token ? "loading" : "no-token");
  const [errorMsg, setErrorMsg] = useState("");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    (async () => {
      try {
        await verifyEmail(token);
        if (!cancelled) {
          setStatus("success");
          // Refresh user data if logged in
          if (isAuthenticated) {
            try {
              const { user: fresh } = await fetchProfile();
              updateUser(fresh);
            } catch { /* ignore */ }
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          setStatus("error");
          setErrorMsg(err?.message || "Verification failed. The link may be expired or invalid.");
        }
      }
    })();

    return () => { cancelled = true; };
  }, [token]);

  async function handleResend() {
    setResending(true);
    try {
      await resendVerification();
      toast({ title: "Verification email sent", description: "Check your inbox for a new verification link." });
    } catch (err: any) {
      toast({
        title: "Failed to resend",
        description: err?.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/60 to-background flex items-center justify-center p-4">
      <SEO title="Verify Email" description="Verify your CampusShelter email address." path="/verify-email" />
      <Card className="max-w-md w-full border-border/50 shadow-primary-lg">
        <CardContent className="pt-8 pb-8 text-center">
          {status === "loading" && (
            <>
              <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-5 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <h2 className="text-xl font-bold tracking-tight mb-2">Verifying your email...</h2>
              <p className="text-sm text-muted-foreground">Please wait while we confirm your email address.</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/30 mx-auto mb-5 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-bold tracking-tight mb-2">Email Verified!</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Your email has been confirmed. You can now access all features.
              </p>
              <Button asChild className="gradient-primary text-white">
                <Link to={user?.role === "LANDLORD" ? "/landlord" : user?.role === "ADMIN" ? "/admin" : "/properties"}>
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 rounded-full bg-destructive/10 mx-auto mb-5 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-bold tracking-tight mb-2">Verification Failed</h2>
              <p className="text-sm text-muted-foreground mb-6">{errorMsg}</p>
              <div className="flex flex-col gap-2">
                {isAuthenticated && (
                  <Button onClick={handleResend} disabled={resending} variant="outline">
                    {resending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
                    Resend verification email
                  </Button>
                )}
                <Button asChild variant="ghost">
                  <Link to="/login">Go to login</Link>
                </Button>
              </div>
            </>
          )}

          {status === "no-token" && (
            <>
              <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-5 flex items-center justify-center">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold tracking-tight mb-2">Check Your Email</h2>
              <p className="text-sm text-muted-foreground mb-6">
                We sent a verification link to <strong>{user?.email || "your email"}</strong>. Click the link to verify your account.
              </p>
              <div className="flex flex-col gap-2">
                {isAuthenticated && (
                  <Button onClick={handleResend} disabled={resending} variant="outline">
                    {resending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
                    Resend verification email
                  </Button>
                )}
                <Button asChild variant="ghost">
                  <Link to="/">Go to homepage</Link>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
