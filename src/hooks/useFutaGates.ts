import { useQuery } from "@tanstack/react-query";
import { fetchFutaGates } from "@/services/settings";
import { FUTA_GATES, type FutaGate, distancesToGates, nearestGateLabel } from "@/lib/futa-gates";

export function useFutaGates() {
  const { data } = useQuery({
    queryKey: ["futa-gates"],
    queryFn: fetchFutaGates,
    staleTime: 1000 * 60 * 60, // re-fetch at most once per hour
  });

  const gates: FutaGate[] = data?.data?.gates ?? FUTA_GATES;

  return {
    gates,
    distancesTo: (lat: number, lng: number) => distancesToGates(lat, lng, gates),
    nearestLabel: (lat: number, lng: number) => nearestGateLabel(lat, lng, gates),
  };
}
