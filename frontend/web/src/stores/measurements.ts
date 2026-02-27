import { useStore } from "zustand";
import { measurementsStore } from "@shared/stores";
import type { MeasurementsStore } from "@shared/stores";

/** React hook wrapper for the vanilla measurements store. */
export function useMeasurementsStore(): MeasurementsStore;
export function useMeasurementsStore<T>(selector: (s: MeasurementsStore) => T): T;
export function useMeasurementsStore<T>(selector?: (s: MeasurementsStore) => T) {
  return useStore(measurementsStore, selector!);
}
