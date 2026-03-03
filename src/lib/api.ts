// ─── API Client ──────────────────────────────────────────────
// Base HTTP client for the Campus Shelter backend API.

// In development the Vite dev-server proxies /api requests to the real
// backend, avoiding CORS issues. In production use the full URL.
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "" : "https://campus-shelter.vercel.app");

const API_KEY = import.meta.env.VITE_API_KEY ?? "";

/**
 * Lightweight fetch wrapper that injects the API key, auth token, and
 * JSON Content-Type on every request.
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("cs_token");

  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    "x-api-key": API_KEY,
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let json: any = null;
  const contentType = res.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    try {
      json = await res.json();
    } catch (e) {
      console.error("[API JSON Parse Error]", e);
    }
  }

  if (!res.ok) {
    const message =
      json?.message ?? json?.error ?? `Request failed with status ${res.status}`;
    const err = new ApiError(message, res.status, json?.errors);
    throw err;
  }

  return json as T;
}

// ─── Typed Error ─────────────────────────────────────────────

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(
    message: string,
    status: number,
    errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

// ─── Generic response shapes from the backend ────────────────

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiPaginated<T> {
  success: true;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
