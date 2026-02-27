import { apiFetch } from "./client";
import type { GarmentInfo, PatternRequest, PatternResponse, PatternTypeInfo, PieceInfo } from "../types/patterns";

export function fetchGarments(): Promise<GarmentInfo[]> {
  return apiFetch<GarmentInfo[]>("/api/shop/garments");
}

export function fetchPieces(): Promise<PieceInfo[]> {
  return apiFetch<PieceInfo[]>("/api/shop/pieces");
}

export function fetchPatternTypes(): Promise<PatternTypeInfo[]> {
  return apiFetch<PatternTypeInfo[]>("/api/modelist/patterns");
}

export function generatePattern(request: PatternRequest): Promise<PatternResponse> {
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
  return apiFetch<GarmentSelectionData[]>("/api/shop/selections");
}

/** Add a garment to selections. */
export function addSelection(garmentName: string): Promise<GarmentSelectionData> {
  return apiFetch<GarmentSelectionData>(`/api/shop/selections/${garmentName}`, {
    method: "POST",
  });
}

/** Remove a garment from selections. */
export function removeSelection(garmentName: string): Promise<void> {
  return apiFetch<void>(`/api/shop/selections/${garmentName}`, {
    method: "DELETE",
  });
}

/** Update per-piece adjustments for a selected garment. */
export function saveAdjustments(
  garmentName: string,
  adjustments: Record<string, unknown>,
): Promise<GarmentSelectionData> {
  return apiFetch<GarmentSelectionData>(
    `/api/shop/selections/${garmentName}/adjustments`,
    {
      method: "PUT",
      body: JSON.stringify({ adjustments }),
    },
  );
}
