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
  cameraUrl?: string;
  type: 'ranch_brook' | 'distributed';
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

  // Enhanced station data with current weather simulation
  const stationData: StationData[] = [
    // Ranch Brook Sites (Mount Mansfield)
    { id: 1, name: "Ranch Brook 01", shortName: "RB01", latitude: 44.5267, longitude: -72.8148, elevation: 390, status: 'active', currentTemp: 68, windSpeed: 8, windGust: 12, precipitation: 0.00, lastUpdate: "7:40 PM", type: "ranch_brook" },
    { id: 2, name: "Ranch Brook 05", shortName: "RB05", latitude: 44.5267, longitude: -72.8148, elevation: 650, status: 'active', currentTemp: 62, windSpeed: 12, windGust: 18, precipitation: 0.00, lastUpdate: "7:40 PM", type: "ranch_brook" },
    { id: 3, name: "Ranch Brook 08", shortName: "RB08", latitude: 44.5267, longitude: -72.8148, elevation: 845, status: 'active', currentTemp: 58, windSpeed: 15, windGust: 22, precipitation: 0.00, lastUpdate: "7:40 PM", type: "ranch_brook" },
    { id: 4, name: "Ranch Brook 12", shortName: "RB12", latitude: 44.5267, longitude: -72.8148, elevation: 1170, status: 'active', currentTemp: 52, windSpeed: 18, windGust: 28, precipitation: 0.00, lastUpdate: "7:40 PM", type: "ranch_brook" },
    
    // Distributed Sites
    { id: 5, name: "Potash Brook", shortName: "PB", latitude: 44.4759, longitude: -72.8148, elevation: 45, status: 'active', currentTemp: 75, windSpeed: 5, windGust: 8, precipitation: 0.00, lastUpdate: "7:40 PM", type: "distributed" },
    { id: 6, name: "Underhill", shortName: "UH", latitude: 44.5267, longitude: -72.8698, elevation: 340, status: 'active', currentTemp: 70, windSpeed: 7, windGust: 11, precipitation: 0.00, lastUpdate: "7:40 PM", type: "distributed" },
    { id: 7, name: "Bolton Valley", shortName: "BV", latitude: 44.4089, longitude: -72.8698, elevation: 520, status: 'maintenance', currentTemp: 64, windSpeed: 10, windGust: 15, precipitation: 0.00, lastUpdate: "7:30 PM", type: "distributed" },
    { id: 8, name: "Camel's Hump", shortName: "CH", latitude: 44.3267, longitude: -72.8851, elevation: 1244, status: 'active', currentTemp: 49, windSpeed: 20, windGust: 32, precipitation: 0.00, lastUpdate: "7:40 PM", type: "distributed" },
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

        <Tabs defaultValue="grid" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="grid" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Grid
            </TabsTrigger>
            <TabsTrigger value="maps" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Maps
            </TabsTrigger>
            <TabsTrigger value="current" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Current
            </TabsTrigger>
            <TabsTrigger value="summaries" className="flex items-center gap-2">
              <Mountain className="h-4 w-4" />
              Summaries
            </TabsTrigger>
          </TabsList>

          <TabsContent value="grid" className="space-y-6">
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
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {station.lastUpdate}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Camera placeholder */}
                    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Camera className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-xs text-gray-500">Live Camera</p>
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

          <TabsContent value="current" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="data-card">
                <CardHeader>
                  <CardTitle>Network Status Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total Stations</span>
                      <Badge className="bg-primary text-primary-foreground">{stationData.length}/22</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Active</span>
                      <Badge className="bg-success text-success-foreground">
                        {stationData.filter(s => s.status === 'active').length}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Maintenance</span>
                      <Badge className="bg-warning text-warning-foreground">
                        {stationData.filter(s => s.status === 'maintenance').length}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Offline</span>
                      <Badge className="bg-destructive text-destructive-foreground">
                        {stationData.filter(s => s.status === 'offline').length}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="data-card">
                <CardHeader>
                  <CardTitle>Environmental Ranges</CardTitle>
                  <p className="text-sm text-muted-foreground">Current conditions across network</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">Temperature Range</span>
                      <span className="font-medium">
                        {Math.min(...stationData.map(s => s.currentTemp))}°F - {Math.max(...stationData.map(s => s.currentTemp))}°F
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Wind Speed Range</span>
                      <span className="font-medium">
                        {Math.min(...stationData.map(s => s.windSpeed))} - {Math.max(...stationData.map(s => s.windSpeed))} mph
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Elevation Range</span>
                      <span className="font-medium">
                        {Math.min(...stationData.map(s => s.elevation))}m - {Math.max(...stationData.map(s => s.elevation))}m
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Data Resolution</span>
                      <span className="font-medium">10-minute</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="summaries" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="data-card">
                <CardHeader>
                  <CardTitle>Ranch Brook Transect</CardTitle>
                  <p className="text-sm text-muted-foreground">Mount Mansfield elevational gradient</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stationData.filter(s => s.type === 'ranch_brook').map(station => (
                      <div key={station.id} className="flex items-center justify-between p-2 bg-red-50 rounded">
                        <div>
                          <div className="font-medium text-sm">{station.shortName}</div>
                          <div className="text-xs text-muted-foreground">{station.elevation}m</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{station.currentTemp}°F</div>
                          <div className="text-xs text-muted-foreground">{station.windSpeed} mph</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="data-card">
                <CardHeader>
                  <CardTitle>Distributed Sites</CardTitle>
                  <p className="text-sm text-muted-foreground">Regional monitoring stations</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stationData.filter(s => s.type === 'distributed').map(station => (
                      <div key={station.id} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                        <div>
                          <div className="font-medium text-sm">{station.name}</div>
                          <div className="text-xs text-muted-foreground">{station.elevation}m</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{station.currentTemp}°F</div>
                          <div className="text-xs text-muted-foreground">{station.windSpeed} mph</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default DataMap;