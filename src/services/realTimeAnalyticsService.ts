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

// Fetch locations for a specific database and table
export const fetchLocations = async (
  database: DatabaseType,
  table: TableType
): Promise<Location[]> => {
  const dbKey = getDatabaseKey(database);
  const url = `${API_BASE_URL}/api/databases/${dbKey}/tables/${table}/locations`;
  
  console.log(`[Analytics] Fetching locations from: ${url}`);
  
  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Analytics] Locations fetch failed:`, errorText);
    throw new Error('Failed to fetch locations');
  }
  
  const data = await response.json();
  console.log(`[Analytics] Received ${Array.isArray(data) ? data.length : 0} locations`);
  
  // Handle both array response and object with locations array
  const locations = Array.isArray(data) ? data : (data.locations || []);
  
  // Normalize location format - use 'code' for API queries, 'displayName' for UI
  return locations.map((loc: any, index: number) => ({
    id: typeof loc === 'string' ? loc : (loc.code || loc.id || `loc_${index}`),
    name: typeof loc === 'string' ? loc : (loc.displayName || loc.name || loc.code || loc.id),
    coordinates: loc.latitude && loc.longitude ? {
      lat: loc.latitude,
      lng: loc.longitude
    } : undefined
  }));
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

// Fetch time series data for a single database/table/location
export const fetchTimeSeriesData = async (
  database: DatabaseType,
  table: TableType,
  location: string,
  attributes: string[],
  startDate?: string,
  endDate?: string
): Promise<TimeSeriesDataPoint[]> => {
  const dbKey = getDatabaseKey(database);
  
  const params = new URLSearchParams({
    location,
    attributes: attributes.join(','),
    ...(startDate && { start_date: startDate }),
    ...(endDate && { end_date: endDate }),
  });

  const url = `${API_BASE_URL}/api/databases/${dbKey}/analytics/${table}?${params}`;
  console.log(`[Analytics] Fetching time series from: ${url}`);
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Analytics] Time series fetch failed:`, errorText);
    throw new Error('Failed to fetch time series data');
  }
  
  // Parse JSON response (analytics endpoint returns JSON, not CSV)
  const data = await response.json();
  console.log(`[Analytics] Received ${data.length} data points for ${database}/${table}/${location}`);
  
  return data;
};

// Fetch comparison data across multiple data quality levels (raw, clean, QAQC)
export const fetchMultiQualityComparison = async (
  databases: DatabaseType[],
  table: TableType,
  location: string,
  attributes: string[],
  startDate?: string,
  endDate?: string
): Promise<{ database: DatabaseType; data: TimeSeriesDataPoint[] }[]> => {
  console.log(`[Analytics] Fetching multi-quality comparison for ${databases.length} databases`);
  console.log(`[Analytics] Location: ${location}, Attributes: ${attributes.join(', ')}`);
  
  const results = await Promise.all(
    databases.map(async (db) => {
      try {
        const data = await fetchTimeSeriesData(db, table, location, attributes, startDate, endDate);
        return { database: db, data };
      } catch (error) {
        console.error(`[Analytics] Error fetching data for ${db}:`, error);
        return { database: db, data: [] };
      }
    })
  );
  
  const totalPoints = results.reduce((sum, r) => sum + r.data.length, 0);
  console.log(`[Analytics] Total data points across all databases: ${totalPoints}`);
  
  return results;
};
