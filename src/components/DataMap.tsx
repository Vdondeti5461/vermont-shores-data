import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Eye, Activity, Mountain } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import InteractiveMap from './InteractiveMap';

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

interface NetworkSite {
  id: number;
  name: string;
  shortName: string;
  latitude: number;
  longitude: number;
  elevation: number;
  type: 'ranch_brook' | 'distributed';
  description?: string;
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

  // Summit 2 Shore Network Sites - Actual Coordinates from your data
  const networkSites: NetworkSite[] = [
    // Ranch Brook Sites (Mount Mansfield)
    { id: 6, name: "Site #6", shortName: "RB-06", latitude: 44.5036530380135, longitude: -72.7836409062135, elevation: 412, type: "ranch_brook" },
    { id: 13, name: "Mansfield Summit", shortName: "RB-13", latitude: 44.5283751587457, longitude: -72.8146923602848, elevation: 1163, type: "ranch_brook" },
    { id: 11, name: "Site #11", shortName: "RB-11", latitude: 44.5054945991154, longitude: -72.7713537523828, elevation: 380, type: "ranch_brook" },
    { id: 14, name: "West SCAN", shortName: "RB-14", latitude: 44.5350071258492, longitude: -72.8346030483568, elevation: 705, type: "ranch_brook" },
    { id: 10, name: "Site #10", shortName: "RB-10", latitude: 44.4950487144400, longitude: -72.7863919308848, elevation: 324, type: "ranch_brook" },
    { id: 3, name: "Site #3", shortName: "RB-03", latitude: 44.5148205082645, longitude: -72.8091001764497, elevation: 795, type: "ranch_brook" },
    { id: 1, name: "Site #1", shortName: "RB-01", latitude: 44.5232172356824, longitude: -72.8086814178174, elevation: 1072, type: "ranch_brook" },
    { id: 4, name: "Site #4", shortName: "RB-04", latitude: 44.5109883266970, longitude: -72.8028011229860, elevation: 639, type: "ranch_brook" },
    { id: 8, name: "Site #8", shortName: "RB-08", latitude: 44.5095676726570, longitude: -72.7823748064730, elevation: 472, type: "ranch_brook" },
    { id: 7, name: "Site #7", shortName: "RB-07", latitude: 44.5149713130170, longitude: -72.7853509497577, elevation: 613, type: "ranch_brook" },
    { id: 2, name: "Site #2", shortName: "RB-02", latitude: 44.5177774030582, longitude: -72.8103971233262, elevation: 911, type: "ranch_brook" },
    { id: 5, name: "Site #5", shortName: "RB-05", latitude: 44.5044687478697, longitude: -72.7993524769469, elevation: 507, type: "ranch_brook" },
    { id: 9, name: "Site #9", shortName: "RB-09", latitude: 44.4890572884939, longitude: -72.7928489865410, elevation: 846, type: "ranch_brook" },
    
    // Distributed Sites Across Vermont
    { id: 20, name: "Jericho (Forested)", shortName: "JER-F", latitude: 44.4478096390368, longitude: -73.0027073790982, elevation: 196, type: "distributed" },
    { id: 16, name: "Sleepers R3/Main", shortName: "SLP-R3", latitude: 44.4830135845911, longitude: -72.1646653898307, elevation: 553, type: "distributed" },
    { id: 21, name: "Spear St", shortName: "SPEAR", latitude: 44.4525602200818, longitude: -73.1919332892984, elevation: 86, type: "distributed" },
    { id: 19, name: "Jericho (Clearing)", shortName: "JER-C", latitude: 44.4477475517057, longitude: -73.0024839526755, elevation: 198, type: "distributed" },
    { id: 17, name: "Sleepers R25", shortName: "SLP-R25", latitude: 44.4767396396551, longitude: -72.1259510549582, elevation: 360, type: "distributed" },
    { id: 15, name: "Proctor Maple", shortName: "PROC", latitude: 44.5285025067839, longitude: -72.8667089154594, elevation: 422, type: "distributed" },
    { id: 22, name: "Potash Brook", shortName: "POTASH", latitude: 44.4448498951540, longitude: -73.2143236967372, elevation: 47, type: "distributed" },
    { id: 18, name: "Sleepers W1/R11", shortName: "SLP-W1", latitude: 44.4999008208884, longitude: -72.0671042476799, elevation: 226, type: "distributed" },
    { id: 12, name: "FEMC", shortName: "FEMC", latitude: 44.5188601707834, longitude: -72.7979001248108, elevation: 872, type: "distributed" }
  ];

