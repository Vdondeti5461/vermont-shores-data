// Centralized API base URL configuration
// Computes base URL at runtime without relying on build-time env vars

export const getApiBaseUrl = (): string => {
  const w = typeof window !== 'undefined' ? (window as any) : undefined;

  // 1) Optional runtime override via global config injected by server
  const cfg = w?.__APP_CONFIG__?.API_BASE_URL as string | undefined;
  if (cfg) return cfg.replace(/\/$/, '');

  // 2) Optional Vite env for local builds only
  const envUrl = (import.meta as any)?.env?.VITE_API_URL as string | undefined;
  if (envUrl && w && (w.location.hostname === 'localhost' || w.location.hostname === '127.0.0.1')) {
    return envUrl.replace(/\/$/, '');
  }

  // 3) Local dev fallback
  if (w && (w.location.hostname === 'localhost' || w.location.hostname === '127.0.0.1')) {
    return 'http://localhost:3001';
  }

  // 4) Default to same-origin in production (assumes API is reverse-proxied under same host)
  return w ? w.location.origin : '';
};

export const API_BASE_URL = getApiBaseUrl();
