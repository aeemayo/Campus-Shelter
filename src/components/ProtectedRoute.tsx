import { useState } from "react";
import { Navigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/services/auth";
import { resendVerification } from "@/services/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Clock, XCircle, LogOut, ShieldCheck, Upload, Mail, Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  allowUnverifiedLandlord?: boolean;
  allowUnverifiedStudent?: boolean;
}

const roleHomeMap: Record<UserRole, string> = {
  STUDENT: "/properties",
  LANDLORD: "/landlord",
  ADMIN: "/admin",
};

export default function ProtectedRoute({ children, allowedRoles, allowUnverifiedLandlord, allowUnverifiedStudent }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={roleHomeMap[user.role]} replace />;
  }

  // Block users who haven't verified their email
  if (!user.emailVerified && user.role !== "ADMIN") {
    return <EmailNotVerifiedBlock logout={logout} email={user.email} />;
  }

  // Block unverified landlords from all landlord routes except profile
  if (
    user.role === "LANDLORD" &&
    !allowUnverifiedLandlord &&
    user.landlordStatus !== "VERIFIED"
  ) {
    const isRejected = user.landlordStatus === "REJECTED";
    const isSuspended = user.landlordStatus === "SUSPENDED";
    const isNegative = isRejected || isSuspended;

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className={`max-w-md w-full border-2 ${isNegative ? "border-destructive/30" : "border-warning/30"}`}>
          <CardContent className="pt-8 pb-8 text-center">
            <div className={`w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center ${isNegative ? "bg-destructive/10" : "bg-warning/10"}`}>
              {isNegative ? (
                <XCircle className="w-8 h-8 text-destructive" />
              ) : (
                <Clock className="w-8 h-8 text-warning" />
              )}
            </div>

            <h2 className="text-xl font-bold tracking-tight mb-2">
              {isSuspended ? "Account Suspended" : isRejected ? "Verification Rejected" : "Verification Pending"}
            </h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              {isSuspended
                ? "Your account has been suspended. You can submit an appeal from your profile page."
                : isRejected
                ? "Your landlord verification was rejected. Please contact support or re-upload your ID to try again."
                : "Your account is being reviewed by our team. You'll be able to access the dashboard once your identity is verified."}
            </p>

            <div className="flex flex-col gap-2">
              <Button variant="outline" asChild>
                <Link to="/profile">
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  {isSuspended ? "View Profile & Appeal" : "View Profile"}
                </Link>
              </Button>
              <Button variant="ghost" className="text-destructive" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Block unverified students from restricted routes (bookings, messages)
  if (
    user.role === "STUDENT" &&
    !allowUnverifiedStudent &&
    !user.verified
  ) {
    const hasIdCard = !!user.idCardUrl;

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className={`max-w-md w-full border-2 ${hasIdCard ? "border-warning/30" : "border-primary/30"}`}>
          <CardContent className="pt-8 pb-8 text-center">
            <div className={`w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center ${hasIdCard ? "bg-warning/10" : "bg-primary/10"}`}>
              {hasIdCard ? (
                <Clock className="w-8 h-8 text-warning" />
              ) : (
                <Upload className="w-8 h-8 text-primary" />
              )}
            </div>

            <h2 className="text-xl font-bold tracking-tight mb-2">
              {hasIdCard ? "Verification Pending" : "Verify Your Account"}
            </h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              {hasIdCard
                ? "Your student ID is under review by our team. You'll be able to access this feature once your identity is verified."
                : "Please upload your student ID to verify your account. You need to be verified to access bookings and messages."}
            </p>

            <div className="flex flex-col gap-2">
              <Button variant="outline" asChild>
                <Link to="/profile">
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  {hasIdCard ? "View Profile" : "Upload Student ID"}
                </Link>
              </Button>
              <Button variant="ghost" className="text-destructive" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

function EmailNotVerifiedBlock({ logout, email }: { logout: () => void; email: string }) {
  const { toast } = useToast();
  const [resending, setResending] = useState(false);

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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-2 border-primary/30">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-5 flex items-center justify-center">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold tracking-tight mb-2">Verify Your Email</h2>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            We sent a verification link to <strong>{email}</strong>. Please check your inbox and click the link to continue.
          </p>
          <div className="flex flex-col gap-2">
            <Button onClick={handleResend} disabled={resending} variant="outline">
              {resending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
              Resend verification email
            </Button>
            <Button variant="ghost" className="text-destructive" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
