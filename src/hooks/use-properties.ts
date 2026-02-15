import { useQuery } from "@tanstack/react-query";
import {
  fetchProperties,
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
