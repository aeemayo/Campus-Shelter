import { apiFetch, type ApiSuccess } from "@/lib/api";

export interface Lease {
  id: string;
  bookingId: string;
  documentUrl: string;
  gracePeriodDays?: number;
  terms?: string;
  duration?: string;
  status?: string;
  createdAt: string;
}

export interface CreateLeaseData {
  bookingId: string;
  documentUrl: string;
  gracePeriodDays?: number;
  terms?: string;
  duration?: string;
}

export interface UpdateLeaseData {
  gracePeriodDays?: number;
  terms?: string;
  duration?: string;
  documentUrl?: string;
}

export async function createLease(data: CreateLeaseData) {
  return apiFetch<ApiSuccess<Lease>>("/api/leases", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateLease(id: string, data: UpdateLeaseData) {
  return apiFetch<ApiSuccess<Lease>>(`/api/leases/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function fetchLease(id: string) {
  return apiFetch<ApiSuccess<Lease>>(`/api/leases/${id}`);
}
