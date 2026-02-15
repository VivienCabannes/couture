export { fetchPatternTypes, generatePattern } from "@shared/api/patterns";

import { apiFetchRaw } from "@shared/api/client";
import type { PatternRequest } from "@shared/types";

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
