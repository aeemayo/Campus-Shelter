import { apiFetch, type ApiSuccess } from "@/lib/api";

export interface Lease {
  id: string;
  bookingId: string;
  documentUrl: string;
  status: string;
  createdAt: string;
}

export async function createLease(data: {
  bookingId: string;
  documentUrl: string;
}) {
  return apiFetch<ApiSuccess<Lease>>("/api/leases", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function fetchLease(id: string) {
  return apiFetch<ApiSuccess<Lease>>(`/api/leases/${id}`);
}
