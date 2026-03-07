import { useQuery } from "@tanstack/react-query";
import {
  fetchProperties,
  fetchLocations,
  fallbackLocations,
  type PropertyQueryParams,
} from "@/services/properties";

/**
 * React Query hook that fetches properties from the backend.
 * Falls back gracefully so the page can still render mock data
 * when the API is unreachable.
 */
export function useProperties(params: PropertyQueryParams = {}) {
  return useQuery({
    queryKey: ["properties", params],
    queryFn: () => fetchProperties(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 1,
  });
}

/**
 * Fetches distinct location values from the DB.
 * Falls back to a static list while loading or on error.
 */
export function useLocations() {
  const { data } = useQuery({
    queryKey: ["locations"],
    queryFn: fetchLocations,
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 1,
  });
  return data ?? fallbackLocations;
}
