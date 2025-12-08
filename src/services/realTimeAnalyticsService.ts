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
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes - shorter cache to pick up database updates

// Maximum rows per analytics query (prevents timeout on large date ranges)
const MAX_ANALYTICS_ROWS = 10000;

// Track if we're currently fetching locations to prevent duplicate requests
const pendingFetches: Map<string, Promise<Location[]>> = new Map();

// Clear cache function for when database is updated
export const clearLocationsCache = () => {
  locationsCache.clear();
  console.log('[Analytics] Location cache cleared');
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

// Fetch available databases - returns your 4 databases
export const fetchDatabases = async (): Promise<Database[]> => {
  try {
    console.log('Fetching databases from:', `${API_BASE_URL}/api/databases`);
    const response = await fetch(`${API_BASE_URL}/api/databases`);
    console.log('Database fetch response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Database fetch failed:', errorText);
      throw new Error(`Failed to fetch databases: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Fetched databases:', data);
    
    // Handle both array response and object with databases array
    const databases = Array.isArray(data) ? data : (data.databases || []);
    console.log('Processed databases:', databases);
    
    return databases;
  } catch (error) {
    console.error('Error fetching databases:', error);
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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout
    
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Analytics] Locations fetch failed:`, errorText);
        throw new Error('Failed to fetch locations');
      }
      
      const data = await response.json();
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
      clearTimeout(timeoutId);
      if ((error as Error).name === 'AbortError') {
        throw new Error('Location fetch timed out');
      }
      throw error;
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

// Fetch time series data for a single database/table/location with row limit
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
    const response = await fetch(url, { signal });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Analytics] Time series fetch failed for ${dbKey}:`, response.status, errorText);
      throw new Error(`Failed to fetch data from ${dbKey}: ${response.status}`);
    }
    
    // Parse JSON response (analytics endpoint returns JSON, not CSV)
    const data = await response.json();
    console.log(`[Analytics] Received ${data.length} data points for ${dbKey}/${table}/${location}`);
    
    // Log sample of returned data for debugging
    if (data.length > 0) {
      console.log(`[Analytics] ${dbKey} sample keys:`, Object.keys(data[0]));
      if (data.length === 0) {
        console.warn(`[Analytics] ${dbKey}: No data found for location ${location}`);
      }
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
