import { apiFetch, type ApiPaginated, type ApiSuccess } from "@/lib/api";

export interface Booking {
  id: string;
  studentId: string;
  propertyId: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "EVICTED";
  paymentStatus?: "UNPAID" | "PENDING_PAYMENT" | "PAID" | "REFUNDED";
  leaseStart: string;
  leaseEnd: string;
  evictionReason?: string;
  evictionDate?: string;
  createdAt: string;
  student?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  property?: {
    id: string;
    title: string;
    location: string;
    priceMonthly: number;
    images?: string[];
  };
  lease?: {
    id: string;
    documentUrl: string;
    gracePeriodDays?: number;
    terms?: string;
    duration?: string;
    status?: string;
  };
}

export async function createBooking(data: {
  propertyId: string;
  leaseStart: string;
  leaseEnd: string;
}) {
  return apiFetch<ApiSuccess<Booking>>("/api/bookings", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function fetchMyBookings() {
  return apiFetch<ApiPaginated<Booking>>("/api/bookings");
}

export async function updateBookingStatus(
  id: string,
  status: "APPROVED" | "REJECTED"
) {
  return apiFetch<ApiSuccess<Booking>>(`/api/bookings/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function evictBooking(id: string, reason: string) {
  return apiFetch<ApiSuccess<Booking>>(`/api/bookings/${id}/evict`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}
