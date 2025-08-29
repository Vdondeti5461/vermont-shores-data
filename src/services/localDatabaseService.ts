import { API_BASE_URL } from '@/lib/apiConfig';

// Local Database Service for MySQL Integration
export interface LocationData {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
}

export interface Database {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
}

export interface EnvironmentalData {
  id?: number;
  timestamp: string;
  record: number;
  location: string;
  [key: string]: any; // For dynamic metrics like temperature, wind, etc.
}

export interface TableMetadata {
  table_name: string;
  columns: {
    name: string;
    type: string;
    nullable: boolean;
    default: any;
    comment: string;
  }[];
}

export interface AnalyticsData {
  temperature: {
    average: number | null;
    min: number | null;
    max: number | null;
    count: number;
  };
  humidity: {
    average: number | null;
  };
  wind: {
    average_speed: number | null;
    max_speed: number | null;
    average_direction: number | null;
    count: number;
  };
  precipitation: {
    total: number;
    average_intensity: number | null;
    count: number;
  };
  snow: {
    average_swe: number | null;
    average_density: number | null;
    count: number;
  };
  period: {
    start: string;
    end: string;
  };
  database?: string;
  database_name?: string;
}

export interface DatabaseInfo {
  id: string;
  name: string;
  database_name: string;
  originalKey?: string;
  category?: string;
  order?: number;
}

export interface SeasonInfo {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
}

export interface DatabasesResponse {
  databases: DatabaseInfo[];
  seasons: SeasonInfo[];
  tables: string[];
}

export class LocalDatabaseService {
  static get baseUrl() {
    return API_BASE_URL;
  }

  // Available tables in the database
  static readonly TABLES = {
    TABLE1: 'table1',
    WIND: 'Wind',
    SNOW_TEMP_PROFILE: 'SnowpkTempProfile',
    PRECIPITATION: 'Precipitation'
  } as const;

  // Database mapping configuration - only show 4 main databases
  static readonly DATABASE_MAPPING = {
    'crrels2s_main': {
      id: 'raw_data',
      name: 'Raw Data',
      displayName: 'Raw Environmental Data',
      category: 'raw',
      order: 1
    },
    'crrels2s_processeddata': {
      id: 'initial_clean',
      name: 'Initial Clean Data',
      displayName: 'Initially Processed Data',
      category: 'processed',
      order: 2
    },
    'crrels2s_vtclimaterepository_processed': {
      id: 'final_clean',
      name: 'Final Clean Data', 
      displayName: 'Final Processed Data',
      category: 'clean',
      order: 3
    },
    'crrels2s_cleaned_data_seasons': {
      id: 'season_data',
      name: 'Season Data',
      displayName: 'Seasonal Analysis Data',
      category: 'seasonal',
      order: 4
    }
  };

