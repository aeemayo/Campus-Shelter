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
  images: string[];
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

export interface Property {
  id: string;
  title: string;
  type: "single-room" | "self-con" | "mini-flat" | "luxury-flat";
  location: string;
  price: number;
  priceMonthly?: number;
  priceWeekly?: number;
  priceType?: "monthly" | "weekly" | "yearly";
  bedrooms: number;
  bathrooms: number;
  images: string[];
  amenities: string[];
  distance: string;
  rating: number;
  reviewCount: number;
  featured: boolean;
  available: boolean;
  furnished: boolean;
  description: string;
  availableFrom?: string;
  approved?: boolean;
  landlordId?: string;
  landlord?: {
    id?: string;
    name: string;
    email?: string;
    phone?: string;
    verified: boolean;
    avatar?: string;
  };
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

export async function createProperty(data: any) {
  return apiFetch<ApiSuccess<ApiProperty>>("/api/properties", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateProperty(id: string, data: any) {
  return apiFetch<ApiSuccess<ApiProperty>>(`/api/properties/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteProperty(id: string) {
  return apiFetch<ApiSuccess<any>>(`/api/properties/${id}`, {
    method: "DELETE",
  });
}

export async function adminApproveProperty(id: string, approved: boolean) {
  return apiFetch<ApiSuccess<ApiProperty>>(`/api/admin/properties/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ approved }),
  });
}

export async function adminDeleteProperty(id: string) {
  return apiFetch<ApiSuccess<any>>(`/api/admin/properties/${id}`, {
    method: "DELETE",
  });
}

export async function fetchAdminAnalytics() {
  return apiFetch<ApiSuccess<any>>("/api/admin/analytics");
}

export async function fetchAdminUsers(role?: string) {
  const query = role ? `?role=${role}` : "";
  return apiFetch<ApiPaginated<any>>(`/api/admin/users${query}`);
}

// ─── Filter Metadata ─────────────────────────────────────────

export const locations = [
  "All Locations",
  "Ilesha Road",
  "FUTA South Gate",
  "North Gate",
  "Aule",
  "Odogbo",
  "Obanla",
];

export const propertyTypes = [
  { label: "All Types", value: "all" },
  { label: "Single Room", value: "single-room" },
  { label: "Self-Contained", value: "self-con" },
  { label: "Mini Flat", value: "mini-flat" },
];

export const amenitiesList = [
  "Wi-Fi",
  "Electricity Backup",
  "Water Supply",
  "Security",
  "Gated",
  "Parking",
  "Wardrobe",
];

export const priceRanges = [
  { label: "Any Price", value: "all", min: 0, max: Infinity },
  { label: "Under ₦150k", value: "under-150k", min: 0, max: 150000 },
  { label: "₦150k - ₦250k", value: "150k-250k", min: 150000, max: 250000 },
  { label: "₦250k - ₦400k", value: "250k-400k", min: 250000, max: 400000 },
  { label: "Above ₦400k", value: "above-400k", min: 400000, max: Infinity },
];
