/**
 * FUTA Gate coordinates and distance utilities.
 * Distances are calculated at render time — never stored.
 */

export interface FutaGate {
  id: "south" | "north" | "west";
  name: string;
  label: string; // short display name
  lat: number;
  lng: number;
}

// Approximate coordinates for FUTA (Federal University of Technology, Akure) gates
export const FUTA_GATES: FutaGate[] = [
  {
    id: "south",
    name: "FUTA South Gate",
    label: "South Gate",
    lat: 7.2982,
    lng: 5.1385,
  },
  {
    id: "north",
    name: "FUTA North Gate",
    label: "North Gate",
    lat: 7.3112,
    lng: 5.1388,
  },
  {
    id: "west",
    name: "FUTA West Gate",
    label: "West Gate",
    lat: 7.3042,
    lng: 5.1272,
  },
];

// Default map center (center of FUTA campus area)
export const FUTA_CENTER: [number, number] = [7.3042, 5.1350];

/**
 * Haversine distance in kilometers between two lat/lng points.
 */
function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface GateDistance {
  gate: FutaGate;
  km: number;
  walkMinutes: number; // avg 5 km/h walking speed
}

/**
 * Returns distances from a point to all FUTA gates, sorted nearest first.
 * Pass custom `gates` from the API; falls back to built-in defaults.
 */
export function distancesToGates(
  lat: number,
  lng: number,
  gates: FutaGate[] = FUTA_GATES
): GateDistance[] {
  return gates
    .map((gate) => {
      const km = haversineKm(lat, lng, gate.lat, gate.lng);
      return {
        gate,
        km: Math.round(km * 10) / 10,
        walkMinutes: Math.round((km / 5) * 60),
      };
    })
    .sort((a, b) => a.km - b.km);
}

/**
 * Returns a short display string for the nearest FUTA gate, e.g.
 * "8 min walk to South Gate" or "1.2 km to South Gate"
 */
export function nearestGateLabel(
  lat: number,
  lng: number,
  gates: FutaGate[] = FUTA_GATES
): string {
  const [nearest] = distancesToGates(lat, lng, gates);
  if (nearest.walkMinutes <= 2) return `At ${nearest.gate.label}`;
  if (nearest.walkMinutes < 60)
    return `${nearest.walkMinutes} min walk to ${nearest.gate.label}`;
  return `${nearest.km} km to ${nearest.gate.label}`;
}
