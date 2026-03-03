import { apiFetch, type ApiPaginated, type ApiSuccess } from "@/lib/api";

export interface MaintenanceRequest {
  id: string;
  propertyId: string;
  studentId: string;
  title?: string;
  description: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  images?: string[];
  createdAt: string;
  property?: { id: string; title: string };
  student?: { id: string; name: string; email: string };
}

export async function createMaintenanceRequest(data: {
  propertyId: string;
  description: string;
}) {
  return apiFetch<ApiSuccess<MaintenanceRequest>>("/api/maintenance", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function fetchMyMaintenanceRequests() {
  return apiFetch<ApiPaginated<MaintenanceRequest>>("/api/maintenance");
}

export async function updateMaintenanceStatus(
  id: string,
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED"
) {
  return apiFetch<ApiSuccess<MaintenanceRequest>>(`/api/maintenance/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
