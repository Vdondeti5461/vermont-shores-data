// Analytics Data Service - Mock implementation that can be easily replaced with real API calls
export interface SnowDepthData {
  id: string;
  location_id: string;
  timestamp: string;
  snow_depth_raw: number;
  snow_depth_clean: number;
  temperature: number;
  precipitation: number;
  humidity: number;
  wind_speed: number;
  season: string;
  elevation: number;
}

export interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  elevation: number;
  region: string;
}

export interface Season {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: 'current' | 'completed' | 'future';
}

// Mock data - replace with real API calls later
const mockLocations: Location[] = [
  { id: 'mansfield', name: 'Mount Mansfield Summit', latitude: 44.5438, longitude: -72.8142, elevation: 1340, region: 'northern' },
  { id: 'killington', name: 'Killington Peak', latitude: 43.6042, longitude: -72.8092, elevation: 1293, region: 'central' },
  { id: 'champlain', name: 'Lake Champlain Shore', latitude: 44.4759, longitude: -73.2121, elevation: 95, region: 'western' },
  { id: 'green_north', name: 'Green Mountains North', latitude: 44.7297, longitude: -72.6851, elevation: 850, region: 'northern' },
  { id: 'green_south', name: 'Green Mountains South', latitude: 43.1654, longitude: -72.8108, elevation: 720, region: 'southern' },
  { id: 'connecticut', name: 'Connecticut River Valley', latitude: 44.0012, longitude: -72.2895, elevation: 120, region: 'eastern' },
  { id: 'winooski', name: 'Winooski River Basin', latitude: 44.2601, longitude: -72.5806, elevation: 200, region: 'central' },
  { id: 'white_river', name: 'White River Junction', latitude: 43.6486, longitude: -72.3198, elevation: 180, region: 'eastern' },
  { id: 'otter_creek', name: 'Otter Creek Valley', latitude: 44.1645, longitude: -73.1806, elevation: 150, region: 'western' },
  { id: 'stowe', name: 'Stowe Valley', latitude: 44.4654, longitude: -72.6874, elevation: 520, region: 'northern' }
];

const mockSeasons: Season[] = [
  { id: '2024-2025', name: '2024-2025 Season', start_date: '2024-11-01', end_date: '2025-07-31', status: 'current' },
  { id: '2023-2024', name: '2023-2024 Season', start_date: '2023-11-01', end_date: '2024-07-31', status: 'completed' },
  { id: '2022-2023', name: '2022-2023 Season', start_date: '2022-11-01', end_date: '2023-07-31', status: 'completed' }
];

// Generate realistic snow depth data
const generateMockData = (locationId: string, season: Season): SnowDepthData[] => {
  const data: SnowDepthData[] = [];
  const startDate = new Date(season.start_date);
  const endDate = new Date(season.end_date);
  const location = mockLocations.find(l => l.id === locationId)!;
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const month = d.getMonth();
    const dayOfYear = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    
    // Seasonal patterns
    let baseDepth = 0;
    if (month >= 11 || month <= 2) { // Winter: Nov, Dec, Jan, Feb
      const winterProgress = month >= 11 ? (month - 11) / 4 : (month + 1) / 4;
      baseDepth = 20 + winterProgress * 60 + Math.sin(dayOfYear * 0.1) * 15;
    } else if (month >= 3 && month <= 6) { // Spring: Mar, Apr, May, Jun, Jul
      const springProgress = (month - 3) / 4;
      baseDepth = Math.max(0, 80 * (1 - springProgress) + Math.sin(dayOfYear * 0.05) * 10);
    }
    
    // Elevation factor
    const elevationFactor = Math.max(0.2, location.elevation / 1000);
    baseDepth *= elevationFactor;
    
    // Add realistic variations
    const cleanDepth = Math.max(0, baseDepth + (Math.random() - 0.5) * 5);
    const rawDepth = cleanDepth + (Math.random() - 0.5) * 15; // Raw data has more noise
    
    // Weather data
    const temperature = -10 + Math.random() * 20 + (month >= 3 && month <= 6 ? (month - 3) * 5 : 0);
    const precipitation = Math.random() * 25;
    const humidity = 40 + Math.random() * 40;
    const windSpeed = Math.random() * 30;
    
    data.push({
      id: `${locationId}_${season.id}_${d.toISOString().split('T')[0]}`,
      location_id: locationId,
      timestamp: d.toISOString(),
      snow_depth_raw: Math.round(rawDepth * 10) / 10,
      snow_depth_clean: Math.round(cleanDepth * 10) / 10,
      temperature: Math.round(temperature * 10) / 10,
      precipitation: Math.round(precipitation * 10) / 10,
      humidity: Math.round(humidity * 10) / 10,
      wind_speed: Math.round(windSpeed * 10) / 10,
      season: season.id,
      elevation: location.elevation
    });
  }
  
  return data;
};

