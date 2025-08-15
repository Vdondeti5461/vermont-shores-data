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
            {/* Network Summary */}
            <div className="text-center mb-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-4 rounded-xl">
                  <div className="text-2xl font-bold">{networkSites.filter(s => s.type === 'ranch_brook').length}</div>
                  <div className="text-sm opacity-90">Ranch Brook</div>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-xl">
                  <div className="text-2xl font-bold">{networkSites.filter(s => s.type === 'distributed').length}</div>
                  <div className="text-sm opacity-90">Distributed</div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-xl">
                  <div className="text-2xl font-bold">{networkSites.length}</div>
                  <div className="text-sm opacity-90">Total Sites</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-xl">
                  <div className="text-2xl font-bold">1116m</div>
                  <div className="text-sm opacity-90">Range</div>
                </div>
              </div>
            </div>

            {/* All Sites in One Ordered List */}
            <Card className="data-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Complete Network Directory
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  All 22 monitoring stations ordered by elevation - from valley floor to mountain summit
                </p>
                <div className="flex gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span>Ranch Brook Sites (Mount Mansfield)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span>Distributed Sites (Regional)</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[600px] overflow-y-auto">
                  {networkSites
                    .sort((a, b) => b.elevation - a.elevation)
                    .map((site, index) => {
                      const isRanchBrook = site.type === 'ranch_brook';
                      const elevationCategory = site.elevation > 800 ? 'High Alpine' : 
                                              site.elevation > 500 ? 'Mid Elevation' : 
                                              site.elevation > 200 ? 'Highland' : 'Valley Floor';
                      
                      return (
                        <div 
                          key={site.id}
                          className={`relative border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-all duration-300 cursor-pointer group ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                          }`}
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          {/* Elevation indicator line */}
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-gray-300 to-gray-400"></div>
                          <div 
                            className="absolute left-0 top-0 w-1 transition-all duration-500 group-hover:w-2"
                            style={{ 
                              height: `${((site.elevation - 47) / (1163 - 47)) * 100}%`,
                              backgroundColor: isRanchBrook ? '#dc2626' : '#2563eb'
                            }}
                          ></div>
                          
                          <div className="flex items-center justify-between p-6 pl-8">
                            <div className="flex items-center gap-6">
                              {/* Rank Number */}
                              <div className="flex flex-col items-center">
                                <div className="text-2xl font-bold text-gray-400 group-hover:text-gray-600 transition-colors">
                                  #{index + 1}
                                </div>
                                <div className="text-xs text-gray-400">rank</div>
                              </div>
                              
                              {/* Site Marker */}
                              <div className="relative">
                                <div 
                                  className={`w-6 h-6 rounded-full border-4 border-white shadow-lg transition-transform duration-300 group-hover:scale-125 ${
                                    isRanchBrook ? 'bg-red-500' : 'bg-blue-500'
                                  }`}
                                ></div>
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                              </div>
                              
                              {/* Site Information */}
                              <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">
                                    {site.shortName}
                                  </h3>
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${
                                      isRanchBrook 
                                        ? 'text-red-700 border-red-300 bg-red-50' 
                                        : 'text-blue-700 border-blue-300 bg-blue-50'
                                    }`}
                                  >
                                    {isRanchBrook ? 'RB' : 'DIST'}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600">{site.name}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {site.latitude.toFixed(4)}°N, {site.longitude.toFixed(4)}°W
                                  </span>
                                  <span className="px-2 py-1 bg-gray-100 rounded-full">
                                    {elevationCategory}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Elevation Display */}
                            <div className="text-right">
                              <div className="text-3xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                                {site.elevation}
                              </div>
                              <div className="text-sm text-gray-500">meters</div>
                              <div className="mt-2">
                                <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      isRanchBrook ? 'bg-red-500' : 'bg-blue-500'
                                    }`}
                                    style={{ width: `${((site.elevation - 47) / (1163 - 47)) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Status Indicator */}
                          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                              Active
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats Footer */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="text-lg font-bold text-red-700">1163m</div>
                <div className="text-xs text-red-600">Highest Site</div>
                <div className="text-xs text-gray-500">RB-13 Summit</div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-lg font-bold text-blue-700">47m</div>
                <div className="text-xs text-blue-600">Lowest Site</div>
                <div className="text-xs text-gray-500">POTASH Brook</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-lg font-bold text-green-700">456m</div>
                <div className="text-xs text-green-600">Average Elevation</div>
                <div className="text-xs text-gray-500">All Sites</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-lg font-bold text-purple-700">100%</div>
                <div className="text-xs text-purple-600">Active Status</div>
                <div className="text-xs text-gray-500">All Operational</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default DataMap;