import { apiFetch } from "./client";
import type { MeasurementsResponse } from "../types/patterns";

export function fetchSizes(): Promise<number[]> {
  return apiFetch<number[]>("/api/measurements/sizes");
}

export function fetchDefaultMeasurements(size: number): Promise<MeasurementsResponse> {
  return apiFetch<MeasurementsResponse>(`/api/measurements/defaults/${size}`);
}

export interface SavedMeasurementsData {
  size: number;
  values: Record<string, number>;
  idk: Record<string, boolean>;
}

/** Load saved measurements from the backend (or defaults if none saved). */
export function getMeasurements(): Promise<SavedMeasurementsData> {
  return apiFetch<SavedMeasurementsData>("/api/measurements");
}

/** Persist measurements to the backend. */
export function saveMeasurements(
  data: { size: number; values: Record<string, number>; idk?: Record<string, boolean> },
): Promise<SavedMeasurementsData> {
  return apiFetch<SavedMeasurementsData>("/api/measurements", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
