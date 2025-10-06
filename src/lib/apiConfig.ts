// Centralized API base URL configuration
// Computes base URL at runtime without relying on build-time env vars

export const getApiBaseUrl = (): string => {
  const w = typeof window !== 'undefined' ? (window as any) : undefined;

  // 1) Optional runtime override via global config injected by server
  const cfg = w?.__APP_CONFIG__?.API_BASE_URL as string | undefined;
  if (cfg) return cfg.replace(/\/$/, '');

  // 2) Production server for UVM deployment - use same domain as current site
  if (w && w.location.hostname.includes('uvm.edu')) {
    return `https://${w.location.hostname}`;
  }

  // 3) Production server for any non-localhost deployment
  if (w && w.location.hostname !== 'localhost' && w.location.hostname !== '127.0.0.1') {
    return `https://${w.location.hostname}`;
  }

  // 4) Optional Vite env for local builds only
  const envUrl = (import.meta as any)?.env?.VITE_API_URL as string | undefined;
  if (envUrl && w && (w.location.hostname === 'localhost' || w.location.hostname === '127.0.0.1')) {
    return envUrl.replace(/\/$/, '');
  }

  // 5) Local dev fallback
  if (w && (w.location.hostname === 'localhost' || w.location.hostname === '127.0.0.1')) {
    return 'http://localhost:3001';
  }

  // 6) Ultimate fallback to production server
  return 'https://vdondeti.w3.uvm.edu';
};

export const API_BASE_URL = getApiBaseUrl();
