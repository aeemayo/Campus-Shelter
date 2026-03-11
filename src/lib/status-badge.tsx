import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle, Ban, Archive, Wrench, MinusCircle } from "lucide-react";

type Status = "APPROVED" | "PENDING" | "PENDING_APPROVAL" | "REJECTED" | "SUSPENDED" | "ARCHIVED" | "OPEN" | "IN_PROGRESS" | "RESOLVED" | "VERIFIED" | "EVICTED" | "CANCELLED";

const statusConfig: Record<Status, { variant: "success" | "destructive" | "warning" | "outline" | "secondary"; icon: typeof CheckCircle2; label: string }> = {
  APPROVED: { variant: "success", icon: CheckCircle2, label: "Approved" },
  VERIFIED: { variant: "success", icon: CheckCircle2, label: "Verified" },
  PENDING: { variant: "warning", icon: Clock, label: "Pending" },
  PENDING_APPROVAL: { variant: "warning", icon: Clock, label: "Pending Approval" },
  REJECTED: { variant: "destructive", icon: XCircle, label: "Rejected" },
  SUSPENDED: { variant: "destructive", icon: Ban, label: "Suspended" },
  EVICTED: { variant: "destructive", icon: Ban, label: "Evicted" },
  CANCELLED: { variant: "secondary", icon: MinusCircle, label: "Cancelled" },
  ARCHIVED: { variant: "outline", icon: Archive, label: "Archived" },
  OPEN: { variant: "destructive", icon: Wrench, label: "Open" },
  IN_PROGRESS: { variant: "warning", icon: Clock, label: "In Progress" },
  RESOLVED: { variant: "success", icon: CheckCircle2, label: "Resolved" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as Status] || statusConfig.PENDING;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
}
