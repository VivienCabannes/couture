export { default as en } from "./locales/en.json";
export { default as fr } from "./locales/fr.json";
export { default as es } from "./locales/es.json";

export const LANGUAGES = ["en", "fr", "es"] as const;
export type Language = (typeof LANGUAGES)[number];
