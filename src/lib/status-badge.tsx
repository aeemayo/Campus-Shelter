import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

type Status = "APPROVED" | "PENDING" | "REJECTED";

const statusConfig: Record<Status, { variant: "success" | "destructive" | "warning"; icon: typeof CheckCircle2; label: string }> = {
  APPROVED: { variant: "success", icon: CheckCircle2, label: "Approved" },
  PENDING: { variant: "warning", icon: Clock, label: "Pending" },
  REJECTED: { variant: "destructive", icon: XCircle, label: "Rejected" },
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