// Service functions that can be easily replaced with real API calls
export class AnalyticsService {
  // Cache for better performance
  private static locationCache: Location[] | null = null;
  private static seasonCache: Season[] | null = null;
  
  static async getLocations(): Promise<Location[]> {
    if (this.locationCache) return this.locationCache;
    this.locationCache = mockLocations;
    return mockLocations;
  }
  
  static async getSeasons(): Promise<Season[]> {
    if (this.seasonCache) return this.seasonCache;
    this.seasonCache = mockSeasons;
    return mockSeasons;
  }
  
  static async getSnowDepthData(
    locationIds: string[] = [],
    seasonId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<SnowDepthData[]> {
    // Simulate minimal API delay for realism
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const targetLocations = locationIds.length > 0 ? locationIds : mockLocations.map(l => l.id);
    const targetSeason = mockSeasons.find(s => s.id === seasonId) || mockSeasons[0];
    
    let allData: SnowDepthData[] = [];
    
    for (const locationId of targetLocations) {
      const locationData = generateMockData(locationId, targetSeason);
      allData = [...allData, ...locationData];
    }
    
    // Filter by date range if provided
    if (startDate || endDate) {
      allData = allData.filter(d => {
        const timestamp = new Date(d.timestamp);
        if (startDate && timestamp < new Date(startDate)) return false;
        if (endDate && timestamp > new Date(endDate)) return false;
        return true;
      });
    }
    
    return allData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }
  
  static async getLocationSummary(locationId: string, seasonId: string) {
    // Minimal delay for realism
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const data = await this.getSnowDepthData([locationId], seasonId);
    const depths = data.map(d => d.snow_depth_clean);
    const temperatures = data.map(d => d.temperature);
    
    return {
      location_id: locationId,
      season_id: seasonId,
      max_depth: Math.max(...depths),
      min_depth: Math.min(...depths),
      avg_depth: depths.reduce((a, b) => a + b, 0) / depths.length,
      current_depth: depths[depths.length - 1] || 0,
      max_temperature: Math.max(...temperatures),
      min_temperature: Math.min(...temperatures),
      avg_temperature: temperatures.reduce((a, b) => a + b, 0) / temperatures.length,
      data_points: data.length,
      peak_date: data.find(d => d.snow_depth_clean === Math.max(...depths))?.timestamp,
      last_updated: new Date().toISOString()
    };
  }
}

// Database schema for when you implement with your real database
export const DATABASE_SCHEMA = `
-- Locations table
CREATE TABLE locations (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  elevation INT NOT NULL,
  region VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seasons table
CREATE TABLE seasons (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('current', 'completed', 'future') DEFAULT 'future',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Snow depth measurements table
CREATE TABLE snow_depth_measurements (
  id VARCHAR(100) PRIMARY KEY,
  location_id VARCHAR(50) NOT NULL,
  timestamp DATETIME NOT NULL,
  snow_depth_raw DECIMAL(5, 2),
  snow_depth_clean DECIMAL(5, 2),
  temperature DECIMAL(4, 2),
  precipitation DECIMAL(5, 2),
  humidity DECIMAL(5, 2),
  wind_speed DECIMAL(5, 2),
  season VARCHAR(50),
  elevation INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (location_id) REFERENCES locations(id),
  INDEX idx_location_timestamp (location_id, timestamp),
  INDEX idx_season (season),
  INDEX idx_timestamp (timestamp)
);
`;