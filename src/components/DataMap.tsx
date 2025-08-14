import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Thermometer, Droplets, Wind, Eye, AlertCircle, Camera, Clock, Mountain, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface Location {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  status?: string;
}

interface RecentData {
  hour: string;
  precipitation: number;
  temperature: number;
  wind_speed: number;
  location_name: string;
}

interface StationData {
  id: number;
  name: string;
  shortName: string;
  latitude: number;
  longitude: number;
  elevation: number;
  status: 'active' | 'maintenance' | 'offline';
  currentTemp: number;
  windSpeed: number;
  windGust: number;
  precipitation: number;
  lastUpdate: string;
  type: 'ranch_brook' | 'distributed';
  seasonalData: {
    winter2023: { avgTemp: number; totalPrecip: number; maxWind: number; };
    summer2023: { avgTemp: number; totalPrecip: number; maxWind: number; };
    winter2024: { avgTemp: number; totalPrecip: number; maxWind: number; };
  };
  dataAvailability: number; // percentage of data available
}

const DataMap = () => {
  const { toast } = useToast();
  
  // Fetch locations from MySQL database
  const { data: locationsData, isLoading: locationsLoading, error: locationsError } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const response = await fetch('/functions/v1/get-locations', {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch locations');
      }
      return response.json();
    },
  });

  // Fetch recent analytics data
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const response = await fetch('/functions/v1/get-analytics', {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      return response.json();
    },
  });

  const locations: Location[] = locationsData?.locations || [];
  const recentData: RecentData[] = analyticsData?.recent_data || [];

  // Enhanced station data with seasonal trends (Nov 2022 - Present)
  const stationData: StationData[] = [
    // Ranch Brook Sites (Mount Mansfield) - 3 seasons of data
    { 
      id: 1, name: "Ranch Brook 01", shortName: "RB01", latitude: 44.5267, longitude: -72.8148, elevation: 390, 
      status: 'active', currentTemp: 68, windSpeed: 8, windGust: 12, precipitation: 0.00, lastUpdate: "7:40 PM", 
      type: "ranch_brook", dataAvailability: 94,
      seasonalData: {
        winter2023: { avgTemp: 22, totalPrecip: 45.2, maxWind: 28 },
        summer2023: { avgTemp: 68, totalPrecip: 28.6, maxWind: 22 },
        winter2024: { avgTemp: 18, totalPrecip: 52.1, maxWind: 32 }
      }
    },
    { 
      id: 2, name: "Ranch Brook 05", shortName: "RB05", latitude: 44.5267, longitude: -72.8148, elevation: 650, 
      status: 'active', currentTemp: 62, windSpeed: 12, windGust: 18, precipitation: 0.00, lastUpdate: "7:40 PM", 
      type: "ranch_brook", dataAvailability: 97,
      seasonalData: {
        winter2023: { avgTemp: 18, totalPrecip: 48.8, maxWind: 35 },
        summer2023: { avgTemp: 62, totalPrecip: 31.2, maxWind: 28 },
        winter2024: { avgTemp: 15, totalPrecip: 56.3, maxWind: 38 }
      }
    },
    { 
      id: 3, name: "Ranch Brook 08", shortName: "RB08", latitude: 44.5267, longitude: -72.8148, elevation: 845, 
      status: 'active', currentTemp: 58, windSpeed: 15, windGust: 22, precipitation: 0.00, lastUpdate: "7:40 PM", 
      type: "ranch_brook", dataAvailability: 91,
      seasonalData: {
        winter2023: { avgTemp: 14, totalPrecip: 52.4, maxWind: 42 },
        summer2023: { avgTemp: 58, totalPrecip: 34.1, maxWind: 32 },
        winter2024: { avgTemp: 12, totalPrecip: 58.7, maxWind: 45 }
      }
    },
    { 
      id: 4, name: "Ranch Brook 12", shortName: "RB12", latitude: 44.5267, longitude: -72.8148, elevation: 1170, 
      status: 'active', currentTemp: 52, windSpeed: 18, windGust: 28, precipitation: 0.00, lastUpdate: "7:40 PM", 
      type: "ranch_brook", dataAvailability: 89,
      seasonalData: {
        winter2023: { avgTemp: 8, totalPrecip: 58.9, maxWind: 52 },
        summer2023: { avgTemp: 52, totalPrecip: 38.4, maxWind: 38 },
        winter2024: { avgTemp: 6, totalPrecip: 64.2, maxWind: 55 }
      }
    },
    
    // Distributed Sites
    { 
      id: 5, name: "Potash Brook", shortName: "PB", latitude: 44.4759, longitude: -72.8148, elevation: 45, 
      status: 'active', currentTemp: 75, windSpeed: 5, windGust: 8, precipitation: 0.00, lastUpdate: "7:40 PM", 
      type: "distributed", dataAvailability: 96,
      seasonalData: {
        winter2023: { avgTemp: 28, totalPrecip: 38.6, maxWind: 18 },
        summer2023: { avgTemp: 72, totalPrecip: 24.2, maxWind: 15 },
        winter2024: { avgTemp: 24, totalPrecip: 42.8, maxWind: 22 }
      }
    },
    { 
      id: 6, name: "Underhill", shortName: "UH", latitude: 44.5267, longitude: -72.8698, elevation: 340, 
      status: 'active', currentTemp: 70, windSpeed: 7, windGust: 11, precipitation: 0.00, lastUpdate: "7:40 PM", 
      type: "distributed", dataAvailability: 93,
      seasonalData: {
        winter2023: { avgTemp: 24, totalPrecip: 41.2, maxWind: 25 },
        summer2023: { avgTemp: 69, totalPrecip: 26.8, maxWind: 19 },
        winter2024: { avgTemp: 20, totalPrecip: 46.5, maxWind: 28 }
      }
    },
    { 
      id: 7, name: "Bolton Valley", shortName: "BV", latitude: 44.4089, longitude: -72.8698, elevation: 520, 
      status: 'maintenance', currentTemp: 64, windSpeed: 10, windGust: 15, precipitation: 0.00, lastUpdate: "7:30 PM", 
      type: "distributed", dataAvailability: 87,
      seasonalData: {
        winter2023: { avgTemp: 20, totalPrecip: 44.8, maxWind: 32 },
        summer2023: { avgTemp: 64, totalPrecip: 29.4, maxWind: 24 },
        winter2024: { avgTemp: 16, totalPrecip: 49.2, maxWind: 35 }
      }
    },
    { 
      id: 8, name: "Camel's Hump", shortName: "CH", latitude: 44.3267, longitude: -72.8851, elevation: 1244, 
      status: 'active', currentTemp: 49, windSpeed: 20, windGust: 32, precipitation: 0.00, lastUpdate: "7:40 PM", 
      type: "distributed", dataAvailability: 92,
      seasonalData: {
        winter2023: { avgTemp: 6, totalPrecip: 62.4, maxWind: 58 },
        summer2023: { avgTemp: 49, totalPrecip: 40.6, maxWind: 42 },
        winter2024: { avgTemp: 4, totalPrecip: 68.1, maxWind: 62 }
      }
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success text-success-foreground';
      case 'maintenance': return 'bg-warning text-warning-foreground';
      case 'offline': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStationTypeColor = (type: string) => {
    return type === 'ranch_brook' ? 'border-red-500 bg-red-50' : 'border-blue-500 bg-blue-50';
  };

  return (
    <section id="map" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            <Activity className="h-4 w-4 mr-2" />
            Live Environmental Monitoring Network
          </Badge>
          <h2 className="scientific-heading text-4xl md:text-5xl mb-6">
            <span className="text-primary">Summit 2 Shore</span> Observatory
          </h2>
          <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
            A dense network of 22 environmental monitoring stations across Vermont's elevational gradients. 
            The Summit 2 Shore Observatory provides critical real-time weather and snowpack data from valley floors 
            to mountain peaks, supporting climate research and environmental monitoring across diverse elevation zones.
          </p>
        </div>

        <Tabs defaultValue="current" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="current" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Current Data
            </TabsTrigger>
            <TabsTrigger value="maps" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Maps
            </TabsTrigger>
            <TabsTrigger value="seasonal" className="flex items-center gap-2">
              <Mountain className="h-4 w-4" />
              3-Season Analysis
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Data Trends
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-6"  >
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {stationData.map((station) => (
                <Card key={station.id} className={`data-card transition-all hover:shadow-lg ${getStationTypeColor(station.type)}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{station.shortName}</CardTitle>
                        <p className="text-sm text-muted-foreground">{station.name}</p>
                      </div>
                      <Badge className={getStatusColor(station.status)}>
                        {station.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {station.lastUpdate}
                      </div>
                      <div className="text-green-600 font-medium">
                        {station.dataAvailability}% data
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Data Availability Status */}
                    <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Data Since Nov 2022</span>
                        <Badge variant="outline" className="text-xs">
                          {Math.round((Date.now() - new Date('2022-11-01').getTime()) / (1000 * 60 * 60 * 24))} days
                        </Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${station.dataAvailability}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Weather Data */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Thermometer className="h-4 w-4 text-red-500" />
                          <span className="text-sm">Temp:</span>
                        </div>
                        <span className="font-semibold text-lg">{station.currentTemp}°F</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Wind className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">Wind:</span>
                        </div>
                        <span className="text-sm">{station.windSpeed} mph</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Wind className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">Gust:</span>
                        </div>
                        <span className="text-sm">{station.windGust} mph</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Droplets className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">3h Precip:</span>
                        </div>
                        <span className="text-sm">{station.precipitation.toFixed(2)}"</span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-2">
                          <Mountain className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Elevation:</span>
                        </div>
                        <span className="text-sm font-medium">{station.elevation}m</span>
                      </div>
                    </div>

                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="seasonal" className="space-y-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Three-Season Data Overview</h3>
              <p className="text-muted-foreground">
                Comprehensive environmental data spanning Winter 2022-23, Summer 2023, and Winter 2023-24 seasons
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Ranch Brook Seasonal Analysis */}
              <Card className="data-card">
                <CardHeader>
                  <CardTitle className="text-red-700">Ranch Brook Transect - Seasonal Trends</CardTitle>
                  <p className="text-sm text-muted-foreground">Mount Mansfield elevational gradient (390m - 1170m)</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stationData.filter(s => s.type === 'ranch_brook').map(station => (
                      <div key={station.id} className="border rounded-lg p-4 bg-red-50">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold">{station.shortName}</h4>
                            <p className="text-sm text-muted-foreground">{station.elevation}m elevation</p>
                          </div>
                          <Badge variant="outline">{station.dataAvailability}% complete</Badge>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="text-center">
                            <div className="font-medium text-blue-600">Winter 2022-23</div>
                            <div>Avg: {station.seasonalData.winter2023.avgTemp}°F</div>
                            <div>Precip: {station.seasonalData.winter2023.totalPrecip}"</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-green-600">Summer 2023</div>
                            <div>Avg: {station.seasonalData.summer2023.avgTemp}°F</div>
                            <div>Precip: {station.seasonalData.summer2023.totalPrecip}"</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-blue-600">Winter 2023-24</div>
                            <div>Avg: {station.seasonalData.winter2024.avgTemp}°F</div>
                            <div>Precip: {station.seasonalData.winter2024.totalPrecip}"</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Distributed Sites Seasonal Analysis */}
              <Card className="data-card">
                <CardHeader>
                  <CardTitle className="text-blue-700">Distributed Sites - Regional Patterns</CardTitle>
                  <p className="text-sm text-muted-foreground">Valley floors to mountain peaks (45m - 1244m)</p>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {stationData.filter(s => s.type === 'distributed').map(station => (
                      <div key={station.id} className="border rounded-lg p-4 bg-blue-50">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold">{station.name}</h4>
                            <p className="text-sm text-muted-foreground">{station.elevation}m elevation</p>
                          </div>
                          <Badge variant="outline">{station.dataAvailability}% complete</Badge>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="text-center">
                            <div className="font-medium text-blue-600">Winter 2022-23</div>
                            <div>Avg: {station.seasonalData.winter2023.avgTemp}°F</div>
                            <div>Precip: {station.seasonalData.winter2023.totalPrecip}"</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-green-600">Summer 2023</div>
                            <div>Avg: {station.seasonalData.summer2023.avgTemp}°F</div>
                            <div>Precip: {station.seasonalData.summer2023.totalPrecip}"</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-blue-600">Winter 2023-24</div>
                            <div>Avg: {station.seasonalData.winter2024.avgTemp}°F</div>
                            <div>Precip: {station.seasonalData.winter2024.totalPrecip}"</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="data-card">
                <CardHeader>
                  <CardTitle>Data Collection Timeline</CardTitle>
                  <p className="text-sm text-muted-foreground">November 2022 - Present</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                      <div>
                        <div className="font-medium">Winter 2022-2023</div>
                        <div className="text-sm text-muted-foreground">Nov 2022 - Mar 2023</div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">Complete</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                      <div>
                        <div className="font-medium">Summer 2023</div>
                        <div className="text-sm text-muted-foreground">Apr 2023 - Oct 2023</div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Complete</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                      <div>
                        <div className="font-medium">Winter 2023-2024</div>
                        <div className="text-sm text-muted-foreground">Nov 2023 - Mar 2024</div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">Complete</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                      <div>
                        <div className="font-medium">Current Season</div>
                        <div className="text-sm text-muted-foreground">Nov 2024 - Present</div>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">Ongoing</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="data-card">
                <CardHeader>
                  <CardTitle>Network Performance</CardTitle>
                  <p className="text-sm text-muted-foreground">Data availability across all stations</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">Overall Availability</span>
                      <span className="font-medium">
                        {Math.round(stationData.reduce((acc, s) => acc + s.dataAvailability, 0) / stationData.length)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Best Performing Station</span>
                      <span className="font-medium">
                        {stationData.reduce((prev, current) => (prev.dataAvailability > current.dataAvailability) ? prev : current).shortName} ({Math.max(...stationData.map(s => s.dataAvailability))}%)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Total Data Days</span>
                      <span className="font-medium">{Math.round((Date.now() - new Date('2022-11-01').getTime()) / (1000 * 60 * 60 * 24))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Seasonal Completeness</span>
                      <span className="font-medium">3 Full Seasons</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="maps" className="space-y-6">
            <Card className="data-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Interactive Network Map
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Explore monitoring stations across Vermont's elevational gradients
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-[600px] bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center">
                  <Card className="bg-background/80 backdrop-blur-sm">
                    <CardContent className="p-8 text-center">
                      <MapPin className="h-16 w-16 mx-auto mb-4 text-primary" />
                      <h3 className="text-xl font-semibold mb-2">Interactive Map Coming Soon</h3>
                      <p className="text-muted-foreground mb-4">
                        Full interactive mapping with real-time data visualization across Vermont's elevational gradients.
                      </p>
                      <Button>
                        <Eye className="h-4 w-4 mr-2" />
                        Enable Interactive Map
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default DataMap;