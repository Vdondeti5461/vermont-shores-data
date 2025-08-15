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


          <TabsContent value="network" className="space-y-6 animate-fade-in">
            {/* Research Dashboard Header */}
            <div className="grid lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-blue-800">{networkSites.length}</div>
                      <div className="text-sm text-blue-600">Active Stations</div>
                    </div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-800">1116m</div>
                  <div className="text-sm text-green-600">Elevation Range</div>
                  <div className="text-xs text-green-500 mt-1">Valley to Summit</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-purple-800">3</div>
                  <div className="text-sm text-purple-600">Eco Zones</div>
                  <div className="text-xs text-purple-500 mt-1">Alpine to Valley</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-orange-800">24/7</div>
                  <div className="text-sm text-orange-600">Data Collection</div>
                  <div className="text-xs text-orange-500 mt-1">Real-time</div>
                </CardContent>
              </Card>
            </div>

            {/* Elevation Transect Visualization */}
            <Card className="data-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mountain className="h-5 w-5 text-primary" />
                  Elevational Transect Analysis
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Environmental gradient from Champlain Valley (47m) to Mount Mansfield Summit (1163m)
                </p>
              </CardHeader>
              <CardContent>
                <div className="relative h-48 bg-gradient-to-r from-green-100 via-yellow-50 to-blue-100 rounded-lg overflow-hidden border">
                  {/* Elevation profile background */}
                  <svg viewBox="0 0 800 200" className="absolute inset-0 w-full h-full">
                    <defs>
                      <linearGradient id="elevationGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
                        <stop offset="50%" stopColor="#eab308" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,180 Q200,160 400,120 Q600,80 800,40 L800,200 L0,200 Z"
                      fill="url(#elevationGradient)"
                      stroke="#94a3b8"
                      strokeWidth="2"
                    />
                  </svg>

                  {/* Site markers positioned on the profile */}
                  {networkSites
                    .sort((a, b) => a.elevation - b.elevation)
                    .map((site, index) => {
                      const xPos = (index / (networkSites.length - 1)) * 85 + 7.5;
                      const yPos = 85 - ((site.elevation - 47) / (1163 - 47)) * 65;
                      const isRanchBrook = site.type === 'ranch_brook';
                      const isSummit = site.shortName === 'RB-13';
                      
                      return (
                        <div
                          key={site.id}
                          className="absolute group cursor-pointer transition-all duration-300 hover:scale-110"
                          style={{ left: `${xPos}%`, top: `${yPos}%` }}
                        >
                          <div className={`relative ${isSummit ? 'animate-pulse' : ''}`}>
                            <div 
                              className={`w-4 h-4 rounded-full border-2 border-white shadow-lg ${
                                isSummit 
                                  ? 'bg-yellow-400 border-yellow-600' 
                                  : isRanchBrook 
                                    ? 'bg-red-500' 
                                    : 'bg-blue-500'
                              }`}
                            />
                            {isSummit && (
                              <div className="absolute -top-1 -left-0.5 text-yellow-600 text-xs">⭐</div>
                            )}
                          </div>
                          
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                            <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap">
                              <div className="font-semibold">
                                {isSummit ? 'Mount Mansfield Summit' : site.shortName}
                              </div>
                              <div>{site.elevation}m elevation</div>
                              <div className="text-gray-300">{site.name}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                  {/* Elevation markers */}
                  <div className="absolute left-2 top-2 text-xs text-gray-600 bg-white/80 px-2 py-1 rounded">
                    1163m
                  </div>
                  <div className="absolute left-2 bottom-2 text-xs text-gray-600 bg-white/80 px-2 py-1 rounded">
                    47m
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Research Station Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Ranch Brook Transect */}
              <Card className="data-card">
                <CardHeader className="bg-red-50 border-b border-red-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-red-800 flex items-center gap-2">
                        <Mountain className="h-5 w-5" />
                        Ranch Brook Transect
                      </CardTitle>
                      <p className="text-sm text-red-600 mt-1">
                        Mount Mansfield elevational gradient study
                      </p>
                    </div>
                    <Badge variant="outline" className="text-red-700 border-red-300">
                      {networkSites.filter(s => s.type === 'ranch_brook').length} stations
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-80 overflow-y-auto">
                    {networkSites
                      .filter(site => site.type === 'ranch_brook')
                      .sort((a, b) => b.elevation - a.elevation)
                      .map((site, index) => {
                        const isSummit = site.shortName === 'RB-13';
                        const ecosystemType = site.elevation > 1000 ? 'Alpine Tundra' :
                                             site.elevation > 800 ? 'Subalpine Forest' :
                                             site.elevation > 600 ? 'Montane Forest' : 'Hardwood Forest';
                        
                        return (
                          <div 
                            key={site.id}
                            className={`border-b border-gray-100 hover:bg-red-50 transition-colors cursor-pointer group ${
                              isSummit ? 'bg-yellow-50' : ''
                            }`}
                          >
                            <div className="p-4 flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="relative">
                                  {isSummit && <div className="absolute -top-1 -left-1 text-yellow-500">⭐</div>}
                                  <div 
                                    className={`w-3 h-3 rounded-full ${
                                      isSummit ? 'bg-yellow-400' : 'bg-red-500'
                                    } group-hover:scale-125 transition-transform`}
                                  />
                                </div>
                                <div>
                                  <div className="font-semibold text-sm">
                                    {isSummit ? 'Summit Station' : site.shortName}
                                  </div>
                                  <div className="text-xs text-gray-600">{site.name}</div>
                                  <div className="text-xs text-red-600 mt-1">{ecosystemType}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-red-700">{site.elevation}m</div>
                                <div className="text-xs text-gray-500">
                                  {((site.elevation - 47) / (1163 - 47) * 100).toFixed(0)}% gradient
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>

              {/* Distributed Network */}
              <Card className="data-card">
                <CardHeader className="bg-blue-50 border-b border-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-blue-800 flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Regional Network
                      </CardTitle>
                      <p className="text-sm text-blue-600 mt-1">
                        Distributed climate monitoring stations
                      </p>
                    </div>
                    <Badge variant="outline" className="text-blue-700 border-blue-300">
                      {networkSites.filter(s => s.type === 'distributed').length} stations
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-80 overflow-y-auto">
                    {networkSites
                      .filter(site => site.type === 'distributed')
                      .sort((a, b) => b.elevation - a.elevation)
                      .map((site, index) => {
                        const landcover = site.elevation > 500 ? 'Mixed Forest' :
                                         site.elevation > 200 ? 'Agricultural' :
                                         site.elevation > 100 ? 'Suburban' : 'Wetland/Urban';
                        
                        return (
                          <div 
                            key={site.id}
                            className="border-b border-gray-100 hover:bg-blue-50 transition-colors cursor-pointer group"
                          >
                            <div className="p-4 flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div 
                                  className="w-3 h-3 rounded-full bg-blue-500 group-hover:scale-125 transition-transform"
                                />
                                <div>
                                  <div className="font-semibold text-sm">{site.shortName}</div>
                                  <div className="text-xs text-gray-600">{site.name}</div>
                                  <div className="text-xs text-blue-600 mt-1">{landcover}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-blue-700">{site.elevation}m</div>
                                <div className="text-xs text-gray-500">
                                  Regional climate
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Research Context */}
            <Card className="data-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Research Applications
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Scientific objectives and data applications for the Summit 2 Shore observatory network
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <h4 className="font-semibold text-sm">Climate Gradients</h4>
                    </div>
                    <p className="text-xs text-gray-600">
                      Temperature and precipitation lapse rates across Vermont elevational gradients
                    </p>
                    <div className="text-xs text-gray-500">
                      • Orographic precipitation effects<br/>
                      • Temperature inversions<br/>
                      • Microclimate variation
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <h4 className="font-semibold text-sm">Snowpack Dynamics</h4>
                    </div>
                    <p className="text-xs text-gray-600">
                      Snow accumulation, ablation, and hydrological processes across elevation zones
                    </p>
                    <div className="text-xs text-gray-500">
                      • Snow water equivalent<br/>
                      • Melt timing patterns<br/>
                      • Watershed hydrology
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <h4 className="font-semibold text-sm">Ecosystem Response</h4>
                    </div>
                    <p className="text-xs text-gray-600">
                      Climate change impacts on Vermont forest and alpine ecosystems
                    </p>
                    <div className="text-xs text-gray-500">
                      • Species migration<br/>
                      • Phenological shifts<br/>
                      • Alpine vulnerability
                    </div>
                  </div>
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