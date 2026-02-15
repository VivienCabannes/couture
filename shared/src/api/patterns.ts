import { apiFetch } from "./client";
import type { PatternRequest, PatternResponse, PatternTypeInfo } from "../types";

export function fetchPatternTypes(): Promise<PatternTypeInfo[]> {
  return apiFetch<PatternTypeInfo[]>("/api/patterns/types");
}

export function generatePattern(request: PatternRequest): Promise<PatternResponse> {
  return apiFetch<PatternResponse>("/api/patterns/generate", {
    method: "POST",
    body: JSON.stringify(request),
  });
}
