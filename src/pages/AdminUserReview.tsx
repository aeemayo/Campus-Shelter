import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  fetchAdminUser,
  adminVerifyStudent,
  adminVerifyLandlord,
  adminFlagUser,
  adminDeleteUser,
} from "@/services/properties";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  User,
  Mail,
  Phone,
  Calendar,
  Building2,
  BookOpen,
  Star,
  Flag,
  UserX,
  GraduationCap,
  Image as ImageIcon,
  ExternalLink,
  Ban,
} from "lucide-react";

export default function AdminUserReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isSuspending, setIsSuspending] = useState(false);
  const [isFlagging, setIsFlagging] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const {
    data: user,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin-user", id],
    queryFn: () => fetchAdminUser(id!),
    enabled: !!id,
  });

  const handleVerifyStudent = async (verified: boolean) => {
    setIsVerifying(true);
    try {
      await adminVerifyStudent(id!, verified);
      toast({
        title: verified ? "Student Verified" : "Verification Removed",
        description: verified
          ? "The student account is now verified."
          : "Student verification has been removed.",
      });
      refetch();
    } catch {
      toast({
        title: "Error",
        description: "Failed to update verification status.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyLandlord = async (
    status: "VERIFIED" | "REJECTED" | "SUSPENDED",
  ) => {
    let suspensionReason: string | undefined;
    if (status === "SUSPENDED") {
      const reason = window.prompt(
        "Provide a reason for suspending this landlord:",
      );
      if (reason === null) return;
      suspensionReason = reason || undefined;
      setIsSuspending(true);
    } else if (status === "REJECTED") {
      setIsRejecting(true);
    } else {
      setIsVerifying(true);
    }

    try {
      await adminVerifyLandlord(id!, status, suspensionReason);
      const labels: Record<string, string> = {
        VERIFIED: "Verified",
        REJECTED: "Rejected",
        SUSPENDED: "Suspended",
      };
      toast({
        title: `Landlord ${labels[status]}`,
        description: `The landlord account has been ${status.toLowerCase()}.`,
      });
      refetch();
    } catch {
      toast({
        title: "Error",
        description: "Failed to update landlord status.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
      setIsRejecting(false);
      setIsSuspending(false);
    }
  };

  const handleFlag = async () => {
    setIsFlagging(true);
    try {
      await adminFlagUser(id!, !user.flaggedAt);
      toast({
        title: user.flaggedAt ? "Flag Removed" : "Account Flagged",
        description: user.flaggedAt
          ? "The flag has been removed from this account."
          : "This account has been flagged for review.",
      });
      refetch();
    } catch {
      toast({
        title: "Error",
        description: "Failed to update flag status.",
        variant: "destructive",
      });
    } finally {
      setIsFlagging(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone.",
      )
    )
      return;
    setIsDeleting(true);
    try {
      await adminDeleteUser(id!);
      toast({
        title: "Account Deleted",
        description: "The user account has been permanently removed.",
      });
      navigate("/admin");
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete user.",
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

  if (isError || !user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header bgColor="white" />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            User not found
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

  const isStudent = user.role === "STUDENT";
  const isLandlord = user.role === "LANDLORD";
  const initials =
    user.name
      ?.trim()
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "U";

  const getStatusBadge = () => {
    if (isLandlord) {
      const status = user.landlordStatus || "PENDING";
      const map: Record<
        string,
        { variant: "success" | "warning" | "destructive"; label: string }
      > = {
        VERIFIED: { variant: "success", label: "Verified" },
        PENDING: { variant: "warning", label: "Pending Verification" },
        REJECTED: { variant: "destructive", label: "Rejected" },
        SUSPENDED: { variant: "destructive", label: "Suspended" },
      };
      const info = map[status] || map.PENDING;
      return (
        <Badge variant={info.variant} className="text-sm px-3 py-1">
          {info.label}
        </Badge>
      );
    }
    if (user.verifiedAt) {
      return (
        <Badge variant="success" className="text-sm px-3 py-1">
          Verified
        </Badge>
      );
    }
    if (user.idCardUrl) {
      return (
        <Badge variant="warning" className="text-sm px-3 py-1">
          Pending Review
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="text-sm px-3 py-1">
        Unverified
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO title={`Review: ${user.name}`} noIndex />
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
            <span className="text-foreground">User Review</span>
          </div>

          {/* Header with status + actions */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8"
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-border flex items-center justify-center shrink-0">
                <span className="text-2xl font-bold text-primary">
                  {initials}
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                    {user.name}
                  </h1>
                  {getStatusBadge()}
                  {user.flaggedAt && (
                    <Badge variant="destructive" className="text-xs">
                      <Flag className="w-3 h-3 mr-1" />
                      Flagged
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1.5">
                    {isStudent ? (
                      <GraduationCap className="w-3.5 h-3.5 text-primary" />
                    ) : (
                      <Building2 className="w-3.5 h-3.5 text-primary" />
                    )}
                    {user.role}
                  </span>
                  <span className="text-muted-foreground/40">·</span>
                  <span>
                    Joined{" "}
                    {new Date(user.createdAt).toLocaleDateString("en-NG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              {isStudent && !user.verifiedAt && (
                <Button
                  size="sm"
                  className="gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => handleVerifyStudent(true)}
                  disabled={isVerifying}
                >
                  {isVerifying ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  Verify Student
                </Button>
              )}
              {isStudent && user.verifiedAt && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 rounded-lg text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={() => handleVerifyStudent(false)}
                  disabled={isVerifying}
                >
                  {isVerifying ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  Unverify
                </Button>
              )}

              {isLandlord && user.landlordStatus !== "VERIFIED" && (
                <Button
                  size="sm"
                  className="gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => handleVerifyLandlord("VERIFIED")}
                  disabled={isVerifying}
                >
                  {isVerifying ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  Verify Landlord
                </Button>
              )}
              {isLandlord && user.landlordStatus !== "REJECTED" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 rounded-lg"
                  onClick={() => handleVerifyLandlord("REJECTED")}
                  disabled={isRejecting}
                >
                  {isRejecting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  Reject
                </Button>
              )}
              {isLandlord && user.landlordStatus !== "SUSPENDED" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 rounded-lg text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={() => handleVerifyLandlord("SUSPENDED")}
                  disabled={isSuspending}
                >
                  {isSuspending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Ban className="w-3.5 h-3.5" />
                  )}
                  Suspend
                </Button>
              )}

              <Button
                size="sm"
                variant="outline"
                className="gap-2 rounded-lg"
                onClick={handleFlag}
                disabled={isFlagging}
              >
                {isFlagging ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Flag className="w-3.5 h-3.5 text-orange-500" />
                )}
                {user.flaggedAt ? "Unflag" : "Flag"}
              </Button>

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
                  <UserX className="w-3.5 h-3.5" />
                )}
                Delete
              </Button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column — ID Card + Suspension reason */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* ID Card */}
              <Card className="border-border/60 overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    Uploaded ID Document
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  {user.idCardUrl ? (
                    <div
                      className="relative rounded-xl overflow-hidden cursor-pointer group"
                      onClick={() => setLightboxOpen(true)}
                    >
                      <img
                        src={user.idCardUrl}
                        alt={`${user.name}'s ID document`}
                        className="w-full max-h-[420px] object-contain bg-muted/20 rounded-xl transition-transform duration-300 group-hover:scale-[1.01]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Badge
                          variant="secondary"
                          className="bg-black/60 text-white border-none text-xs"
                        >
                          <ExternalLink className="w-3 h-3 mr-1.5" />
                          Click to enlarge
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 rounded-xl bg-muted/20 border-2 border-dashed border-border/40 flex flex-col items-center justify-center gap-2">
                      <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                      <p className="text-sm text-muted-foreground">
                        No ID document uploaded
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Suspension Reason */}
              {isLandlord && user.landlordStatus === "SUSPENDED" && (
                <Card className="border-destructive/20 bg-destructive/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2 text-destructive">
                      <ShieldAlert className="w-4 h-4" />
                      Suspension Reason
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {user.suspensionReason || "No reason provided."}
                    </p>
                  </CardContent>
                </Card>
              )}
            </motion.div>

            {/* Right column — Profile details + Stats */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="space-y-6"
            >
              {/* Contact info */}
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{user.name}</p>
                      <Badge variant="outline" className="text-[10px] mt-0.5">
                        {user.role}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <Phone className="w-3.5 h-3.5 shrink-0" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        Joined{" "}
                        {new Date(user.createdAt).toLocaleDateString("en-NG", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Verification status */}
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    Verification Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm py-2 border-b border-border/30">
                    <span className="text-muted-foreground">Status</span>
                    {getStatusBadge()}
                  </div>
                  <div className="flex items-center justify-between text-sm py-2 border-b border-border/30">
                    <span className="text-muted-foreground">ID Uploaded</span>
                    <span className="font-medium text-foreground">
                      {user.idCardUrl ? "Yes" : "No"}
                    </span>
                  </div>
                  {isLandlord && (
                    <div className="flex items-center justify-between text-sm py-2 border-b border-border/30">
                      <span className="text-muted-foreground">
                        Landlord Status
                      </span>
                      <span className="font-medium text-foreground">
                        {user.landlordStatus || "PENDING"}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm py-2">
                    <span className="text-muted-foreground">Flagged</span>
                    <span className="font-medium text-foreground">
                      {user.flaggedAt ? "Yes" : "No"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Activity stats */}
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/40 text-center">
                      <Building2 className="w-4 h-4 mx-auto mb-1.5 text-primary" />
                      <p className="text-lg font-bold text-foreground">
                        {user._count?.properties ?? 0}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                        Properties
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/40 text-center">
                      <BookOpen className="w-4 h-4 mx-auto mb-1.5 text-primary" />
                      <p className="text-lg font-bold text-foreground">
                        {user._count?.bookings ?? 0}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                        Bookings
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/40 text-center">
                      <Star className="w-4 h-4 mx-auto mb-1.5 text-primary" />
                      <p className="text-lg font-bold text-foreground">
                        {user._count?.reviews ?? 0}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                        Reviews
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Metadata */}
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>User ID</span>
                    <span className="font-mono text-foreground truncate ml-2 max-w-[160px]">
                      {user.id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Created</span>
                    <span className="text-foreground">
                      {new Date(user.createdAt).toLocaleString("en-NG")}
                    </span>
                  </div>
                  {user.updatedAt && (
                    <div className="flex justify-between">
                      <span>Updated</span>
                      <span className="text-foreground">
                        {new Date(user.updatedAt).toLocaleString("en-NG")}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      {/* ID Card Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-[95vw] h-[90vh] p-0 bg-black/95 border-none flex flex-col overflow-hidden rounded-2xl">
          <DialogHeader className="p-6 absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/70 to-transparent">
            <DialogTitle className="text-white font-semibold">
              {user.name} — ID Document
            </DialogTitle>
            <DialogDescription className="text-white/50 text-xs">
              {isStudent ? "Student" : "Landlord"} ID submission
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 relative flex items-center justify-center p-6 pt-20">
            {user.idCardUrl && (
              <img
                src={user.idCardUrl}
                alt={`${user.name}'s ID document`}
                className="max-w-full max-h-full object-contain rounded-xl"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
