import { apiFetch, isTauriApp, tauriInvoke } from "./client";
import type { MeasurementsResponse } from "../types/patterns";

export function fetchSizes(): Promise<number[]> {
  if (isTauriApp()) return tauriInvoke<number[]>("fetch_sizes");
  return apiFetch<number[]>("/api/measurements/sizes");
}

export function fetchDefaultMeasurements(size: number): Promise<MeasurementsResponse> {
  if (isTauriApp()) return tauriInvoke<MeasurementsResponse>("fetch_default_measurements", { size });
  return apiFetch<MeasurementsResponse>(`/api/measurements/defaults/${size}`);
}

/** List available individual measurement presets (e.g. ["kwama", "vivien"]). */
export function fetchPresets(): Promise<string[]> {
  if (isTauriApp()) return tauriInvoke<string[]>("fetch_presets");
  return apiFetch<string[]>("/api/measurements/presets");
}

/** Fetch all measurements for a specific individual preset. */
export function fetchPresetMeasurements(person: string): Promise<MeasurementsResponse> {
  if (isTauriApp()) return tauriInvoke<MeasurementsResponse>("fetch_preset_measurements", { person });
  return apiFetch<MeasurementsResponse>(`/api/measurements/presets/${person}`);
}

export interface SavedMeasurementsData {
  size: number;
  values: Record<string, number>;
  idk: Record<string, boolean>;
}

/** Load saved measurements from the backend (or defaults if none saved). */
export function getMeasurements(): Promise<SavedMeasurementsData> {
  if (isTauriApp()) return tauriInvoke<SavedMeasurementsData>("get_measurements");
  return apiFetch<SavedMeasurementsData>("/api/measurements");
}

/** Persist measurements to the backend. */
export function saveMeasurements(
  data: { size: number; values: Record<string, number>; idk?: Record<string, boolean> },
): Promise<SavedMeasurementsData> {
  if (isTauriApp()) return tauriInvoke<SavedMeasurementsData>("save_measurements", data);
  return apiFetch<SavedMeasurementsData>("/api/measurements", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
