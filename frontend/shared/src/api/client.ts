/**
 * Platform-aware API client for the Couture backend.
 *
 * Default base URL is http://localhost:8000.
 * Override by calling configureApi({ baseUrl }) at app startup,
 * or by setting EXPO_PUBLIC_API_URL (Expo) / VITE_API_URL (Vite).
 *
 * In the Tauri desktop app, API calls are routed through IPC instead of HTTP.
 */

let baseUrl =
  (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_API_URL) ||
  "http://localhost:8000";

export function configureApi(options: { baseUrl: string }): void {
  baseUrl = options.baseUrl;
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail || response.statusText);
  }
  return response.json();
}

/** Whether we are running inside a Tauri desktop app. */
const isTauri =
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

export function isTauriApp(): boolean {
  return isTauri;
}

/** Invoke a Tauri IPC command. Only call when `isTauriApp()` is true. */
export async function tauriInvoke<T>(
  cmd: string,
  args?: Record<string, unknown>,
): Promise<T> {
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<T>(cmd, args);
}
