// ─── Properties API service ──────────────────────────────────
import { apiFetch, type ApiPaginated, type ApiSuccess } from "@/lib/api";

// ─── Types matching the backend schema ───────────────────────

export type RoomType = "SINGLE" | "SELF_CON" | "MINI_FLAT";

export interface ApiProperty {
  id: string;
  title: string;
  description: string;
  priceMonthly: number;
  priceWeekly: number;
  location: string;
  latitude: number;
  longitude: number;
  rooms: number;
  bathrooms: number;
  furnished: boolean;
  wifi: boolean;
  electricityBackup: boolean;
  water: boolean;
  security: boolean;
  roomType: RoomType;
  distanceFromFUTA: number;
  availableFrom: string;
  approved: boolean;
  landlordId: string;
  createdAt: string;
  updatedAt: string;
  landlord?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  reviews?: ApiReview[];
  _count?: { bookings: number; reviews: number };
}

export interface ApiReview {
  id: string;
  rating: number;
  comment: string;
  studentId: string;
  propertyId: string;
  createdAt: string;
  student?: { id: string; name: string };
}

// ─── Query params ────────────────────────────────────────────

export interface PropertyQueryParams {
  page?: number;
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  wifi?: boolean;
  furnished?: boolean;
  roomType?: RoomType;
  distanceFromFUTA?: number;
  minRating?: number;
}

// ─── API calls ───────────────────────────────────────────────

export async function fetchProperties(params: PropertyQueryParams = {}) {
  const query = new URLSearchParams();

  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.minPrice) query.set("minPrice", String(params.minPrice));
  if (params.maxPrice) query.set("maxPrice", String(params.maxPrice));
  if (params.location) query.set("location", params.location);
  if (params.wifi) query.set("wifi", "true");
  if (params.furnished) query.set("furnished", "true");
  if (params.roomType) query.set("roomType", params.roomType);
  if (params.distanceFromFUTA)
    query.set("distanceFromFUTA", String(params.distanceFromFUTA));
  if (params.minRating) query.set("minRating", String(params.minRating));

  const qs = query.toString();
  return apiFetch<ApiPaginated<ApiProperty>>(
    `/api/properties${qs ? `?${qs}` : ""}`
  );
}

export async function fetchProperty(id: string) {
  return apiFetch<ApiSuccess<ApiProperty>>(`/api/properties/${id}`);
}
