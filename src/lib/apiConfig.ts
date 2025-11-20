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
  return 'https://crrels2s.w3.uvm.edu';
};

export const API_BASE_URL = getApiBaseUrl();

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
