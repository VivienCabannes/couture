import { apiFetch } from "./client";
import type { GarmentInfo, PatternRequest, PatternResponse, PatternTypeInfo } from "../types/patterns";

export function fetchGarments(): Promise<GarmentInfo[]> {
  return apiFetch<GarmentInfo[]>("/api/shop/garments");
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
