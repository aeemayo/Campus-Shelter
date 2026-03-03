import { apiFetch, type ApiPaginated, type ApiSuccess } from "@/lib/api";

export interface Review {
  id: string;
  rating: number;
  comment: string;
  studentId: string;
  propertyId: string;
  createdAt: string;
  student?: { id: string; name: string };
}

export async function fetchPropertyReviews(propertyId: string) {
  return apiFetch<ApiPaginated<Review>>(`/api/properties/${propertyId}/reviews`);
}

export async function createReview(data: {
  propertyId: string;
  rating: number;
  comment: string;
}) {
  return apiFetch<ApiSuccess<Review>>("/api/reviews", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
