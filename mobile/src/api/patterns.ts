import { apiFetch, apiFetchRaw } from "./client";
import type { PatternRequest, PatternResponse, PatternTypeInfo } from "../types";
import { File, Paths } from "expo-file-system/next";
import * as Sharing from "expo-sharing";

export function fetchPatternTypes(): Promise<PatternTypeInfo[]> {
  return apiFetch<PatternTypeInfo[]>("/api/patterns/types");
}

export function generatePattern(request: PatternRequest): Promise<PatternResponse> {
  return apiFetch<PatternResponse>("/api/patterns/generate", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function downloadAndSharePdf(request: PatternRequest): Promise<void> {
  const response = await apiFetchRaw("/api/patterns/generate", {
    method: "POST",
    body: JSON.stringify({ ...request, output_format: "pdf" }),
  });
  const arrayBuffer = await response.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  const file = new File(Paths.cache, `${request.pattern_type}_pattern.pdf`);
  file.write(uint8Array);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri);
  }
}
