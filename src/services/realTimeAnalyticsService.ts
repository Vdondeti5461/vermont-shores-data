import { API_BASE_URL, DATABASE_CONFIG } from '@/lib/apiConfig';

// Database types matching your 4 databases
export type DatabaseType = 
  | 'CRRELS2S_raw_data_ingestion'
  | 'CRRELS2S_stage_clean_data'
  | 'CRRELS2S_stage_qaqc_data'
  | 'CRRELS2S_seasonal_qaqc_data';

// Table types matching your 4 tables
export type TableType = 
  | 'raw_env_core_observations'
  | 'raw_env_wind_observations'
  | 'raw_env_snowpack_temperature_profile'
  | 'raw_env_precipitation_observations';

export interface Database {
  id: DatabaseType;
  name: string;
  displayName?: string;
  description: string;
  tables: TableType[];
}

export interface Season {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

export interface Location {
  id: string;
  name: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface TableAttribute {
  name: string;
  type: string;
  unit?: string;
  description?: string;
}

export interface TimeSeriesDataPoint {
  timestamp: string;
  location: string;
  [key: string]: string | number | null;
}

// Simple in-memory cache for locations (avoids repeated slow fetches)
const locationsCache: Map<string, { data: Location[]; timestamp: number }> = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes cache - longer for stability

// Maximum rows per analytics query - increased for comprehensive data
// Backend can handle 100k rows efficiently with proper indexing
const MAX_ANALYTICS_ROWS = 100000;

// Retry configuration for resilient connections - more aggressive
const RETRY_CONFIG = {
  maxRetries: 5,
  baseDelayMs: 300,
  maxDelayMs: 5000,
  timeoutMs: 60000, // 60s timeout per request
};

// Track connection health for proactive refresh
let lastSuccessfulFetch: number = Date.now();
let connectionHealthy = true;
let consecutiveFailures = 0;

// Get connection health status
export const isConnectionHealthy = (): boolean => connectionHealthy;

// Mark connection as healthy/unhealthy with tracking
const updateConnectionHealth = (healthy: boolean) => {
  if (healthy) {
    connectionHealthy = true;
    lastSuccessfulFetch = Date.now();
    consecutiveFailures = 0;
  } else {
    consecutiveFailures++;
    // Only mark unhealthy after multiple failures
    if (consecutiveFailures >= 3) {
      connectionHealthy = false;
    }
  }
};

// Force refresh location cache - used when connection issues are detected
export const forceRefreshLocations = async (
  database: DatabaseType,
  table: TableType
): Promise<Location[]> => {
  const cacheKey = `${database}:${table}`;
  // Clear existing cache and pending fetches for this key
  locationsCache.delete(cacheKey);
  pendingFetches.delete(cacheKey);
  console.log('[Analytics] Force refreshing locations for:', cacheKey);
  return fetchLocations(database, table);
};

// Statistics computed server-side from full dataset
export interface ServerStatistics {
  count: number;
  total: number;
  mean: number | null;
  min: number | null;
  max: number | null;
  stdDev: number | null;
  completeness: number;
  dateRange: {
    start: string | null;
    end: string | null;
  };
  computedAt: string;
}

// Track if we're currently fetching locations to prevent duplicate requests
const pendingFetches: Map<string, Promise<Location[]>> = new Map();

// Robust fetch with retry logic and exponential backoff
async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  retries = RETRY_CONFIG.maxRetries
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), RETRY_CONFIG.timeoutMs);
    
    // Merge abort signals if one was provided
    const signal = options.signal 
      ? combineAbortSignals(options.signal, controller.signal)
      : controller.signal;
    
    try {
      const response = await fetch(url, { 
        ...options, 
        signal,
        // Add cache control to prevent stale cached responses
        headers: {
          ...options.headers,
          'Cache-Control': 'no-cache',
        }
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      updateConnectionHealth(true);
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error as Error;
      
      // Don't retry if request was intentionally aborted by caller
      if (options.signal?.aborted) {
        throw error;
      }
      
      const isNetworkError = lastError.name === 'AbortError' || 
                            lastError.message.includes('fetch') ||
                            lastError.message.includes('network') ||
                            lastError.message.includes('Failed to fetch');
      
      if (attempt < retries) {
        // Retry on network errors OR server errors (5xx)
        const isServerError = lastError.message.includes('HTTP 5');
        if (isNetworkError || isServerError) {
          const delay = Math.min(
            RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt),
            RETRY_CONFIG.maxDelayMs
          );
          console.warn(`[Analytics] Request failed, retrying in ${delay}ms (attempt ${attempt + 1}/${retries}):`, lastError.message);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
    }
  }
  
  updateConnectionHealth(false);
  throw new Error(`Failed to connect to data server after ${retries} retries: ${lastError?.message}`);
}

// Helper to combine multiple abort signals
function combineAbortSignals(signal1: AbortSignal, signal2: AbortSignal): AbortSignal {
  const controller = new AbortController();
  
  const abort = () => controller.abort();
  signal1.addEventListener('abort', abort);
  signal2.addEventListener('abort', abort);
  
  if (signal1.aborted || signal2.aborted) {
    controller.abort();
  }
  
  return controller.signal;
}

// Clear cache function for when database is updated
export const clearLocationsCache = () => {
  locationsCache.clear();
  pendingFetches.clear();
  console.log('[Analytics] Location cache cleared');
};

// Warm up the cache proactively - call this when app becomes visible
export const warmUpLocationsCache = async (
  database: DatabaseType = 'CRRELS2S_raw_data_ingestion',
  table: TableType = 'raw_env_core_observations'
): Promise<void> => {
  const cacheKey = `${database}:${table}`;
  const cached = locationsCache.get(cacheKey);
  
  // Only warm up if cache is expired or about to expire (within 2 minutes)
  const cacheStale = !cached || (Date.now() - cached.timestamp) > (CACHE_TTL_MS - 2 * 60 * 1000);
  
  if (cacheStale) {
    console.log('[Analytics] Warming up locations cache proactively');
    try {
      await fetchLocations(database, table);
    } catch (error) {
      console.warn('[Analytics] Cache warm-up failed:', error);
    }
  }
};

// Helper function to get the API database key from the full database type
function getDatabaseKey(database: DatabaseType): string {
  const config = DATABASE_CONFIG[database];
  if (config) {
    return config.key;
  }
  // Fallback: manual conversion
  return database
    .replace('CRRELS2S_', '')
    .replace('_ingestion', '')
    .toLowerCase();
}

// Fetch available databases - returns your 4 databases (with retry)
export const fetchDatabases = async (): Promise<Database[]> => {
  try {
    const url = `${API_BASE_URL}/api/databases`;
    console.log('[Analytics] Fetching databases from:', url);
    
    const data = await fetchWithRetry<any>(url);
    
    // Handle both array response and object with databases array
    const databases = Array.isArray(data) ? data : (data.databases || []);
    console.log('[Analytics] Fetched databases:', databases.length);
    
    return databases;
  } catch (error) {
    console.error('[Analytics] Error fetching databases:', error);
    throw error;
  }
};

// Fetch available seasons
export const fetchSeasons = async (): Promise<Season[]> => {
  const response = await fetch(`${API_BASE_URL}/api/seasons`);
  if (!response.ok) throw new Error('Failed to fetch seasons');
  return response.json();
};

// Fetch locations for a specific database and table - with caching and deduplication
export const fetchLocations = async (
  database: DatabaseType,
  table: TableType
): Promise<Location[]> => {
  const cacheKey = `${database}:${table}`;
  const cached = locationsCache.get(cacheKey);
  
  // Return cached data if still valid
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL_MS) {
    console.log(`[Analytics] Using cached locations for ${cacheKey}`);
    return cached.data;
  }

  // If there's already a pending fetch for this key, wait for it
  const pending = pendingFetches.get(cacheKey);
  if (pending) {
    console.log(`[Analytics] Waiting for pending fetch: ${cacheKey}`);
    return pending;
  }

  const dbKey = getDatabaseKey(database);
  const url = `${API_BASE_URL}/api/databases/${dbKey}/tables/${table}/locations`;
  
  console.log(`[Analytics] Fetching locations from: ${url}`);
  
  const fetchPromise = (async (): Promise<Location[]> => {
    try {
      const data = await fetchWithRetry<any>(url, {}, 2); // 2 retries for locations
      
      console.log(`[Analytics] Received ${Array.isArray(data) ? data.length : 0} locations`);
      
      // Handle both array response and object with locations array
      const rawLocations = Array.isArray(data) ? data : (data.locations || []);
      
      // Normalize location format - use 'code' for API queries, 'displayName' for UI
      const locations = rawLocations.map((loc: any, index: number) => ({
        id: typeof loc === 'string' ? loc : (loc.code || loc.name || loc.id || `loc_${index}`),
        name: typeof loc === 'string' ? loc : (loc.displayName || loc.name || loc.code || loc.id),
        coordinates: loc.latitude && loc.longitude ? {
          lat: loc.latitude,
          lng: loc.longitude
        } : undefined
      }));
      
      // Cache the results
      locationsCache.set(cacheKey, { data: locations, timestamp: Date.now() });
      
      return locations;
    } catch (error) {
      throw new Error(`Failed to connect to data server. Please try again later.`);
    } finally {
      pendingFetches.delete(cacheKey);
    }
  })();

  pendingFetches.set(cacheKey, fetchPromise);
  return fetchPromise;
};

