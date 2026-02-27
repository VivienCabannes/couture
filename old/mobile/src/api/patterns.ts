export { fetchPatternTypes, generatePattern } from "@shared/api/patterns";

import { apiFetchRaw } from "@shared/api/client";
import type { PatternRequest } from "@shared/types";
import { File, Paths } from "expo-file-system/next";
import * as Sharing from "expo-sharing";

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
