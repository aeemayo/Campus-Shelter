import { apiFetch, type ApiSuccess } from "@/lib/api";

export interface Appeal {
  id: string;
  userId: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    landlordStatus: string;
  };
}

/** Submit a suspension appeal (landlord only). */
export async function submitAppeal(reason: string) {
  return apiFetch<ApiSuccess<Appeal>>("/api/appeals", {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

/** Get current user's appeals. */
export async function fetchMyAppeals() {
  return apiFetch<ApiSuccess<Appeal[]>>("/api/appeals");
}

/** Admin: get all appeals. */
export async function fetchAllAppeals() {
  return apiFetch<ApiSuccess<Appeal[]>>("/api/admin/appeals");
}

/** Admin: approve or reject an appeal. */
export async function processAppeal(id: string, status: "APPROVED" | "REJECTED", adminNote?: string) {
  return apiFetch<ApiSuccess<Appeal>>(`/api/admin/appeals/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status, adminNote }),
  });
}