// Fetch attributes for a specific table
export const fetchTableAttributes = async (
  database: DatabaseType,
  table: TableType
): Promise<TableAttribute[]> => {
  const dbKey = getDatabaseKey(database);
  const url = `${API_BASE_URL}/api/databases/${dbKey}/tables/${table}/attributes`;
  
  console.log(`[Analytics] Fetching attributes from: ${url}`);
  
  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Analytics] Attributes fetch failed:`, errorText);
    throw new Error('Failed to fetch attributes');
  }
  
  const data = await response.json();
  // Handle both array response and object with attributes array
  return Array.isArray(data) ? data : (data.attributes || []);
};

// Fetch time series data for a single database/table/location with row limit (with retry)
export const fetchTimeSeriesData = async (
  database: DatabaseType,
  table: string, // Accept any table name (raw_, clean_, qaqc_ prefixed)
  location: string,
  attributes: string[],
  startDate?: string,
  endDate?: string,
  signal?: AbortSignal
): Promise<TimeSeriesDataPoint[]> => {
  const dbKey = getDatabaseKey(database);
  
  const params = new URLSearchParams({
    location,
    attributes: attributes.join(','),
    limit: String(MAX_ANALYTICS_ROWS),
    ...(startDate && { start_date: startDate }),
    ...(endDate && { end_date: endDate }),
  });

  const url = `${API_BASE_URL}/api/databases/${dbKey}/analytics/${table}?${params}`;
  console.log(`[Analytics] Fetching time series from: ${url}`);
  
  try {
    const data = await fetchWithRetry<TimeSeriesDataPoint[]>(url, { signal }, 2);
    console.log(`[Analytics] Received ${data.length} data points for ${dbKey}/${table}/${location}`);
    
    // Log sample of returned data for debugging
    if (data.length > 0) {
      console.log(`[Analytics] ${dbKey} sample keys:`, Object.keys(data[0]));
    } else {
      console.warn(`[Analytics] ${dbKey}: Empty response - location '${location}' might not exist in this database`);
    }
    
    return data;
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      throw error; // Re-throw abort errors
    }
    console.error(`[Analytics] Error fetching ${dbKey}:`, error);
    throw error;
  }
};

// Get the correct table name for each database (different naming conventions)
export const getTableNameForDatabase = (database: DatabaseType, baseTable: string): string => {
  // Each database uses a different prefix for the same observation type
  const tablePrefix = baseTable.replace(/^(raw_|clean_|qaqc_)/, '');
  
  switch (database) {
    case 'CRRELS2S_raw_data_ingestion':
      return `raw_${tablePrefix}`;
    case 'CRRELS2S_stage_clean_data':
      return `clean_${tablePrefix}`;
    case 'CRRELS2S_stage_qaqc_data':
      return `qaqc_${tablePrefix}`;
    case 'CRRELS2S_seasonal_qaqc_data':
      return `seasonal_${tablePrefix}`;
    default:
      return baseTable;
  }
};

// Fetch comparison data across multiple data quality levels (raw, clean, QAQC)
export const fetchMultiQualityComparison = async (
  databases: DatabaseType[],
  baseTable: string, // e.g., 'env_core_observations' or 'raw_env_core_observations'
  location: string,
  attributes: string[],
  startDate?: string,
  endDate?: string,
  signal?: AbortSignal
): Promise<{ database: DatabaseType; data: TimeSeriesDataPoint[] }[]> => {
  console.log(`[Analytics] Fetching multi-quality comparison for ${databases.length} databases`);
  console.log(`[Analytics] Location: ${location}, Attributes: ${attributes.join(', ')}`);
  console.log(`[Analytics] Date range: ${startDate || 'none'} to ${endDate || 'none'}`);
  
  const results = await Promise.allSettled(
    databases.map(async (db) => {
      // Get the correct table name for this specific database
      const tableForDb = getTableNameForDatabase(db, baseTable);
      console.log(`[Analytics] Fetching ${db} with table: ${tableForDb}`);
      const data = await fetchTimeSeriesData(db, tableForDb as TableType, location, attributes, startDate, endDate, signal);
      return { database: db, data };
    })
  );
  
  // Process results - include both successful and failed (with empty data)
  const processed = results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      console.warn(`[Analytics] Failed to fetch ${databases[index]}:`, result.reason?.message);
      return { database: databases[index], data: [] };
    }
  });
  
  const totalPoints = processed.reduce((sum, r) => sum + r.data.length, 0);
  console.log(`[Analytics] Total data points across all databases: ${totalPoints}`);
  
  // Log per-database counts for debugging
  processed.forEach(({ database, data }) => {
    console.log(`[Analytics] ${database}: ${data.length} points`);
  });
  
  return processed;
};

// Fetch server-side computed statistics for a single database/table/location/attribute
// Statistics are computed from the FULL dataset (not sampled) for scientific accuracy (with retry)
export const fetchServerStatistics = async (
  database: DatabaseType,
  table: string,
  location: string,
  attribute: string,
  startDate?: string,
  endDate?: string,
  signal?: AbortSignal
): Promise<ServerStatistics | null> => {
  const dbKey = getDatabaseKey(database);
  const tableForDb = getTableNameForDatabase(database, table);
  
  const params = new URLSearchParams({
    location,
    attribute,
    ...(startDate && { start_date: startDate }),
    ...(endDate && { end_date: endDate }),
  });

  const url = `${API_BASE_URL}/api/databases/${dbKey}/statistics/${tableForDb}?${params}`;
  console.log(`[Analytics] Fetching server statistics from: ${url}`);
  
  try {
    const data = await fetchWithRetry<ServerStatistics>(url, { signal }, 2);
    console.log(`[Analytics] Server statistics for ${dbKey}: ${data.count} valid points from ${data.total} total`);
    return data;
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      throw error;
    }
    console.error(`[Analytics] Error fetching statistics for ${dbKey}:`, error);
    return null;
  }
};

// Fetch statistics for multiple databases in parallel (for comparison view)
export const fetchMultiDatabaseStatistics = async (
  databases: DatabaseType[],
  baseTable: string,
  location: string,
  attribute: string,
  startDate?: string,
  endDate?: string,
  signal?: AbortSignal
): Promise<{ database: DatabaseType; stats: ServerStatistics | null }[]> => {
  console.log(`[Analytics] Fetching statistics for ${databases.length} databases`);
  
  const results = await Promise.allSettled(
    databases.map(async (db) => {
      const stats = await fetchServerStatistics(db, baseTable, location, attribute, startDate, endDate, signal);
      return { database: db, stats };
    })
  );
  
  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    return { database: databases[index], stats: null };
  });
};
