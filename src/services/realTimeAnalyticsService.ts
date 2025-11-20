import { API_BASE_URL } from '@/lib/apiConfig';

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
  // Extract database key from full database name
  const dbKey = database.replace('CRRELS2S_', '').toLowerCase();
  const response = await fetch(
    `${API_BASE_URL}/api/databases/${dbKey}/tables/${table}/locations`
  );
  if (!response.ok) throw new Error('Failed to fetch locations');
  const data = await response.json();
  // Handle both array response and object with locations array
  const locations = Array.isArray(data) ? data : (data.locations || []);
  // Normalize location format
  return locations.map((loc: any, index: number) => ({
    id: typeof loc === 'string' ? loc : (loc.name || loc.id || `loc_${index}`),
    name: typeof loc === 'string' ? loc : (loc.displayName || loc.name || loc.id),
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
  // Extract database key from full database name
  const dbKey = database.replace('CRRELS2S_', '').toLowerCase();
  const response = await fetch(
    `${API_BASE_URL}/api/databases/${dbKey}/tables/${table}/attributes`
  );
  if (!response.ok) throw new Error('Failed to fetch attributes');
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
  // Extract database key from full database name
  const dbKey = database.replace('CRRELS2S_', '').toLowerCase();
  
  const params = new URLSearchParams({
    location,
    attributes: attributes.join(','),
    ...(startDate && { start_date: startDate }),
    ...(endDate && { end_date: endDate }),
  });

  const response = await fetch(
    `${API_BASE_URL}/api/databases/${dbKey}/download/${table}?${params}`
  );
  
  if (!response.ok) throw new Error('Failed to fetch time series data');
  
  // Parse CSV response
  const csvText = await response.text();
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const data: TimeSeriesDataPoint[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row: any = {};
    headers.forEach((header, index) => {
      const value = values[index];
      // Try to parse as number, otherwise keep as string
      row[header] = !isNaN(Number(value)) && value !== '' ? Number(value) : value;
    });
    data.push(row);
  }
  
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
  const results = await Promise.all(
    databases.map(async (db) => {
      const data = await fetchTimeSeriesData(db, table, location, attributes, startDate, endDate);
      return { database: db, data };
    })
  );
  return results;
};
