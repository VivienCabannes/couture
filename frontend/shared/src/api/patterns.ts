import { apiFetch, isTauriApp, tauriInvoke } from "./client";
import type { GarmentInfo, PatternRequest, PatternResponse, PatternTypeInfo, PieceInfo } from "../types/patterns";

export function fetchGarments(): Promise<GarmentInfo[]> {
  if (isTauriApp()) return tauriInvoke<GarmentInfo[]>("fetch_garments");
  return apiFetch<GarmentInfo[]>("/api/shop/garments");
}

export function fetchPieces(): Promise<PieceInfo[]> {
  if (isTauriApp()) return tauriInvoke<PieceInfo[]>("fetch_pieces");
  return apiFetch<PieceInfo[]>("/api/shop/pieces");
}

export function fetchPatternTypes(): Promise<PatternTypeInfo[]> {
  if (isTauriApp()) return tauriInvoke<PatternTypeInfo[]>("fetch_pattern_types");
  return apiFetch<PatternTypeInfo[]>("/api/modelist/patterns");
}

export function generatePattern(request: PatternRequest): Promise<PatternResponse> {
  if (isTauriApp()) return tauriInvoke<PatternResponse>("generate_pattern", { request });
  return apiFetch<PatternResponse>("/api/modelist/generate", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export interface GarmentSelectionData {
  garment_name: string;
  added_at: number;
  adjustments: Record<string, unknown> | null;
}

/** List all selected garments. */
export function getSelections(): Promise<GarmentSelectionData[]> {
  if (isTauriApp()) return tauriInvoke<GarmentSelectionData[]>("get_selections");
  return apiFetch<GarmentSelectionData[]>("/api/shop/selections");
}

/** Add a garment to selections. */
export function addSelection(garmentName: string): Promise<GarmentSelectionData> {
  if (isTauriApp()) return tauriInvoke<GarmentSelectionData>("add_selection", { garmentName });
  return apiFetch<GarmentSelectionData>(`/api/shop/selections/${garmentName}`, {
    method: "POST",
  });
}

/** Remove a garment from selections. */
export function removeSelection(garmentName: string): Promise<void> {
  if (isTauriApp()) return tauriInvoke<void>("remove_selection", { garmentName });
  return apiFetch<void>(`/api/shop/selections/${garmentName}`, {
    method: "DELETE",
  });
}

/** Update per-piece adjustments for a selected garment. */
export function saveAdjustments(
  garmentName: string,
  adjustments: Record<string, unknown>,
): Promise<GarmentSelectionData> {
  if (isTauriApp()) return tauriInvoke<GarmentSelectionData>("save_adjustments", { garmentName, adjustments });
  return apiFetch<GarmentSelectionData>(
    `/api/shop/selections/${garmentName}/adjustments`,
    {
      method: "PUT",
      body: JSON.stringify({ adjustments }),
    },
  );
}
