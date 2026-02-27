export { configureApi, apiFetch } from "./client";
export { fetchGarments, fetchPatternTypes, generatePattern, getSelections, addSelection, removeSelection, saveAdjustments } from "./patterns";
export type { GarmentSelectionData } from "./patterns";
export { fetchSizes, fetchDefaultMeasurements, getMeasurements, saveMeasurements } from "./measurements";
export type { SavedMeasurementsData } from "./measurements";
