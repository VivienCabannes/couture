import { useStore } from "zustand";
import { selectionsStore } from "@shared/stores";
import type { SelectionsStore } from "@shared/stores";

/** React hook wrapper for the vanilla selections store. */
export function useSelectionsStore(): SelectionsStore;
export function useSelectionsStore<T>(selector: (s: SelectionsStore) => T): T;
export function useSelectionsStore<T>(selector?: (s: SelectionsStore) => T) {
  return useStore(selectionsStore, selector!);
}
