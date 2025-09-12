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
  monthFilter?: string; // e.g., '01', '02', etc. for specific months
  seasonPeriod?: 'fall' | 'winter' | 'spring' | 'summer'; // seasonal periods
}

export class SeasonalAnalyticsService {
  private static readonly DATABASE = 'seasonal_clean';

  static async getLocations(): Promise<Location[]> {
    try {
      // First get available seasons/tables
      const seasons = await this.getSeasons();
      const uniqueLocations = new Set<string>();
      
      // Fetch data from all available tables to get unique locations
      for (const season of seasons) {
        try {
          const params = new URLSearchParams({
            database: this.DATABASE,
            table: season.id,
            limit: '1000' // Get enough data to find all locations
          });

          const response = await fetch(`${API_BASE_URL}/api/data?${params}`);
          if (response.ok) {
            const data = await response.json();
            
            // Extract unique locations from the Location column
            if (data.data && Array.isArray(data.data)) {
              data.data.forEach((row: any) => {
                if (row.Location || row.location) {
                  const locationValue = row.Location || row.location;
                  if (locationValue && typeof locationValue === 'string') {
                    uniqueLocations.add(locationValue.trim());
                  }
                }
              });
            }
          }
        } catch (seasonError) {
          console.warn(`Error fetching data from season ${season.id}:`, seasonError);
        }
      }

      // Convert unique locations to Location objects
      const locations: Location[] = Array.from(uniqueLocations)
        .filter(loc => loc && loc.length > 0)
        .map(locationName => ({
          id: locationName,
          name: locationName
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      return locations;
    } catch (error) {
      console.error('Error fetching locations:', error);
      // Return empty array if API fails so locations can be fetched when seasons are available
      return [];
    }
  }

  static async getSeasons(): Promise<Season[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/databases`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Extract seasons from the available tables/databases
      const seasons: Season[] = [];
      if (data.databases) {
        // Look for seasonal tables in seasonal_clean database
        const seasonalData = data.databases.find((db: any) => db.name === this.DATABASE);
        if (seasonalData?.tables) {
          seasonalData.tables.forEach((table: string) => {
            // Extract season info from table names like "cleaned_data_season_2022_2023"
            const seasonMatch = table.match(/cleaned_data_season_(\d{4})_(\d{4})/);
            if (seasonMatch) {
              const startYear = seasonMatch[1];
              const endYear = seasonMatch[2];
              seasons.push({
                id: table,
                name: `${startYear}-${endYear}`,
                start_date: `${startYear}-09-01`, // Assume seasons start Sept 1
                end_date: `${endYear}-08-31`      // and end Aug 31 next year
              });
            }
          });
        }
      }
      
      return seasons.length > 0 ? seasons : [
        {
          id: 'cleaned_data_season_2022_2023',
          name: '2022-2023',
          start_date: '2022-09-01',
          end_date: '2023-08-31'
        },
        {
          id: 'cleaned_data_season_2023_2024',
          name: '2023-2024',
          start_date: '2023-09-01',
          end_date: '2024-08-31'
        }
      ];
    } catch (error) {
      console.error('Error fetching seasons:', error);
      // Return default seasons if API fails
      return [
        {
          id: 'cleaned_data_season_2022_2023',
          name: '2022-2023',
          start_date: '2022-09-01',
          end_date: '2023-08-31'
        },
        {
          id: 'cleaned_data_season_2023_2024',
          name: '2023-2024',
          start_date: '2023-09-01',
          end_date: '2024-08-31'
        }
      ];
    }
  }

  static async getEnvironmentalData(filters: TimeSeriesFilter = {}): Promise<EnvironmentalData[]> {
    try {
      const params = new URLSearchParams({
        database: this.DATABASE,
        ...(filters.seasonId && { table: filters.seasonId }),
        ...(filters.locationIds?.length && { locations: filters.locationIds.join(',') }),
        ...(filters.startDate && { start_date: filters.startDate }),
        ...(filters.endDate && { end_date: filters.endDate }),
        limit: '10000' // Get more data for time series
      });

      const response = await fetch(`${API_BASE_URL}/api/data?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      let environmentalData = data.data || [];

      // Apply location filter - check both 'Location' and 'location' columns
      if (filters.locationIds?.length) {
        environmentalData = environmentalData.filter((item: any) => {
          const locationValue = item.Location || item.location || item.location_name;
          return locationValue && filters.locationIds!.includes(locationValue);
        });
      }

      // Apply month filter if specified
      if (filters.monthFilter) {
        environmentalData = environmentalData.filter((item: any) => {
          const date = new Date(item.TIMESTAMP || item.datetime);
          const month = String(date.getMonth() + 1).padStart(2, '0');
          return month === filters.monthFilter;
        });
      }

      // Apply seasonal period filter
      if (filters.seasonPeriod) {
        environmentalData = environmentalData.filter((item: any) => {
          const date = new Date(item.TIMESTAMP || item.datetime);
          const month = date.getMonth() + 1; // 1-12
          
          switch (filters.seasonPeriod) {
            case 'winter': return month === 12 || month <= 2;
            case 'spring': return month >= 3 && month <= 5;
            case 'summer': return month >= 6 && month <= 8;
            case 'fall': return month >= 9 && month <= 11;
            default: return true;
          }
        });
      }

      // Map the data to the expected format based on actual schema
      return environmentalData.map((item: any) => ({
        datetime: item.TIMESTAMP || item.datetime,
        location_name: item.Location || item.location || item.location_name,
        temperature: item.Bal_soil_Min || item.Bal_Temperature_C || item.temperature,
        precipitation: item.Precip || item.precipitation,  
        wind_speed: item.AIRTC_Avg || item.wind_speed,
        snow_depth: item.SW_ul || item.Snow_Depth_SRDD || item.snow_depth,
        humidity: item.RH || item.humidity,
        pressure: item.Pressure || item.pressure
      }));
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

    // Group data by location
    const locationGroups = data.reduce((acc, item) => {
      const key = item.location_name;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {} as Record<string, EnvironmentalData[]>);

    // Calculate metrics for each location
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
    
    // Group by month
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
    
    // Group by seasonal periods
    const seasonalData = data.reduce((acc, item) => {
      const date = new Date(item.datetime);
      const month = date.getMonth() + 1; // 1-12
      
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