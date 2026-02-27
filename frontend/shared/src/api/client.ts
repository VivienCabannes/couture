/**
 * Platform-aware API client for the Couture backend.
 *
 * - Web: reads VITE_API_URL env var
 * - Mobile (Expo): reads EXPO_PUBLIC_API_URL env var
 * - Default: http://localhost:8000
 */

function getBaseUrl(): string {
  // Vite (web)
  if (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_URL) {
    return (import.meta as any).env.VITE_API_URL;
  }
  // Expo (mobile)
  if (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  return "http://localhost:8000";
}

let baseUrl = getBaseUrl();

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
