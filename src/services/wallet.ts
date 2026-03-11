// ─── Wallet API service ──────────────────────────────────────
import { apiFetch, type ApiSuccess } from "@/lib/api";

export interface WalletTransaction {
  id: string;
  type: "FUND" | "RENT_PAYMENT" | "REFUND";
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  bookingId: string | null;
  paystackReference: string | null;
  createdAt: string;
}

export interface Wallet {
  id: string;
  balance: number;
  transactions: WalletTransaction[];
}

/**
 * Fetch the current user's wallet (auto-creates if none exists).
 */
export async function fetchWallet() {
  return apiFetch<ApiSuccess<Wallet>>("/api/wallet");
}

/**
 * Initialize wallet funding via Paystack.
 * Returns the authorization URL to redirect the user to.
 */
export async function fundWallet(amount: number) {
  return apiFetch<ApiSuccess<{ authorizationUrl: string; reference: string }>>(
    "/api/wallet/fund",
    { method: "POST", body: JSON.stringify({ amount }) }
  );
}

/**
 * Verify a wallet funding payment by Paystack reference.
 */
export async function verifyWalletFunding(reference: string) {
  return apiFetch<ApiSuccess<Wallet>>(
    `/api/wallet/verify?reference=${encodeURIComponent(reference)}`
  );
}

/**
 * Pay for a booking from wallet balance.
 */
export async function payFromWallet(bookingId: string) {
  return apiFetch<ApiSuccess<{ message: string; balance: number }>>(
    "/api/wallet/pay",
    { method: "POST", body: JSON.stringify({ bookingId }) }
  );
}
