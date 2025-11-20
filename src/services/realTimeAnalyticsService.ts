import { API_BASE_URL } from '@/lib/apiConfig';

export interface Location {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
  elevation?: number;
}

export interface Season {
  id: string;
  name: string;
  database: string;
  table: string;
  start_date: string;
  end_date: string;
}

export interface TimeSeriesDataPoint {
  timestamp: string;
  location: string;
  // Raw data
  snow_depth_raw?: number;
  air_temperature_raw?: number;
  wind_speed_raw?: number;
  // Clean data
  snow_depth_clean?: number;
  air_temperature_clean?: number;
  wind_speed_clean?: number;
  // QAQC data
  snow_depth_qaqc?: number;
  air_temperature_qaqc?: number;
  wind_speed_qaqc?: number;
}

export interface DatabaseInfo {
  name: string;
  tables: string[];
}

export interface TableAttribute {
  name: string;
  type: string;
}

export class RealTimeAnalyticsService {
  // Fetch all available databases
  static async getDatabases(): Promise<DatabaseInfo[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/databases`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.databases || [];
    } catch (error) {
      console.error('Error fetching databases:', error);
      return [];
    }
  }

  // Fetch tables for a specific database
  static async getTables(database: string): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/databases/${database}/tables`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.tables || [];
    } catch (error) {
      console.error(`Error fetching tables for ${database}:`, error);
      return [];
    }
  }

  // Fetch attributes/columns for a specific table
  static async getTableAttributes(database: string, table: string): Promise<TableAttribute[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/databases/${database}/tables/${table}/attributes`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.attributes || [];
    } catch (error) {
      console.error(`Error fetching attributes for ${database}.${table}:`, error);
      return [];
    }
  }

  // Fetch locations from a specific table
  static async getLocations(database: string, table: string): Promise<Location[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/databases/${database}/tables/${table}/locations`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Map locations to our interface
      const locations: Location[] = (data.locations || []).map((loc: any) => ({
        id: loc.name || loc.location || loc.id,
        name: loc.name || loc.location || loc.id,
        latitude: loc.latitude,
        longitude: loc.longitude,
        elevation: loc.elevation
      }));

      return locations;
    } catch (error) {
      console.error(`Error fetching locations for ${database}.${table}:`, error);
      return [];
    }
  }

  // Discover all available seasons across databases
  static async getSeasons(): Promise<Season[]> {
    try {
      const databases = await this.getDatabases();
      const seasons: Season[] = [];

      for (const db of databases) {
        const tables = db.tables || [];
        
        for (const table of tables) {
          // Extract season information from table names
          // Pattern: cleaned_data_season_2022_2023 or seasonal_qaqc_2023_2024, etc.
          const seasonMatch = table.match(/(?:season|qaqc|clean).*?(\d{4}).*?(\d{4})/i);
          
          if (seasonMatch) {
            const startYear = seasonMatch[1];
            const endYear = seasonMatch[2];
            
            seasons.push({
              id: `${db.name}_${table}`,
              name: `${startYear}-${endYear}`,
              database: db.name,
              table: table,
              start_date: `${startYear}-11-01`, // Season starts Nov 1
              end_date: `${endYear}-07-31`      // Season ends July 31
            });
          }
        }
      }

      // Sort by start date descending (most recent first)
      return seasons.sort((a, b) => b.start_date.localeCompare(a.start_date));
    } catch (error) {
      console.error('Error fetching seasons:', error);
      return [];
    }
  }

  // Fetch time series data for specific attributes, locations, and season
  static async getTimeSeriesData(
    database: string,
    table: string,
    attributes: string[],
    locations?: string[],
    startDate?: string,
    endDate?: string
  ): Promise<TimeSeriesDataPoint[]> {
    try {
      const params = new URLSearchParams({
        database,
        table,
        limit: '50000' // Large limit for comprehensive time series
      });

      if (locations && locations.length > 0) {
        params.append('locations', locations.join(','));
      }
      if (startDate) {
        params.append('start_date', startDate);
      }
      if (endDate) {
        params.append('end_date', endDate);
      }

      const response = await fetch(`${API_BASE_URL}/api/data?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const rawData = data.data || [];

      // Map the data to our interface
      return rawData.map((row: any) => {
        const dataPoint: TimeSeriesDataPoint = {
          timestamp: row.TIMESTAMP || row.datetime || row.timestamp || '',
          location: row.Location || row.location || row.location_name || ''
        };

        // Map attributes dynamically based on what's requested
        attributes.forEach(attr => {
          const attrLower = attr.toLowerCase();
          
          // Try to find the attribute in the row data (case-insensitive)
          const rowKey = Object.keys(row).find(k => k.toLowerCase() === attrLower);
          
          if (rowKey && row[rowKey] != null) {
            // Determine if this is raw, clean, or qaqc data based on database/table name
            if (database.includes('raw') || table.includes('raw')) {
              (dataPoint as any)[`${attrLower}_raw`] = parseFloat(row[rowKey]);
            } else if (database.includes('clean') || table.includes('clean')) {
              (dataPoint as any)[`${attrLower}_clean`] = parseFloat(row[rowKey]);
            } else if (database.includes('qaqc') || table.includes('qaqc')) {
              (dataPoint as any)[`${attrLower}_qaqc`] = parseFloat(row[rowKey]);
            } else {
              // Default mapping
              (dataPoint as any)[attrLower] = parseFloat(row[rowKey]);
            }
          }
        });

        return dataPoint;
      }).filter((point: TimeSeriesDataPoint) => point.timestamp && point.location);
    } catch (error) {
      console.error('Error fetching time series data:', error);
      return [];
    }
  }

  // Fetch data from multiple data quality levels (raw, clean, qaqc)
  static async getMultiQualityData(
    season: Season,
    attributes: string[],
    locations?: string[],
    startDate?: string,
    endDate?: string
  ): Promise<{
    raw: TimeSeriesDataPoint[];
    clean: TimeSeriesDataPoint[];
    qaqc: TimeSeriesDataPoint[];
  }> {
    try {
      // Determine which databases to query based on season
      const rawDb = season.database.replace(/clean|qaqc|seasonal/i, 'raw_data_ingestion');
      const cleanDb = season.database.replace(/raw|qaqc|seasonal/i, 'stage_clean_data');
      const qaqcDb = season.database;

      // Fetch data from all three quality levels in parallel
      const [rawData, cleanData, qaqcData] = await Promise.all([
        this.getTimeSeriesData(rawDb, season.table, attributes, locations, startDate, endDate)
          .catch(() => [] as TimeSeriesDataPoint[]),
        this.getTimeSeriesData(cleanDb, season.table, attributes, locations, startDate, endDate)
          .catch(() => [] as TimeSeriesDataPoint[]),
        this.getTimeSeriesData(qaqcDb, season.table, attributes, locations, startDate, endDate)
          .catch(() => [] as TimeSeriesDataPoint[])
      ]);

      return {
        raw: rawData,
        clean: cleanData,
        qaqc: qaqcData
      };
    } catch (error) {
      console.error('Error fetching multi-quality data:', error);
      return {
        raw: [],
        clean: [],
        qaqc: []
      };
    }
  }
}
