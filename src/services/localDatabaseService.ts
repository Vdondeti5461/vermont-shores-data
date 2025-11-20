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

  // Canonical 22 Vermont site locations (used as fallback and for canonical mode)
  private static readonly LOCATION_METADATA: Record<string, { name: string; latitude: number; longitude: number; elevation: number } > = {
    RB01: { name: 'Mansfield East Ranch Brook 1', latitude: 44.2619, longitude: -72.8081, elevation: 1200 },
    RB02: { name: 'Mansfield East Ranch Brook 2', latitude: 44.2625, longitude: -72.8075, elevation: 1180 },
    RB03: { name: 'Mansfield East Ranch Brook 3', latitude: 44.2631, longitude: -72.8069, elevation: 1160 },
    RB04: { name: 'Mansfield East Ranch Brook 4', latitude: 44.2637, longitude: -72.8063, elevation: 1140 },
    RB05: { name: 'Mansfield East Ranch Brook 5', latitude: 44.2643, longitude: -72.8057, elevation: 1120 },
    RB06: { name: 'Mansfield East Ranch Brook 6', latitude: 44.2649, longitude: -72.8051, elevation: 1100 },
    RB07: { name: 'Mansfield East Ranch Brook 7', latitude: 44.2655, longitude: -72.8045, elevation: 1080 },
    RB08: { name: 'Mansfield East Ranch Brook 8', latitude: 44.2661, longitude: -72.8039, elevation: 1060 },
    RB09: { name: 'Mansfield East Ranch Brook 9', latitude: 44.2667, longitude: -72.8033, elevation: 1040 },
    RB10: { name: 'Mansfield East Ranch Brook 10', latitude: 44.2673, longitude: -72.8027, elevation: 1020 },
    RB11: { name: 'Mansfield East Ranch Brook 11', latitude: 44.2679, longitude: -72.8021, elevation: 1000 },
    RB12: { name: 'Mansfield East FEMC', latitude: 44.2685, longitude: -72.8015, elevation: 980 },
    SPER: { name: 'Spear Street', latitude: 44.4759, longitude: -73.1959, elevation: 120 },
    SR01: { name: 'Sleepers R3/Main', latitude: 44.2891, longitude: -72.8211, elevation: 900 },
    SR11: { name: 'Sleepers W1/R11', latitude: 44.2885, longitude: -72.8205, elevation: 920 },
    SR25: { name: 'Sleepers R25', latitude: 44.2879, longitude: -72.8199, elevation: 940 },
    JRCL: { name: 'Jericho clearing', latitude: 44.4919, longitude: -72.9659, elevation: 300 },
    JRFO: { name: 'Jericho Forest', latitude: 44.4925, longitude: -72.9665, elevation: 320 },
    PROC: { name: 'Mansfield West Proctor', latitude: 44.2561, longitude: -72.8141, elevation: 1300 },
    PTSH: { name: 'Potash Brook', latitude: 44.2567, longitude: -72.8147, elevation: 1280 },
    SUMM: { name: 'Mansfield SUMMIT', latitude: 44.2573, longitude: -72.8153, elevation: 1339 },
    UNDR: { name: 'Mansfield West SCAN', latitude: 44.2555, longitude: -72.8135, elevation: 1260 }
  };

  private static buildCanonicalLocations(): LocationData[] {
    const codes = Object.keys(this.LOCATION_METADATA);
    return codes.map((code, idx) => {
      const meta = this.LOCATION_METADATA[code as keyof typeof this.LOCATION_METADATA];
      return { id: idx + 1, name: code, latitude: meta.latitude, longitude: meta.longitude, elevation: meta.elevation };
    });
  }
  static readonly TABLES = {
    TABLE1: 'table1',
    WIND: 'Wind',
    SNOW_TEMP_PROFILE: 'SnowpkTempProfile',
    PRECIPITATION: 'Precipitation'
  } as const;

  // Database mapping - updated schema names
  static readonly DATABASE_MAPPING = {
    raw_data: {
      id: 'raw_data',
      name: 'CRRELS2S_raw_data_ingestion',
      displayName: 'Raw Environmental Data',
      category: 'raw',
      order: 1,
      downloadable: false
    },
    stage_clean_data: {
      id: 'stage_clean_data',
      name: 'CRRELS2S_stage_clean_data',
      displayName: 'Stage Clean Data',
      category: 'cleaned',
      order: 2,
      downloadable: false
    },
    stage_qaqc_data: {
      id: 'stage_qaqc_data',
      name: 'CRRELS2S_stage_qaqc_data',
      displayName: 'Stage QAQC Data',
      category: 'qaqc',
      order: 3,
      downloadable: false
    },
    seasonal_qaqc_data: {
      id: 'seasonal_qaqc_data',
      name: 'CRRELS2S_seasonal_qaqc_data',
      displayName: 'Seasonal QAQC Data',
      category: 'seasonal',
      order: 4,
      downloadable: true
    }
  } as const;

  static async getDatabasesInfo(): Promise<DatabasesResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/databases`);
      if (!response.ok) throw new Error('Failed to fetch databases info');
      const data = await response.json();

      // Map to our UI shape while preserving known order
      const databases: DatabaseInfo[] = (data.databases || [])
        .map((d: any) => {
          const mapping = this.DATABASE_MAPPING[d.key as keyof typeof this.DATABASE_MAPPING] || null;
          if (!mapping) return null;
          return {
            id: mapping.id,
            name: mapping.displayName,
            database_name: d.name,
            originalKey: d.key,
            category: mapping.category,
            order: mapping.order
          };
        })
        .filter(Boolean)
        .sort((a: any, b: any) => a.order - b.order);

      return { databases, seasons: data.seasons || [], tables: data.tables || [] };
    } catch (error) {
      console.error('Error fetching databases info:', error);
      return { databases: [], seasons: [], tables: [] };
    }
  }

  static getOriginalDatabaseKey(mappedId: string): string {
    const mapping = this.DATABASE_MAPPING[mappedId as keyof typeof this.DATABASE_MAPPING];
    return mapping ? mappedId : 'raw_data';
  }

  static async getLocations(database: string = 'raw_data'): Promise<LocationData[]> {
    try {
      const originalKey = this.getOriginalDatabaseKey(database);
      const url = new URL(`${this.baseUrl}/api/databases/${originalKey}/locations`);
      // Prefer canonical list for raw_data to guarantee 22 sites
      if (originalKey === 'raw_data') url.searchParams.set('canonical', '1');
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Failed to fetch locations');
      const data = await response.json();
      const arr = Array.isArray(data) ? data : [];
      // Fallback if backend does not support canonical param
      if (originalKey === 'raw_data' && arr.length < 22) {
        return this.buildCanonicalLocations();
      }
      return arr as LocationData[];
    } catch (error) {
      console.error('Error fetching locations:', error);
      // Last-resort fallback for raw_data
      if (database === 'raw_data') return this.buildCanonicalLocations();
      return [];
    }
  }

  static async getTables(database: string = 'raw_data'): Promise<any[]> {
    try {
      const originalKey = this.getOriginalDatabaseKey(database);
      const response = await fetch(`${this.baseUrl}/api/databases/${originalKey}/tables`);
      if (!response.ok) throw new Error('Failed to fetch tables');
      const data = await response.json();
      return data.tables || data || [];
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
      const originalKey = this.getOriginalDatabaseKey(database);
      const params = new URLSearchParams();
      if (location) params.append('location', location);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (season) params.append('season', season);
      params.append('limit', limit.toString());

      const response = await fetch(`${this.baseUrl}/api/databases/${originalKey}/data/${table}?${params}`);
      if (!response.ok) throw new Error(`Failed to fetch ${table} data`);
      const data = await response.json();
      // Some endpoints may return { data: [] }
      return Array.isArray(data) ? data : data.data || [];
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

  // Get snow depth time series data for charts
  static async getSnowDepthTimeSeries(
    database: string,
    location?: string,
    startDate?: string,
    endDate?: string,
    season?: string,
    year?: string,
    dataType: 'raw' | 'cleaned' | 'both' = 'both'
  ): Promise<{ timestamp: string; location: string; raw_depth?: number; cleaned_depth?: number; dbtcdt?: number }[]> {
    try {
      // Map to server database keys
      const dbKey = database === 'raw' ? 'raw_data' : 'final_clean_data';

      // If year is provided without explicit dates, derive full-year range
      const start = startDate || (year ? `${year}-01-01` : undefined);
      const end = endDate || (year ? `${year}-12-31` : undefined);

      const params = new URLSearchParams();
      if (location) params.set('location', location);
      if (start) params.set('start_date', start);
      if (end) params.set('end_date', end);
      if (season && season !== 'all') params.set('season', season);
      // Request only the necessary attributes when supported
      params.set('attributes', 'TIMESTAMP,Location,DBTCDT');
      // Reasonable upper bound for a year of hourly-ish data
      params.set('limit', '20000');

      const url = `${this.baseUrl}/api/databases/${dbKey}/data/table1?${params.toString()}`;
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = await response.json();
      const rows: any[] = Array.isArray(json) ? json : (json.data || []);

      const result = rows.map((row) => {
        const timestamp = row.TIMESTAMP || row.timestamp || row.Timestamp || '';
        const locationName = row.Location || row.LOCATION || row.location || '';
        const value = Number(row.DBTCDT ?? row.dbtcdt ?? row.DBTCDT_Med ?? row.dbtcdt_med ?? 0);
        return {
          timestamp,
          location: locationName,
          dbtcdt: value,
          raw_depth: database === 'raw' ? value : undefined,
          cleaned_depth: database !== 'raw' ? value : undefined,
        };
      });

      return result;
    } catch (error) {
      console.error('Failed to fetch snow depth time series:', error);
      // Return mock data for development with proper database context
      return this.generateMockSnowDepthData(location, startDate, endDate, database, season, year);
    }
  }

  // Generate mock snow depth data for development with database context
  private static generateMockSnowDepthData(
    location?: string, 
    startDate?: string, 
    endDate?: string, 
    database?: string,
    season?: string,
    year?: string
  ) {
    const data = [];
    
    // Set date range based on year or default range
    const start = year ? new Date(`${year}-01-01`) : 
                 startDate ? new Date(startDate) : 
                 new Date('2022-01-01');
    const end = year ? new Date(`${year}-12-31`) : 
               endDate ? new Date(endDate) : 
               new Date('2023-12-31');
    
    // Season mapping
    const seasonMonths = {
      'winter': [12, 1, 2],
      'spring': [3, 4, 5], 
      'summer': [6, 7, 8],
      'fall': [9, 10, 11]
    };
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const month = d.getMonth() + 1;
      
      // Skip if season filter doesn't match
      if (season && seasonMonths[season as keyof typeof seasonMonths]) {
        if (!seasonMonths[season as keyof typeof seasonMonths].includes(month)) {
          continue;
        }
      }
      
      // Generate snow depth based on season and location
      let baseDepth = 0;
      if (month >= 12 || month <= 3) { // Winter months
        baseDepth = Math.sin(d.getTime() / (1000 * 60 * 60 * 24 * 7)) * 80 + 120;
      } else if (month >= 4 && month <= 5) { // Spring melt
        baseDepth = Math.max(0, Math.sin(d.getTime() / (1000 * 60 * 60 * 24 * 3)) * 60 + 40);
      } else { // Summer/Fall - minimal snow
        baseDepth = Math.random() * 10;
      }
      
      // Add location variation
      const locationMultiplier = location === 'Station_1' ? 1.2 : 
                                location === 'Station_2' ? 0.8 : 1.0;
      baseDepth *= locationMultiplier;
      
      // Add noise - more for raw data, less for cleaned
      const rawNoise = (Math.random() - 0.5) * 30;
      const cleanedNoise = (Math.random() - 0.5) * 10;
      
      const isRaw = database === 'raw';
      const raw_depth = Math.max(0, baseDepth + rawNoise);
      const cleaned_depth = Math.max(0, baseDepth + cleanedNoise);
      
      data.push({
        timestamp: d.toISOString().split('T')[0],
        location: location || 'Station_1',
        raw_depth: isRaw ? raw_depth : undefined,
        cleaned_depth: !isRaw ? cleaned_depth : undefined,
        dbtcdt: isRaw ? raw_depth : cleaned_depth
      });
    }
    
    return data;
  }

  static async getAnalyticsSummary(
    database: string = 'raw_data',
    location?: string,
    startDate?: string,
    endDate?: string,
    season?: string
  ): Promise<AnalyticsData> {
    try {
      const originalKey = this.getOriginalDatabaseKey(database);
      const params = new URLSearchParams();
      if (location) params.append('location', location);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (season) params.append('season', season);

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
      const originalKey = this.getOriginalDatabaseKey(database);
      const params = new URLSearchParams();
      if (location) params.append('location', location);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (season) params.append('season', season);
      if (columns && columns.length > 0) params.append('attributes', columns.join(','));

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
      const response = await fetch(`${this.baseUrl}/api/health`);
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
