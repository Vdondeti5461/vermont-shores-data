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
  const response = await fetch(`${API_BASE_URL}/api/databases`);
  if (!response.ok) throw new Error('Failed to fetch databases');
  return response.json();
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
  const response = await fetch(
    `${API_BASE_URL}/api/databases/${database}/tables/${table}/locations`
  );
  if (!response.ok) throw new Error('Failed to fetch locations');
  return response.json();
};

// Fetch attributes for a specific table
export const fetchTableAttributes = async (
  database: DatabaseType,
  table: TableType
): Promise<TableAttribute[]> => {
  const response = await fetch(
    `${API_BASE_URL}/api/databases/${database}/tables/${table}/attributes`
  );
  if (!response.ok) throw new Error('Failed to fetch attributes');
  return response.json();
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
  const params = new URLSearchParams({
    location,
    attributes: attributes.join(','),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  });

  const response = await fetch(
    `${API_BASE_URL}/api/databases/${database}/data/${table}?${params}`
  );
  if (!response.ok) throw new Error('Failed to fetch time series data');
  return response.json();
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
