// Centralized API base URL configuration
// Computes base URL at runtime without relying on build-time env vars

export const getApiBaseUrl = (): string => {
  const w = typeof window !== 'undefined' ? (window as any) : undefined;

  // 1) Optional runtime override via global config injected by server
  const cfg = w?.__APP_CONFIG__?.API_BASE_URL as string | undefined;
  if (cfg) {
    console.log('🔧 API Config: Using runtime override:', cfg);
    return cfg.replace(/\/$/, '');
  }

  // 2) Production server for UVM deployment - use same origin (Apache proxies /api)
  if (w && w.location.hostname.includes('uvm.edu')) {
    const baseUrl = `${w.location.protocol}//${w.location.hostname}`;
    console.log('🔧 API Config: UVM deployment detected, using:', baseUrl);
    return baseUrl;
  }

  // 3) Lovable preview or other non-UVM non-localhost deployment - use production API
  if (w && w.location.hostname !== 'localhost' && w.location.hostname !== '127.0.0.1' && !w.location.hostname.includes('uvm.edu')) {
    const baseUrl = 'https://crrels2s.w3.uvm.edu';
    console.log('🔧 API Config: Preview/staging deployment, using production API:', baseUrl);
    return baseUrl;
  }

  // 4) Optional Vite env for local builds only
  const envUrl = (import.meta as any)?.env?.VITE_API_URL as string | undefined;
  if (envUrl && w && (w.location.hostname === 'localhost' || w.location.hostname === '127.0.0.1')) {
    console.log('🔧 API Config: Using Vite env variable:', envUrl);
    return envUrl.replace(/\/$/, '');
  }

  // 5) Local dev fallback
  if (w && (w.location.hostname === 'localhost' || w.location.hostname === '127.0.0.1')) {
    const localUrl = 'http://localhost:3001';
    console.log('🔧 API Config: Local development, using:', localUrl);
    return localUrl;
  }

  // 6) Ultimate fallback to production server
  const fallbackUrl = 'https://crrels2s.w3.uvm.edu';
  console.log('🔧 API Config: Using fallback:', fallbackUrl);
  return fallbackUrl;
};

export const API_BASE_URL = getApiBaseUrl();

// Log the computed API base URL on startup
console.log('📡 API Base URL configured:', API_BASE_URL);

// Database configuration - only seasonal QAQC data is available for direct download
export const DOWNLOADABLE_DATABASE = 'seasonal_qaqc_data';

export const DATABASE_CONFIG = {
  CRRELS2S_raw_data_ingestion: {
    key: 'raw_data',
    name: 'CRRELS2S Raw Data Ingestion',
    downloadable: false,
    description: 'Raw sensor data directly from field loggers, unprocessed'
  },
  CRRELS2S_stage_clean_data: {
    key: 'stage_clean_data',
    name: 'CRRELS2S Stage Clean Data',
    downloadable: false,
    description: 'Intermediate cleaned datasets using basic quality control (QC) filters'
  },
  CRRELS2S_stage_qaqc_data: {
    key: 'stage_qaqc_data',
    name: 'CRRELS2S Stage QAQC Data',
    downloadable: false,
    description: 'Advanced QAQC with calibration, temporal checks, and derived values'
  },
  CRRELS2S_seasonal_qaqc_data: {
    key: 'seasonal_qaqc_data',
    name: 'CRRELS2S Seasonal QAQC Data',
    downloadable: true,
    description: 'Seasonal datasets after QAQC is applied, designed for time-bounded analysis'
  }
} as const;
