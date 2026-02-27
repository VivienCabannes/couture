/**
 * Vanilla Zustand store for garment selections.
 * Platform-agnostic — use web/mobile hook wrappers to bind to React.
 */

import { createStore } from "zustand/vanilla";
import {
  getSelections,
  addSelection,
  removeSelection,
  saveAdjustments,
} from "../api/patterns";
import type { GarmentSelectionData } from "../api/patterns";

export interface SelectionsState {
  selections: GarmentSelectionData[];
  loaded: boolean;
}

export interface SelectionsActions {
  /** Load selections from the backend. */
  fetch: () => Promise<void>;
  /** Add a garment to selections. */
  addGarment: (name: string) => Promise<void>;
  /** Remove a garment from selections. */
  removeGarment: (name: string) => Promise<void>;
  /** Update adjustments for a garment. */
  saveAdjustments: (name: string, adjustments: Record<string, unknown>) => Promise<void>;
  /** Check if a garment is selected. */
  isSelected: (name: string) => boolean;
}

export type SelectionsStore = SelectionsState & SelectionsActions;

export const selectionsStore = createStore<SelectionsStore>()((set, get) => ({
  selections: [],
  loaded: false,

  fetch: async () => {
    try {
      const data = await getSelections();
      set({ selections: data, loaded: true });
    } catch {
      set({ loaded: true });
    }
  },

  addGarment: async (name) => {
    try {
      const sel = await addSelection(name);
      set((s) => {
        if (s.selections.some((g) => g.garment_name === name)) return s;
        return { selections: [...s.selections, sel] };
      });
    } catch {
      /* silent */
    }
  },

  removeGarment: async (name) => {
    try {
      await removeSelection(name);
      set((s) => ({
        selections: s.selections.filter((g) => g.garment_name !== name),
      }));
    } catch {
      /* silent */
    }
  },

  saveAdjustments: async (name, adjustments) => {
    try {
      const updated = await saveAdjustments(name, adjustments);
      set((s) => ({
        selections: s.selections.map((g) =>
          g.garment_name === name ? updated : g,
        ),
      }));
    } catch {
      /* silent */
    }
  },

  isSelected: (name) => {
    return get().selections.some((g) => g.garment_name === name);
  },
}));
