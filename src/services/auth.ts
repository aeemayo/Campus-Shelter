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

interface LocalStoredUser extends User {
  password: string;
}

const LOCAL_USERS_KEY = "cs_local_users";

function getLocalUsers(): LocalStoredUser[] {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LocalStoredUser[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalUsers(users: LocalStoredUser[]) {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

function shouldUseFallback(error: unknown): boolean {
  if (error instanceof Error && "status" in error) {
    const status = Number((error as { status?: number }).status);
    return Number.isFinite(status) && status >= 500;
  }
  return true;
}

function buildLocalToken(userId: string): string {
  return `local-${userId}-${Date.now()}`;
}

function registerLocal(payload: RegisterPayload): AuthResponse {
  const users = getLocalUsers();
  const email = payload.email.trim().toLowerCase();
  const exists = users.some((user) => user.email.toLowerCase() === email);

  if (exists) {
    throw new Error("An account with this email already exists.");
  }

  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  const created: LocalStoredUser = {
    id,
    name: payload.name.trim(),
    email,
    phone: payload.phone,
    role: payload.role ?? "STUDENT",
    verified: false,
    createdAt: now,
    password: payload.password,
  };

  users.push(created);
  saveLocalUsers(users);

  return {
    user: {
      id: created.id,
      name: created.name,
      email: created.email,
      phone: created.phone,
      role: created.role,
      verified: created.verified,
      createdAt: created.createdAt,
    },
    token: buildLocalToken(created.id),
  };
}

function loginLocal(payload: LoginPayload): AuthResponse {
  const users = getLocalUsers();
  const email = payload.email.trim().toLowerCase();
  const matched = users.find(
    (user) => user.email.toLowerCase() === email && user.password === payload.password
  );

  if (!matched) {
    throw new Error("Invalid email or password.");
  }

  return {
    user: {
      id: matched.id,
      name: matched.name,
      email: matched.email,
      phone: matched.phone,
      role: matched.role,
      verified: matched.verified,
      createdAt: matched.createdAt,
    },
    token: buildLocalToken(matched.id),
  };
}

// ─── API calls ───────────────────────────────────────────────

export async function login(payload: LoginPayload) {
  try {
    const res = await apiFetch<ApiSuccess<AuthResponse>>(
      "/api/auth/login",
      { method: "POST", body: JSON.stringify(payload) }
    );
    return res.data;
  } catch (error) {
    if (!shouldUseFallback(error)) throw error;
    return loginLocal(payload);
  }
}

export async function register(payload: RegisterPayload) {
  try {
    const res = await apiFetch<ApiSuccess<AuthResponse>>(
      "/api/auth/register",
      { method: "POST", body: JSON.stringify(payload) }
    );
    return res.data;
  } catch (error) {
    if (!shouldUseFallback(error)) throw error;
    return registerLocal(payload);
  }
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
