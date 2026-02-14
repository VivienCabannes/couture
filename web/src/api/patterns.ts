import { apiFetch, apiFetchRaw } from "./client";
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

export async function downloadPatternPdf(request: PatternRequest): Promise<void> {
  const response = await apiFetchRaw("/api/patterns/generate", {
    method: "POST",
    body: JSON.stringify({ ...request, output_format: "pdf" }),
  });
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${request.pattern_type}_pattern.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
