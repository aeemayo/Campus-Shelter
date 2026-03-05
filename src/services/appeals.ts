import { apiFetch, type ApiPaginated, type ApiSuccess } from "@/lib/api";

export interface Appeal {
  id: string;
  userId: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  adminNote?: string;
  processedBy?: string;
  processedAt?: string;
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

/** Withdraw a pending appeal. */
export async function withdrawAppeal(id: string) {
  return apiFetch<ApiSuccess<{ message: string }>>(`/api/appeals?id=${id}`, {
    method: "DELETE",
  });
}

/** Admin: get all appeals with pagination and filtering. */
export async function fetchAllAppeals(params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.status) query.set("status", params.status);
  if (params?.search) query.set("search", params.search);
  const qs = query.toString();
  return apiFetch<ApiPaginated<Appeal>>(`/api/admin/appeals${qs ? `?${qs}` : ""}`);
}

/** Admin: approve or reject an appeal. */
export async function processAppeal(id: string, status: "APPROVED" | "REJECTED", adminNote?: string) {
  return apiFetch<ApiSuccess<Appeal>>(`/api/admin/appeals/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status, adminNote }),
  });
}