  const getElevationColor = (elevation: number, type: string) => {
    if (type === 'ranch_brook') {
      if (elevation < 500) return '#dc2626'; // Low RB sites - Red
      if (elevation < 800) return '#b91c1c'; // Mid RB sites - Darker Red  
      return '#991b1b'; // High RB sites - Darkest Red
    } else {
      if (elevation < 200) return '#16a34a'; // Valley sites - Green
      if (elevation < 500) return '#2563eb'; // Mid elevation - Blue
      return '#7c3aed'; // High elevation - Purple
    }
  };

  const getElevationSize = (elevation: number) => {
    if (elevation < 200) return 'w-3 h-3';
    if (elevation < 500) return 'w-4 h-4';
    if (elevation < 800) return 'w-5 h-5';
    return 'w-6 h-6';
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

        <Tabs defaultValue="map" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="map" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Interactive Map
            </TabsTrigger>
            <TabsTrigger value="network" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Network Overview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="space-y-6">
            <InteractiveMap sites={networkSites} onSiteClick={(site) => console.log('Site clicked:', site)} />
          </TabsContent>


          <TabsContent value="network" className="space-y-8 animate-fade-in">
            {/* Network Statistics */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="relative overflow-hidden bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover-scale">
                <CardContent className="p-6">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-red-200/30 rounded-full -translate-y-10 translate-x-10"></div>
                  <Mountain className="h-8 w-8 text-red-600 mb-3" />
                  <div className="text-3xl font-bold text-red-700 mb-1">{networkSites.filter(s => s.type === 'ranch_brook').length}</div>
                  <div className="text-sm font-medium text-red-600">Ranch Brook Sites</div>
                  <div className="text-xs text-red-500 mt-1">Mount Mansfield Transect</div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover-scale">
                <CardContent className="p-6">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200/30 rounded-full -translate-y-10 translate-x-10"></div>
                  <MapPin className="h-8 w-8 text-blue-600 mb-3" />
                  <div className="text-3xl font-bold text-blue-700 mb-1">{networkSites.filter(s => s.type === 'distributed').length}</div>
                  <div className="text-sm font-medium text-blue-600">Distributed Sites</div>
                  <div className="text-xs text-blue-500 mt-1">Regional Network</div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover-scale">
                <CardContent className="p-6">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-green-200/30 rounded-full -translate-y-10 translate-x-10"></div>
                  <Activity className="h-8 w-8 text-green-600 mb-3" />
                  <div className="text-3xl font-bold text-green-700 mb-1">{networkSites.length}</div>
                  <div className="text-sm font-medium text-green-600">Total Sites</div>
                  <div className="text-xs text-green-500 mt-1">Active Monitoring</div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover-scale">
                <CardContent className="p-6">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-purple-200/30 rounded-full -translate-y-10 translate-x-10"></div>
                  <Mountain className="h-8 w-8 text-purple-600 mb-3" />
                  <div className="text-3xl font-bold text-purple-700 mb-1">1116m</div>
                  <div className="text-sm font-medium text-purple-600">Elevation Range</div>
                  <div className="text-xs text-purple-500 mt-1">47m - 1163m</div>
                </CardContent>
              </Card>
            </div>

            {/* Elevation Gradient Visualization */}
            <Card className="data-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mountain className="h-5 w-5 text-primary" />
                  Elevation Distribution
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Interactive elevation profile showing all monitoring sites across Vermont's topography
                </p>
              </CardHeader>
              <CardContent>
                <div className="relative h-32 bg-gradient-to-r from-green-100 via-yellow-100 to-red-100 rounded-lg p-4 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-200/20 to-transparent rounded-lg"></div>
                  <div className="relative h-full flex items-end justify-between">
                    {networkSites
                      .sort((a, b) => a.elevation - b.elevation)
                      .map((site, index) => {
                        const heightPercent = ((site.elevation - 47) / (1163 - 47)) * 100;
                        return (
                          <div
                            key={site.id}
                            className="group relative cursor-pointer transition-all duration-300 hover:scale-110"
                            style={{ height: `${Math.max(heightPercent, 5)}%` }}
                          >
                            <div
                              className={`w-3 h-full rounded-t-full transition-all duration-300 ${
                                site.type === 'ranch_brook' 
                                  ? 'bg-red-500 group-hover:bg-red-600' 
                                  : 'bg-blue-500 group-hover:bg-blue-600'
                              }`}
                            ></div>
                            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                              <div className="font-semibold">{site.shortName}</div>
                              <div>{site.elevation}m</div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-muted-foreground p-2">
                    <span>47m (Valley)</span>
                    <span>1163m (Summit)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interactive Site Grid */}
            <div className="grid lg:grid-cols-2 gap-8">
              
              {/* Ranch Brook Sites */}
              <Card className="data-card border-red-200 group hover:border-red-300 transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 group-hover:from-red-100 group-hover:to-red-150 transition-all duration-300">
                  <CardTitle className="text-red-800 flex items-center gap-2">
                    <Mountain className="h-5 w-5" />
                    Ranch Brook Transect
                    <Badge variant="outline" className="ml-auto text-red-700 border-red-300">
                      {networkSites.filter(s => s.type === 'ranch_brook').length} sites
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-red-600">Mount Mansfield elevational gradient • 380m - 1163m elevation</p>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {networkSites
                      .filter(site => site.type === 'ranch_brook')
                      .sort((a, b) => b.elevation - a.elevation)
                      .map((site, index) => (
                        <div 
                          key={site.id} 
                          className="group/site flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100 hover:bg-red-100 hover:border-red-200 transition-all duration-300 cursor-pointer hover-scale"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className="flex items-center gap-4">
                            <div 
                              className="w-4 h-4 rounded-full border-2 border-white shadow-lg transition-transform duration-300 group-hover/site:scale-125"
                              style={{ backgroundColor: getElevationColor(site.elevation, site.type) }}
                            ></div>
                            <div>
                              <div className="font-semibold text-sm text-red-800">{site.shortName}</div>
                              <div className="text-xs text-muted-foreground">{site.name}</div>
                              <div className="text-xs text-red-600 mt-1 opacity-0 group-hover/site:opacity-100 transition-opacity duration-300">
                                {site.latitude.toFixed(4)}°N, {site.longitude.toFixed(4)}°W
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg text-red-700 group-hover/site:text-red-800 transition-colors duration-300">
                              {site.elevation}m
                            </div>
                            <div className="text-xs text-red-500">
                              {site.elevation > 800 ? 'High Alpine' : site.elevation > 500 ? 'Mid Elevation' : 'Valley Floor'}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Distributed Sites */}
              <Card className="data-card border-blue-200 group hover:border-blue-300 transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 group-hover:from-blue-100 group-hover:to-blue-150 transition-all duration-300">
                  <CardTitle className="text-blue-800 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Distributed Network
                    <Badge variant="outline" className="ml-auto text-blue-700 border-blue-300">
                      {networkSites.filter(s => s.type === 'distributed').length} sites
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-blue-600">Regional monitoring stations • 47m - 872m elevation</p>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {networkSites
                      .filter(site => site.type === 'distributed')
                      .sort((a, b) => b.elevation - a.elevation)
                      .map((site, index) => (
                        <div 
                          key={site.id} 
                          className="group/site flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 hover:border-blue-200 transition-all duration-300 cursor-pointer hover-scale"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className="flex items-center gap-4">
                            <div 
                              className="w-4 h-4 rounded-full border-2 border-white shadow-lg transition-transform duration-300 group-hover/site:scale-125"
                              style={{ backgroundColor: getElevationColor(site.elevation, site.type) }}
                            ></div>
                            <div>
                              <div className="font-semibold text-sm text-blue-800">{site.shortName}</div>
                              <div className="text-xs text-muted-foreground">{site.name}</div>
                              <div className="text-xs text-blue-600 mt-1 opacity-0 group-hover/site:opacity-100 transition-opacity duration-300">
                                {site.latitude.toFixed(4)}°N, {site.longitude.toFixed(4)}°W
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg text-blue-700 group-hover/site:text-blue-800 transition-colors duration-300">
                              {site.elevation}m
                            </div>
                            <div className="text-xs text-blue-500">
                              {site.elevation > 500 ? 'Highland' : site.elevation > 200 ? 'Midland' : 'Lowland'}
                            </div>
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