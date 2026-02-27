/**
 * Platform-aware API client for the Couture backend.
 *
 * Default base URL is http://localhost:8000.
 * Override by calling configureApi({ baseUrl }) at app startup,
 * or by setting EXPO_PUBLIC_API_URL (Expo) / VITE_API_URL (Vite).
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
