// ─── Auth API service ────────────────────────────────────────
import { apiFetch, type ApiSuccess } from "@/lib/api";

// ─── Types ───────────────────────────────────────────────────

export type UserRole = "STUDENT" | "LANDLORD" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  verified: boolean;
  landlordStatus?: string;
  idCardUrl?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// ─── Payloads ────────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: UserRole;
}

// ─── API calls ───────────────────────────────────────────────

export async function login(payload: LoginPayload) {
  const res = await apiFetch<ApiSuccess<AuthResponse>>(
    "/api/auth/login",
    { method: "POST", body: JSON.stringify(payload) }
  );
  return res.data;
}

export async function fetchProfile() {
  const res = await apiFetch<ApiSuccess<{ user: User }>>("/api/auth/me");
  return res.data;
}

export async function register(payload: RegisterPayload) {
  const res = await apiFetch<ApiSuccess<AuthResponse>>(
    "/api/auth/register",
    { method: "POST", body: JSON.stringify(payload) }
  );
  return res.data;
}

export async function forgotPassword(email: string) {
  return apiFetch<ApiSuccess<any>>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(payload: any) {
  return apiFetch<ApiSuccess<any>>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function changePassword(payload: any) {
  return apiFetch<ApiSuccess<any>>("/api/auth/change-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ─── Token helpers ───────────────────────────────────────────

const TOKEN_KEY = "cs_token";
const USER_KEY = "cs_user";

export function saveAuth(data: AuthResponse) {
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getSavedToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getSavedUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}
