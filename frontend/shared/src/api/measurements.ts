import { apiFetch } from "./client";
import type { MeasurementsResponse } from "../types/patterns";

export function fetchSizes(): Promise<number[]> {
  return apiFetch<number[]>("/api/measurements/sizes");
}

export function fetchDefaultMeasurements(size: number): Promise<MeasurementsResponse> {
  return apiFetch<MeasurementsResponse>(`/api/measurements/defaults/${size}`);
}
