import { apiFetch, type ApiSuccess } from "@/lib/api";

export async function fetchFavoriteIds(): Promise<string[]> {
  const res = await apiFetch<ApiSuccess<{ propertyIds: string[] }>>("/api/favorites");
  return res.data.propertyIds;
}

export async function toggleFavoriteApi(
  propertyId: string,
): Promise<{ favorited: boolean; propertyId: string }> {
  const res = await apiFetch<ApiSuccess<{ favorited: boolean; propertyId: string }>>(
    "/api/favorites",
    { method: "POST", body: JSON.stringify({ propertyId }) },
  );
  return res.data;
}
