// ─── Payments API service ─────────────────────────────────────
import { apiFetch, type ApiPaginated, type ApiSuccess } from "@/lib/api";

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  platformFee: number;
  landlordAmount: number;
  paystackReference: string;
  paystackStatus: string | null;
  paidAt: string | null;
  refundedAt: string | null;
  refundReason: string | null;
  refundedBy: string | null;
  createdAt: string;
  booking?: {
    id: string;
    status: string;
    paymentStatus: string;
    leaseStart: string;
    leaseEnd: string;
    student?: { id: string; name: string; email: string };
    property?: { id: string; title: string; location: string; priceMonthly: number };
  };
}

/**
 * Initialize a Paystack payment for an approved booking.
 * Returns the authorization URL to redirect the student to.
 */
export async function initializePayment(bookingId: string) {
  return apiFetch<ApiSuccess<{ authorizationUrl: string; reference: string }>>(
    "/api/payments/initialize",
    {
      method: "POST",
      body: JSON.stringify({ bookingId }),
    }
  );
}

/**
 * Verify a Paystack payment by reference.
 */
export async function verifyPayment(reference: string) {
  return apiFetch<ApiSuccess<Payment>>(
    `/api/payments/verify?reference=${encodeURIComponent(reference)}`
  );
}

/**
 * List payments (role-filtered on the backend).
 */
export async function fetchPayments(page = 1, limit = 20) {
  return apiFetch<ApiPaginated<Payment>>(
    `/api/payments?page=${page}&limit=${limit}`
  );
}

/**
 * Admin: refund a payment.
 */
export async function refundPayment(paymentId: string, reason: string) {
  return apiFetch<ApiSuccess<Payment>>(
    `/api/admin/payments/${paymentId}/refund`,
    {
      method: "POST",
      body: JSON.stringify({ reason }),
    }
  );
}
