import { apiFetch } from "./client";
import type { MeasurementsResponse } from "../types";

export function fetchSizes(): Promise<number[]> {
  return apiFetch<number[]>("/api/measurements/sizes");
}

export function fetchDefaultMeasurements(size: number): Promise<MeasurementsResponse> {
  return apiFetch<MeasurementsResponse>(`/api/measurements/defaults/${size}`);
}

export function fetchIndividuals(): Promise<string[]> {
  return apiFetch<string[]>("/api/measurements/individuals");
}

export function fetchIndividualMeasurements(name: string): Promise<MeasurementsResponse> {
  return apiFetch<MeasurementsResponse>(`/api/measurements/individuals/${name}`);
}