  static async getDatabasesInfo(): Promise<DatabasesResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/databases`);
      if (!response.ok) throw new Error('Failed to fetch databases info');
      const data = await response.json();
      
      // Filter and map only the databases we want to expose
      const databases: DatabaseInfo[] = (data.databases || [])
        .filter((d: any) => this.DATABASE_MAPPING[d.key as keyof typeof this.DATABASE_MAPPING])
        .map((d: any) => {
          const mapping = this.DATABASE_MAPPING[d.key as keyof typeof this.DATABASE_MAPPING];
          return {
            id: mapping.id,
            name: mapping.displayName,
            database_name: d.name,
            originalKey: d.key,
            category: mapping.category,
            order: mapping.order
          };
        })
        .sort((a: any, b: any) => a.order - b.order);
      
      const seasons: SeasonInfo[] = data.seasons || [];
      const tables: string[] = data.tables || [];
      return { databases, seasons, tables };
    } catch (error) {
      console.error('Error fetching databases info:', error);
      return { databases: [], seasons: [], tables: [] };
    }
  }

  static getOriginalDatabaseKey(mappedId: string): string {
    const mapping = Object.values(this.DATABASE_MAPPING).find(m => m.id === mappedId);
    return mapping ? Object.keys(this.DATABASE_MAPPING).find(key => 
      this.DATABASE_MAPPING[key as keyof typeof this.DATABASE_MAPPING] === mapping
    ) || mappedId : mappedId;
  }

  static async getLocations(database: string = 'raw_data'): Promise<LocationData[]> {
    try {
      const originalKey = this.getOriginalDatabaseKey(database);
      const response = await fetch(`${this.baseUrl}/api/databases/${originalKey}/locations`);
      if (!response.ok) throw new Error('Failed to fetch locations');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching locations:', error);
      return [];
    }
  }

  static async getTables(database: string = 'raw_data'): Promise<any[]> {
    try {
      const originalKey = this.getOriginalDatabaseKey(database);
      const response = await fetch(`${this.baseUrl}/api/databases/${originalKey}/tables`);
      if (!response.ok) throw new Error('Failed to fetch tables');
      const data = await response.json();
      return data.tables || [];
    } catch (error) {
      console.error('Error fetching tables:', error);
      return [];
    }
  }

  static async getTableData(
    table: string,
    database: string = 'raw_data',
    location?: string,
    startDate?: string,
    endDate?: string,
    season?: string,
    limit: number = 1000
  ): Promise<EnvironmentalData[]> {
    try {
      const params = new URLSearchParams();
      if (location) params.append('location', location);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (season) params.append('season', season);
      params.append('limit', limit.toString());

      const originalKey = this.getOriginalDatabaseKey(database);
      const response = await fetch(`${this.baseUrl}/api/databases/${originalKey}/data/${table}?${params}`);
      if (!response.ok) throw new Error(`Failed to fetch ${table} data`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching ${table} data:`, error);
      return [];
    }
  }

  static async getTableMetadata(table: string, database: string = 'raw_data'): Promise<TableMetadata | null> {
    try {
      const originalKey = this.getOriginalDatabaseKey(database);
      const response = await fetch(`${this.baseUrl}/api/databases/${originalKey}/tables/${table}/attributes`);
      if (!response.ok) throw new Error(`Failed to fetch ${table} metadata`);
      const data = await response.json();
      const columns = (data.attributes || []).map((col: any) => ({
        name: col.name,
        type: col.type,
        nullable: col.nullable,
        default: col.default,
        comment: col.comment,
      }));
      return { table_name: table, columns };
    } catch (error) {
      console.error(`Error fetching ${table} metadata:`, error);
      return null;
    }
  }

  static async getAnalyticsSummary(
    database: string = 'raw_data',
    location?: string,
    startDate?: string,
    endDate?: string,
    season?: string
  ): Promise<AnalyticsData> {
    try {
      const params = new URLSearchParams();
      if (location) params.append('location', location);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (season) params.append('season', season);

      const originalKey = this.getOriginalDatabaseKey(database);
      const response = await fetch(`${this.baseUrl}/api/databases/${originalKey}/analytics?${params}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return {
        temperature: { average: null, min: null, max: null, count: 0 },
        humidity: { average: null },
        wind: { average_speed: null, max_speed: null, average_direction: null, count: 0 },
        precipitation: { total: 0, average_intensity: null, count: 0 },
        snow: { average_swe: null, average_density: null, count: 0 },
        period: { start: '', end: '' }
      };
    }
  }

  static async downloadTableData(
    table: string,
    database: string = 'raw_data',
    location?: string,
    startDate?: string,
    endDate?: string,
    season?: string,
    columns?: string[]
  ): Promise<void> {
    try {
      const params = new URLSearchParams();
      if (location) params.append('location', location);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (season) params.append('season', season);
      if (columns && columns.length > 0) params.append('attributes', columns.join(','));

      const originalKey = this.getOriginalDatabaseKey(database);
      const response = await fetch(`${this.baseUrl}/api/databases/${originalKey}/download/${table}?${params}`);
      if (!response.ok) throw new Error(`Failed to download ${table} data`);
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${database}_${table}_${new Date().getTime()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Error downloading ${table} data:`, error);
      throw error;
    }
  }

  // Health check to verify server connection
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // Get available tables
  static getAvailableTables(): string[] {
    return Object.values(this.TABLES);
  }
}