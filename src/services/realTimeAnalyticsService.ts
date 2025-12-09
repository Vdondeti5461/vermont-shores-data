import { API_BASE_URL, DATABASE_CONFIG } from '@/lib/apiConfig';

// Database types - includes Analytics database for unified queries
export type DatabaseType = 
  | 'CRRELS2S_Analytics'  // Unified analytics database with combined tables
  | 'CRRELS2S_raw_data_ingestion'
  | 'CRRELS2S_stage_clean_data'
  | 'CRRELS2S_stage_qaqc_data'
  | 'CRRELS2S_seasonal_qaqc_data';

// Table types - includes combined analytics tables
export type TableType = 
  | 'raw_env_combined_observations'   // Analytics: combined raw data
  | 'clean_env_combined_observations' // Analytics: combined clean data
  | 'raw_env_core_observations'
  | 'raw_env_wind_observations'
  | 'raw_env_snowpack_temperature_profile'
  | 'raw_env_precipitation_observations'
  | 'core_env_observations_qaqc';     // QAQC table

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

// Simple in-memory cache for locations
const locationsCache: Map<string, { data: Location[]; timestamp: number }> = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Maximum rows per analytics query
const MAX_ANALYTICS_ROWS = 100000;

// Simple retry config - reduced complexity
const DEFAULT_TIMEOUT_MS = 30000; // 30s timeout
const DEFAULT_RETRIES = 2;

// Track pending location fetches to prevent duplicates
const pendingLocationFetches: Map<string, Promise<Location[]>> = new Map();

// Clear cache function
export const clearLocationsCache = () => {
  locationsCache.clear();
  pendingLocationFetches.clear();
  console.log('[Analytics] Location cache cleared');
};

// Warm up cache proactively
export const warmUpLocationsCache = async (
  database: DatabaseType = 'CRRELS2S_raw_data_ingestion',
  table: TableType = 'raw_env_core_observations'
): Promise<void> => {
  const cacheKey = `${database}:${table}`;
  const cached = locationsCache.get(cacheKey);
  
  if (!cached || (Date.now() - cached.timestamp) > (CACHE_TTL_MS - 60000)) {
    console.log('[Analytics] Warming up locations cache');
    try {
      await fetchLocations(database, table);
    } catch (error) {
      console.warn('[Analytics] Cache warm-up failed:', error);
    }
  }
};

// Connection health (simplified)
let connectionHealthy = true;
export const isConnectionHealthy = (): boolean => connectionHealthy;

