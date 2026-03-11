// ─── Bank Details API service ─────────────────────────────────
import { apiFetch, type ApiSuccess } from "@/lib/api";

export interface BankDetail {
  id: string;
  userId: string;
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  paystackSubaccountCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bank {
  id: number;
  name: string;
  slug: string;
  code: string;
  active: boolean;
}

/**
 * Fetch the landlord's saved bank details.
 */
export async function fetchBankDetails() {
  return apiFetch<ApiSuccess<BankDetail | null>>("/api/bank-details");
}

/**
 * Save or update bank details (creates Paystack subaccount).
 */
export async function saveBankDetails(data: {
  bankCode: string;
  accountNumber: string;
}) {
  return apiFetch<ApiSuccess<BankDetail>>("/api/bank-details", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Fetch list of supported Nigerian banks from Paystack.
 */
export async function fetchBanks() {
  return apiFetch<ApiSuccess<Bank[]>>("/api/bank-details/banks");
}
