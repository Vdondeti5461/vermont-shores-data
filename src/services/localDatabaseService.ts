// Local Database Service for MySQL Integration
export interface LocationData {
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
  private static baseUrl = import.meta.env.DEV 
    ? 'http://localhost:3001' 
    : 'https://your-domain.silk.uvm.edu:3001'; // Replace with your actual silk server URL

  // Available tables in the database
  static readonly TABLES = {
    TABLE1: 'table1',
    WIND: 'Wind',
    SNOW_TEMP_PROFILE: 'SnowpkTempProfile',
    PRECIPITATION: 'Precipitation'
  } as const;

  static async getDatabasesInfo(): Promise<DatabasesResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/databases`);
      if (!response.ok) throw new Error('Failed to fetch databases info');
      const data = await response.json();
      const databases: DatabaseInfo[] = (data.databases || []).map((d: any) => ({
        id: d.key,
        name: d.displayName || d.key,
        database_name: d.name,
      }));
      const seasons: SeasonInfo[] = data.seasons || [];
      const tables: string[] = data.tables || [];
      return { databases, seasons, tables };
    } catch (error) {
      console.error('Error fetching databases info:', error);
      return { databases: [], seasons: [], tables: [] };
    }
  }

  static async getLocations(database: string = 'raw_data'): Promise<LocationData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/databases/${database}/locations`);
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
      const response = await fetch(`${this.baseUrl}/api/databases/${database}/tables`);
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

      const response = await fetch(`${this.baseUrl}/api/databases/${database}/data/${table}?${params}`);
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
      const response = await fetch(`${this.baseUrl}/api/databases/${database}/tables/${table}/attributes`);
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

      const response = await fetch(`${this.baseUrl}/api/analytics?${params}`);
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

      const response = await fetch(`${this.baseUrl}/api/databases/${database}/download/${table}?${params}`);
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