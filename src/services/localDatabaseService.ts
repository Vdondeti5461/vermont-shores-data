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
}

export class LocalDatabaseService {
  private static baseUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3001' 
    : '';

  // Available tables in the database
  static readonly TABLES = {
    TABLE1: 'table1',
    WIND: 'Wind',
    SNOW_TEMP_PROFILE: 'SnowpkTempProfile',
    PRECIPITATION: 'Precipitation'
  } as const;

  static async getLocations(): Promise<LocationData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/locations`);
      if (!response.ok) throw new Error('Failed to fetch locations');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching locations:', error);
      return [];
    }
  }

  static async getTableData(
    table: string,
    location?: string,
    startDate?: string,
    endDate?: string,
    limit: number = 1000
  ): Promise<EnvironmentalData[]> {
    try {
      const params = new URLSearchParams();
      if (location) params.append('location', location);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      params.append('limit', limit.toString());

      const response = await fetch(`${this.baseUrl}/api/data/${table}?${params}`);
      if (!response.ok) throw new Error(`Failed to fetch ${table} data`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching ${table} data:`, error);
      return [];
    }
  }

  static async getTableMetadata(table: string): Promise<TableMetadata | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/metadata/${table}`);
      if (!response.ok) throw new Error(`Failed to fetch ${table} metadata`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching ${table} metadata:`, error);
      return null;
    }
  }

  static async getAnalyticsSummary(
    location?: string,
    startDate?: string,
    endDate?: string
  ): Promise<AnalyticsData> {
    try {
      const params = new URLSearchParams();
      if (location) params.append('location', location);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

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
    location?: string,
    startDate?: string,
    endDate?: string,
    columns?: string[]
  ): Promise<void> {
    try {
      const params = new URLSearchParams();
      if (location) params.append('location', location);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (columns && columns.length > 0) params.append('columns', columns.join(','));

      const response = await fetch(`${this.baseUrl}/api/download/${table}?${params}`);
      if (!response.ok) throw new Error(`Failed to download ${table} data`);
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${table}_${new Date().getTime()}.csv`;
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