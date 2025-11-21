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
  start_date: string;
  end_date: string;
}

export interface EnvironmentalData {
  datetime: string;
  location_name: string;
  temperature?: number;
  precipitation?: number;
  wind_speed?: number;
  snow_depth?: number;
  humidity?: number;
  pressure?: number;
}

export interface SeasonalMetrics {
  location: string;
  season: string;
  avgTemperature: number;
  avgPrecipitation: number;
  avgWindSpeed: number;
  avgSnowDepth: number;
  dataPoints: number;
  startDate: string;
  endDate: string;
}

export interface TimeSeriesFilter {
  locationIds?: string[];
  seasonId?: string;
  startDate?: string;
  endDate?: string;
  monthFilter?: string;
  seasonPeriod?: 'fall' | 'winter' | 'spring' | 'summer';
}

export class SeasonalAnalyticsService {
  private static readonly API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  static async getLocations(): Promise<Location[]> {
    try {
      const seasons = await this.getSeasons();
      if (!seasons || seasons.length === 0) {
        return [];
      }

      const firstSeasonTable = seasons[0].id;
      const response = await fetch(`${this.API_BASE}/seasonal/tables/${firstSeasonTable}/locations`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch locations');
      }

      const locationsData = await response.json();
      
      const locations: Location[] = locationsData.map((loc: any) => ({
        id: loc.code,
        name: loc.name || loc.code,
        latitude: loc.latitude,
        longitude: loc.longitude,
        elevation: loc.elevation
      }));

      return locations;
    } catch (error) {
      console.error('Error fetching locations:', error);
      return [];
    }
  }