// Force refresh locations
export const forceRefreshLocations = async (
  database: DatabaseType,
  table: TableType,
  signal?: AbortSignal
): Promise<Location[]> => {
  const cacheKey = `${database}:${table}`;
  locationsCache.delete(cacheKey);
  pendingLocationFetches.delete(cacheKey);
  console.log('[Analytics] Force refreshing locations');
  return fetchLocationsInternal(database, table, signal);
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

// Simple fetch with timeout - no complex retry logic here
async function simpleFetch<T>(
  url: string,
  signal?: AbortSignal,
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  // Combine signals if caller provided one
  const combinedSignal = signal 
    ? (() => {
        const combined = new AbortController();
        signal.addEventListener('abort', () => combined.abort());
        controller.signal.addEventListener('abort', () => combined.abort());
        if (signal.aborted) combined.abort();
        return combined.signal;
      })()
    : controller.signal;
  
  try {
    const response = await fetch(url, { 
      signal: combinedSignal,
      headers: { 'Cache-Control': 'no-cache' }
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    connectionHealthy = true;
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    connectionHealthy = false;
    throw error;
  }
}

// Fetch with simple retry
async function fetchWithRetry<T>(
  url: string,
  signal?: AbortSignal,
  retries = DEFAULT_RETRIES
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (signal?.aborted) throw new Error('Request aborted');
    
    try {
      return await simpleFetch<T>(url, signal);
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry if aborted
      if (lastError.name === 'AbortError' || signal?.aborted) {
        throw error;
      }
      
      if (attempt < retries) {
        const delay = 500 * Math.pow(2, attempt); // 500ms, 1s, 2s
        console.warn(`[Analytics] Retry ${attempt + 1}/${retries} in ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new Error(`Failed to connect after ${retries + 1} attempts: ${lastError?.message}`);
}

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

// Internal fetch locations - does the actual work
async function fetchLocationsInternal(
  database: DatabaseType,
  table: TableType,
  signal?: AbortSignal
): Promise<Location[]> {
  const dbKey = getDatabaseKey(database);
  const url = `${API_BASE_URL}/api/databases/${dbKey}/tables/${table}/locations`;
  
  console.log(`[Analytics] Fetching locations from: ${url}`);
  
  const data = await fetchWithRetry<any>(url, signal, 2);
  
  const rawLocations = Array.isArray(data) ? data : (data.locations || []);
  console.log(`[Analytics] Received ${rawLocations.length} locations`);
  
  return rawLocations.map((loc: any, index: number) => ({
    id: typeof loc === 'string' ? loc : (loc.code || loc.name || loc.id || `loc_${index}`),
    name: typeof loc === 'string' ? loc : (loc.displayName || loc.name || loc.code || loc.id),
    coordinates: loc.latitude && loc.longitude ? {
      lat: loc.latitude,
      lng: loc.longitude
    } : undefined
  }));
}

// Fetch locations with caching and deduplication
export const fetchLocations = async (
  database: DatabaseType,
  table: TableType,
  signal?: AbortSignal
): Promise<Location[]> => {
  const cacheKey = `${database}:${table}`;
  
  // Return cached data if valid
  const cached = locationsCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL_MS) {
    console.log(`[Analytics] Using cached locations`);
    return cached.data;
  }

  // If already fetching, wait for it
  const pending = pendingLocationFetches.get(cacheKey);
  if (pending) {
    console.log(`[Analytics] Waiting for pending fetch`);
    return pending;
  }

  // Start new fetch
  const fetchPromise = (async (): Promise<Location[]> => {
    try {
      const locations = await fetchLocationsInternal(database, table, signal);
      locationsCache.set(cacheKey, { data: locations, timestamp: Date.now() });
      return locations;
    } finally {
      pendingLocationFetches.delete(cacheKey);
    }
  })();

  pendingLocationFetches.set(cacheKey, fetchPromise);
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
    const data = await fetchWithRetry<TimeSeriesDataPoint[]>(url, signal, 2);
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

// Get the correct table name for each database based on actual database structure
// Updated to use CRRELS2S_Analytics database with combined tables for better performance
// 
// Database → Table mapping:
// - CRRELS2S_Analytics: raw_env_combined_observations, clean_env_combined_observations (PREFERRED for analytics)
// - CRRELS2S_stage_qaqc_data: core_env_observations_qaqc (QAQC data with indexes)
// - CRRELS2S_seasonal_qaqc_data: core_observations_YYYY_YYYY_qaqc
//
// The Analytics database combines core, wind, and precipitation data into unified tables
// with optimized indexes for fast location + timestamp + attribute queries
export const getTableNameForDatabase = (database: DatabaseType, baseTable: string): string => {
  switch (database) {
    case 'CRRELS2S_Analytics':
      // Analytics database uses combined tables - determine raw vs clean from baseTable hint
      if (baseTable.includes('clean') || baseTable.includes('Clean')) {
        return 'clean_env_combined_observations';
      }
      return 'raw_env_combined_observations';
    
    case 'CRRELS2S_raw_data_ingestion':
      // Legacy: still works but prefer Analytics database
      return 'raw_env_core_observations';
    
    case 'CRRELS2S_stage_clean_data':
      // Legacy: still works but prefer Analytics database
      return 'clean_env_core_observations';
    
    case 'CRRELS2S_stage_qaqc_data':
      // QAQC uses its own database with indexed table
      return 'core_env_observations_qaqc';
    
    case 'CRRELS2S_seasonal_qaqc_data':
      // Seasonal uses specific season tables
      return baseTable;
    
    default:
      return baseTable;
  }
};

// Fetch tables dynamically from database
export const fetchDatabaseTables = async (
  database: DatabaseType
): Promise<{ name: string; displayName: string; rowCount: number }[]> => {
  const dbKey = getDatabaseKey(database);
  const url = `${API_BASE_URL}/api/databases/${dbKey}/tables`;
  
  console.log(`[Analytics] Fetching tables from: ${url}`);
  
  try {
    const data = await fetchWithRetry<any>(url);
    const tables = Array.isArray(data) ? data : (data.tables || []);
    console.log(`[Analytics] Found ${tables.length} tables in ${dbKey}`);
    return tables;
  } catch (error) {
    console.error(`[Analytics] Error fetching tables for ${dbKey}:`, error);
    throw error;
  }
};

// Fetch comparison data across multiple data quality levels (raw, clean, QAQC)
// Updated to use CRRELS2S_Analytics database for raw/clean data with optimized combined tables
// QAQC data still uses CRRELS2S_stage_qaqc_data with core_env_observations_qaqc (indexed)
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
      // Determine the optimal database and table for this data type
      // Use Analytics database for raw/clean (combined, indexed tables)
      // Use QAQC database directly for QAQC data
      let actualDb = db;
      let tableForDb: string;
      
      if (db === 'CRRELS2S_raw_data_ingestion') {
        // Use Analytics database with raw combined table
        actualDb = 'CRRELS2S_Analytics' as DatabaseType;
        tableForDb = 'raw_env_combined_observations';
      } else if (db === 'CRRELS2S_stage_clean_data') {
        // Use Analytics database with clean combined table
        actualDb = 'CRRELS2S_Analytics' as DatabaseType;
        tableForDb = 'clean_env_combined_observations';
      } else {
        // QAQC and seasonal use their own databases with specific tables
        tableForDb = getTableNameForDatabase(db, baseTable);
      }
      
      console.log(`[Analytics] Fetching ${db} -> using ${actualDb} with table: ${tableForDb}`);
      const data = await fetchTimeSeriesData(actualDb, tableForDb as TableType, location, attributes, startDate, endDate, signal);
      // Return original database name for UI consistency
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
// Updated to use Analytics database for raw/clean data
export const fetchServerStatistics = async (
  database: DatabaseType,
  table: string,
  location: string,
  attribute: string,
  startDate?: string,
  endDate?: string,
  signal?: AbortSignal
): Promise<ServerStatistics | null> => {
  // Route to Analytics database for raw/clean, keep QAQC on its own database
  let actualDb = database;
  let tableForDb: string;
  
  if (database === 'CRRELS2S_raw_data_ingestion') {
    actualDb = 'CRRELS2S_Analytics' as DatabaseType;
    tableForDb = 'raw_env_combined_observations';
  } else if (database === 'CRRELS2S_stage_clean_data') {
    actualDb = 'CRRELS2S_Analytics' as DatabaseType;
    tableForDb = 'clean_env_combined_observations';
  } else {
    tableForDb = getTableNameForDatabase(database, table);
  }
  
  const dbKey = getDatabaseKey(actualDb);
  
  const params = new URLSearchParams({
    location,
    attribute,
    ...(startDate && { start_date: startDate }),
    ...(endDate && { end_date: endDate }),
  });

  const url = `${API_BASE_URL}/api/databases/${dbKey}/statistics/${tableForDb}?${params}`;
  console.log(`[Analytics] Fetching server statistics from: ${url}`);
  
  try {
    const data = await fetchWithRetry<ServerStatistics>(url, signal, 2);
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
