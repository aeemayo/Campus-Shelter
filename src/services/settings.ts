import { apiFetch, type ApiSuccess } from "@/lib/api";
import type { FutaGate } from "@/lib/futa-gates";

export type { FutaGate };

export function fetchFutaGates() {
  return apiFetch<ApiSuccess<{ gates: FutaGate[] }>>("/api/settings/futa-gates");
}

export function updateFutaGates(gates: FutaGate[]) {
  return apiFetch<ApiSuccess<{ gates: FutaGate[] }>>("/api/settings/futa-gates", {
    method: "PATCH",
    body: JSON.stringify({ gates }),
  });
}