  static async getSeasons(): Promise<Season[]> {
    try {
      const response = await fetch(`${this.API_BASE}/seasonal/tables`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const tablesData = await response.json();
      
      const seasons: Season[] = tablesData.map((table: any) => {
        const seasonMatch = table.name.match(/season_(\d{4})_(\d{4})_qaqc/);
        const startYear = seasonMatch ? seasonMatch[1] : '2023';
        const endYear = seasonMatch ? seasonMatch[2] : '2024';
        
        return {
          id: table.name,
          name: `${startYear}-${endYear}`,
          start_date: `${startYear}-09-01`,
          end_date: `${endYear}-08-31`
        };
      });
      
      return seasons.length > 0 ? seasons : [
        {
          id: 'season_2023_2024_qaqc',
          name: '2023-2024',
          start_date: '2023-09-01',
          end_date: '2024-08-31'
        }
      ];
    } catch (error) {
      console.error('Error fetching seasons:', error);
      return [
        {
          id: 'season_2023_2024_qaqc',
          name: '2023-2024',
          start_date: '2023-09-01',
          end_date: '2024-08-31'
        }
      ];
    }
  }

  static async getEnvironmentalData(filters: TimeSeriesFilter = {}): Promise<EnvironmentalData[]> {
    try {
      if (!filters.seasonId) {
        const seasons = await this.getSeasons();
        if (seasons.length > 0) {
          filters.seasonId = seasons[0].id;
        }
      }

      const params = new URLSearchParams();
      if (filters.locationIds?.length) {
        params.append('locations', filters.locationIds.join(','));
      }
      if (filters.startDate) {
        params.append('start_date', filters.startDate);
      }
      if (filters.endDate) {
        params.append('end_date', filters.endDate);
      }

      const response = await fetch(
        `${this.API_BASE}/seasonal/download/${filters.seasonId}?${params}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const csvText = await response.text();
      const lines = csvText.trim().split('\n');
      
      if (lines.length < 2) {
        return [];
      }

      const headers = lines[0].split(',').map(h => h.trim());
      const data: EnvironmentalData[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const row: any = {};
        
        headers.forEach((header, index) => {
          row[header] = values[index]?.trim();
        });

        // Apply month filter
        if (filters.monthFilter) {
          const date = new Date(row.TIMESTAMP || row.timestamp);
          const month = String(date.getMonth() + 1).padStart(2, '0');
          if (month !== filters.monthFilter) continue;
        }

        // Apply seasonal period filter
        if (filters.seasonPeriod) {
          const date = new Date(row.TIMESTAMP || row.timestamp);
          const month = date.getMonth() + 1;
          
          let matches = false;
          switch (filters.seasonPeriod) {
            case 'winter': matches = month === 12 || month <= 2; break;
            case 'spring': matches = month >= 3 && month <= 5; break;
            case 'summer': matches = month >= 6 && month <= 8; break;
            case 'fall': matches = month >= 9 && month <= 11; break;
          }
          
          if (!matches) continue;
        }

        data.push({
          datetime: row.TIMESTAMP || row.timestamp,
          location_name: row.Location || row.location,
          temperature: parseFloat(row.air_temperature_avg_c) || undefined,
          precipitation: parseFloat(row.precip_total_nrt_mm) || undefined,
          wind_speed: parseFloat(row.wind_speed_avg_ms) || undefined,
          snow_depth: parseFloat(row.snow_depth_cm) || undefined,
          humidity: parseFloat(row.relative_humidity_percent) || undefined,
          pressure: undefined
        });
      }

      return data;
    } catch (error) {
      console.error('Error fetching environmental data:', error);
      return [];
    }
  }

  static async getSeasonalMetrics(filters: TimeSeriesFilter = {}): Promise<SeasonalMetrics[]> {
    const data = await this.getEnvironmentalData(filters);
    
    if (data.length === 0) {
      return [];
    }

    const locationGroups = data.reduce((acc, item) => {
      const key = item.location_name;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {} as Record<string, EnvironmentalData[]>);

    const metrics: SeasonalMetrics[] = [];
    
    Object.entries(locationGroups).forEach(([location, locationData]) => {
      const validTemps = locationData.filter(d => d.temperature != null).map(d => d.temperature!);
      const validPrecip = locationData.filter(d => d.precipitation != null).map(d => d.precipitation!);
      const validWind = locationData.filter(d => d.wind_speed != null).map(d => d.wind_speed!);
      const validSnow = locationData.filter(d => d.snow_depth != null).map(d => d.snow_depth!);

      const dates = locationData.map(d => d.datetime).sort();
      
      metrics.push({
        location,
        season: filters.seasonId || 'all',
        avgTemperature: validTemps.length > 0 ? validTemps.reduce((a, b) => a + b, 0) / validTemps.length : 0,
        avgPrecipitation: validPrecip.length > 0 ? validPrecip.reduce((a, b) => a + b, 0) / validPrecip.length : 0,
        avgWindSpeed: validWind.length > 0 ? validWind.reduce((a, b) => a + b, 0) / validWind.length : 0,
        avgSnowDepth: validSnow.length > 0 ? validSnow.reduce((a, b) => a + b, 0) / validSnow.length : 0,
        dataPoints: locationData.length,
        startDate: dates[0] || '',
        endDate: dates[dates.length - 1] || ''
      });
    });

    return metrics;
  }

  static async getMonthlyTrends(filters: TimeSeriesFilter = {}): Promise<Record<string, EnvironmentalData[]>> {
    const data = await this.getEnvironmentalData(filters);
    
    const monthlyData = data.reduce((acc, item) => {
      const date = new Date(item.datetime);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = [];
      }
      acc[monthKey].push(item);
      return acc;
    }, {} as Record<string, EnvironmentalData[]>);

    return monthlyData;
  }

  static async getSeasonalTrends(filters: TimeSeriesFilter = {}): Promise<Record<string, EnvironmentalData[]>> {
    const data = await this.getEnvironmentalData(filters);
    
    const seasonalData = data.reduce((acc, item) => {
      const date = new Date(item.datetime);
      const month = date.getMonth() + 1;
      
      let season: string;
      if (month === 12 || month <= 2) season = 'winter';
      else if (month >= 3 && month <= 5) season = 'spring';
      else if (month >= 6 && month <= 8) season = 'summer';
      else season = 'fall';

      if (!acc[season]) {
        acc[season] = [];
      }
      acc[season].push(item);
      return acc;
    }, {} as Record<string, EnvironmentalData[]>);

    return seasonalData;
  }
}
