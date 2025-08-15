// Local Database Service for MySQL Integration
export interface LocationData {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  status?: string;
}

export interface EnvironmentalData {
  id: number;
  timestamp: string;
  record: number;
  location: string;
  [key: string]: any; // For dynamic metrics like temperature, wind, etc.
}

export interface MetricData {
  timestamp: string;
  value: number;
  location: string;
}

export interface AnalyticsData {
  current_metrics: {
    temperature?: any;
    wind?: any;
    precipitation?: any;
    snow?: any;
  };
  recent_data: any[];
}

export class LocalDatabaseService {
  private static baseUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3001/api' 
    : '/api'; // Adjust for production

  static async getLocations(): Promise<LocationData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/locations`);
      if (!response.ok) throw new Error('Failed to fetch locations');
      const data = await response.json();
      return data.locations || [];
    } catch (error) {
      console.error('Error fetching locations:', error);
      return [];
    }
  }

  static async getEnvironmentalData(
    table: string,
    locationId?: string,
    startDate?: string,
    endDate?: string,
    limit: number = 1000
  ): Promise<EnvironmentalData[]> {
    try {
      const params = new URLSearchParams();
      if (locationId) params.append('location_id', locationId);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      params.append('limit', limit.toString());

      const response = await fetch(`${this.baseUrl}/data/${table}?${params}`);
      if (!response.ok) throw new Error(`Failed to fetch ${table} data`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error(`Error fetching ${table} data:`, error);
      return [];
    }
  }

  static async getTemperatureData(locationId?: string, startDate?: string, endDate?: string): Promise<MetricData[]> {
    const data = await this.getEnvironmentalData('temperature_data', locationId, startDate, endDate);
    return data.map(item => ({
      timestamp: item.timestamp,
      value: item.temperature || item.PTemp || 0,
      location: item.location
    }));
  }

  static async getWindData(locationId?: string, startDate?: string, endDate?: string): Promise<MetricData[]> {
    const data = await this.getEnvironmentalData('wind_data', locationId, startDate, endDate);
    return data.map(item => ({
      timestamp: item.timestamp,
      value: item.wind_speed || item.WS_ms || 0,
      location: item.location
    }));
  }

  static async getPrecipitationData(locationId?: string, startDate?: string, endDate?: string): Promise<MetricData[]> {
    const data = await this.getEnvironmentalData('precipitation_data', locationId, startDate, endDate);
    return data.map(item => ({
      timestamp: item.timestamp,
      value: item.accumulation_rt || item.Accu_RT_NRT || 0,
      location: item.location
    }));
  }

  static async getSnowData(locationId?: string, startDate?: string, endDate?: string): Promise<MetricData[]> {
    const data = await this.getEnvironmentalData('snow_data', locationId, startDate, endDate);
    return data.map(item => ({
      timestamp: item.timestamp,
      value: item.snow_water_equivalent || item.SWE || 0,
      location: item.location
    }));
  }

  static async getAnalyticsSummary(locationId?: string): Promise<AnalyticsData> {
    try {
      const params = locationId ? `?location_id=${locationId}` : '';
      const response = await fetch(`${this.baseUrl}/analytics${params}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return {
        current_metrics: {},
        recent_data: []
      };
    }
  }

  // Health check to verify server connection
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl.replace('/api', '')}/health`);
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}