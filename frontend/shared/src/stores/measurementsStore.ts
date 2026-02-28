/**
 * Vanilla Zustand store for user measurements.
 * Platform-agnostic (no React dependency) — use web/mobile hook wrappers to bind to React.
 */

import { createStore } from "zustand/vanilla";
import { SIZE_TABLE } from "../types/sizeTable";
import type { FullMeasurements, MeasurementField } from "../types/measurements";
import { getMeasurements, saveMeasurements, fetchPresetMeasurements } from "../api/measurements";

export interface MeasurementsState {
  values: FullMeasurements;
  idk: Record<string, boolean>;
  size: number;
  preset: string | null;
  loaded: boolean;
}

export interface MeasurementsActions {
  /** Load saved measurements from the backend. */
  fetch: () => Promise<void>;
  /** Update a single measurement field and persist. */
  updateField: (field: MeasurementField, value: number) => void;
  /** Toggle the "I don't know" flag for a field and persist. */
  toggleIdk: (field: MeasurementField) => void;
  /** Apply a standard size (recomputes all values from SIZE_TABLE) and persist. */
  applySize: (size: number) => void;
  /** Apply an individual preset (fetches measurements from API) and persist. */
  applyPreset: (person: string) => Promise<void>;
}

export type MeasurementsStore = MeasurementsState & MeasurementsActions;

function defaultValues(): FullMeasurements {
  const m = {} as FullMeasurements;
  for (const key of Object.keys(SIZE_TABLE) as MeasurementField[]) {
    m[key] = SIZE_TABLE[key][0];
  }
  return m;
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

function debouncedSave(state: MeasurementsState) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveMeasurements({
      size: state.size,
      values: state.values as unknown as Record<string, number>,
      idk: state.idk,
    }).catch(() => {
      /* silent — fire-and-forget persistence */
    });
  }, 500);
}

export const measurementsStore = createStore<MeasurementsStore>()((set) => ({
  values: defaultValues(),
  idk: {},
  size: 38,
  preset: null,
  loaded: false,

  fetch: async () => {
    try {
      const data = await getMeasurements();
      set({
        size: data.size,
        values: data.values as unknown as FullMeasurements,
        idk: data.idk,
        loaded: true,
      });
    } catch {
      set({ loaded: true });
    }
  },

  updateField: (field, value) => {
    set((s) => {
      const next = { ...s, values: { ...s.values, [field]: value } };
      debouncedSave(next);
      return next;
    });
  },

  toggleIdk: (field) => {
    set((s) => {
      const next = { ...s, idk: { ...s.idk, [field]: !s.idk[field] } };
      debouncedSave(next);
      return next;
    });
  },

  applySize: (newSize) => {
    const diff = (newSize - 38) / 2;
    set((s) => {
      const nextValues = { ...s.values };
      for (const key of Object.keys(SIZE_TABLE) as MeasurementField[]) {
        const [base, incr] = SIZE_TABLE[key];
        (nextValues as Record<string, number>)[key] = +(base + incr * diff).toFixed(2);
      }
      const next = { ...s, size: newSize, preset: null, values: nextValues };
      debouncedSave(next);
      return next;
    });
  },

  applyPreset: async (person) => {
    try {
      const data = await fetchPresetMeasurements(person);
      set((s) => {
        const next = {
          ...s,
          preset: person,
          values: data as unknown as FullMeasurements,
          idk: {},
        };
        debouncedSave(next);
        return next;
      });
    } catch (err) {
      console.error("Failed to load preset:", err);
    }
  },
}));
