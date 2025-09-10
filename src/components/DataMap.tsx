import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Eye, Activity, Mountain } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import InteractiveMap from './InteractiveMap';
import { useLocalLocations } from '@/hooks/useLocalDatabase';

interface Location {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
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
  type: 'ranch_brook' | 'distributed' | 'database';
  description?: string;
}

const DataMap = () => {
  const { toast } = useToast();
  
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
  
  // Fetch locations from local MySQL database
  const { data: locationsData, isLoading: locationsLoading, error: locationsError } = useLocalLocations();

  const locations: Location[] = locationsData || [];
  const recentData: RecentData[] = [];

  // Merge real database locations with network sites if available
  const allSites: NetworkSite[] = locations.length > 0 ? locations.map(loc => ({
    id: loc.id,
    name: loc.name,
    shortName: loc.name.substring(0, 10),
    latitude: loc.latitude,
    longitude: loc.longitude,
    elevation: loc.elevation || 0,
    type: 'database' as const,
    description: `Database location at ${loc.elevation}m elevation`
  })) : networkSites;

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
            <InteractiveMap sites={allSites} onSiteClick={(site) => console.log('Site clicked:', site)} />
            {locationsLoading && (
              <div className="text-center py-4">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading database locations...</p>
              </div>
            )}
          </TabsContent>


          <TabsContent value="network" className="space-y-6 animate-fade-in">
            {/* Network Status Dashboard */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{networkSites.length}</div>
                      <div className="text-sm font-medium text-gray-600">Active Stations</div>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-600">All operational</span>
                      </div>
                    </div>
                    <Activity className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">1116m</div>
                      <div className="text-sm font-medium text-gray-600">Elevation Span</div>
                      <div className="text-xs text-blue-600 mt-1">47m → 1163m</div>
                    </div>
                    <Mountain className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">2</div>
                      <div className="text-sm font-medium text-gray-600">Network Types</div>
                      <div className="text-xs text-purple-600 mt-1">RB + Distributed</div>
                    </div>
                    <MapPin className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">24/7</div>
                      <div className="text-sm font-medium text-gray-600">Data Stream</div>
                      <div className="text-xs text-orange-600 mt-1">Continuous monitoring</div>
                    </div>
                    <Eye className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Interactive Station Explorer */}
            <Card className="data-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Mountain className="h-5 w-5 text-primary" />
                      Environmental Monitoring Stations
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Complete network overview with elevation profiles and operational status
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-red-700 border-red-300 bg-red-50">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                      Ranch Brook ({networkSites.filter(s => s.type === 'ranch_brook').length})
                    </Badge>
                    <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-50">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                      Distributed ({networkSites.filter(s => s.type === 'distributed').length})
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Elevation Profile Visualization */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">Elevation Profile (47m - 1163m)</h4>
                  <div className="relative h-20 bg-gradient-to-r from-green-50 via-yellow-50 to-blue-50 rounded-lg border overflow-hidden">
                    {/* Background gradient bars */}
                    <div className="absolute inset-0 flex">
                      <div className="flex-1 bg-green-200/30 border-r border-green-300/50"></div>
                      <div className="flex-1 bg-yellow-200/30 border-r border-yellow-300/50"></div>
                      <div className="flex-1 bg-blue-200/30"></div>
                    </div>
                    
                    {/* Elevation scale */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 p-2">
                      <span>Valley (47m)</span>
                      <span>Montane (500m)</span>
                      <span>Alpine (800m)</span>
                      <span>Summit (1163m)</span>
                    </div>

                    {/* Station markers */}
                    {networkSites
                      .sort((a, b) => a.elevation - b.elevation)
                      .map((site, index) => {
                        const position = ((site.elevation - 47) / (1163 - 47)) * 100;
                        const isSummit = site.shortName === 'RB-13';
                        const isRanchBrook = site.type === 'ranch_brook';
                        
                        return (
                          <div
                            key={site.id}
                            className="absolute top-2 transform -translate-x-1/2 group cursor-pointer"
                            style={{ left: `${position}%` }}
                          >
                            <div className={`w-3 h-12 rounded-full ${
                              isSummit 
                                ? 'bg-yellow-400 border-2 border-yellow-600' 
                                : isRanchBrook 
                                  ? 'bg-red-500 border border-red-600' 
                                  : 'bg-blue-500 border border-blue-600'
                            } shadow-sm`}>
                            </div>
                            
                            {/* Station info on hover */}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                              <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                                <div className="font-semibold">
                                  {isSummit ? 'Summit' : site.shortName}
                                </div>
                                <div>{site.elevation}m</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Station Data Table */}
                <div className="space-y-1">
                  <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    <div className="col-span-1">Rank</div>
                    <div className="col-span-2">Station ID</div>
                    <div className="col-span-3">Location</div>
                    <div className="col-span-2">Elevation</div>
                    <div className="col-span-2">Network</div>
                    <div className="col-span-2">Status</div>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {networkSites
                      .sort((a, b) => b.elevation - a.elevation)
                      .map((site, index) => {
                        const isSummit = site.shortName === 'RB-13';
                        const isRanchBrook = site.type === 'ranch_brook';
                        const ecosystemZone = site.elevation >= 800 ? 'Alpine' :
                                             site.elevation >= 500 ? 'Montane' : 'Valley';
                        
                        return (
                          <div 
                            key={site.id}
                            className={`grid grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-50 border-b border-gray-100 transition-colors cursor-pointer ${
                              isSummit ? 'bg-yellow-50' : ''
                            }`}
                          >
                            {/* Rank */}
                            <div className="col-span-1 flex items-center">
                              <div className="text-sm font-bold text-gray-400">
                                #{index + 1}
                              </div>
                            </div>

                            {/* Station ID */}
                            <div className="col-span-2 flex items-center gap-2">
                              <div 
                                className={`w-3 h-3 rounded-full ${
                                  isSummit 
                                    ? 'bg-yellow-400' 
                                    : isRanchBrook 
                                      ? 'bg-red-500' 
                                      : 'bg-blue-500'
                                }`}
                              ></div>
                              <div className="font-semibold text-sm text-gray-900">
                                {isSummit ? 'SUMMIT' : site.shortName}
                              </div>
                            </div>

                            {/* Location */}
                            <div className="col-span-3 flex flex-col">
                              <div className="text-sm text-gray-900">{site.name}</div>
                              <div className="text-xs text-gray-500">
                                {site.latitude.toFixed(4)}°N, {site.longitude.toFixed(4)}°W
                              </div>
                            </div>

                            {/* Elevation */}
                            <div className="col-span-2 flex flex-col">
                              <div className="text-sm font-bold text-gray-900">{site.elevation}m</div>
                              <div className="text-xs text-gray-500">{ecosystemZone} Zone</div>
                            </div>

                            {/* Network Type */}
                            <div className="col-span-2 flex items-center">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  isRanchBrook 
                                    ? 'text-red-700 border-red-300 bg-red-50' 
                                    : 'text-blue-700 border-blue-300 bg-blue-50'
                                }`}
                              >
                                {isRanchBrook ? 'Ranch Brook' : 'Distributed'}
                              </Badge>
                            </div>

                            {/* Status */}
                            <div className="col-span-2 flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                              <span className="text-xs text-green-600 font-medium">Active</span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Research Applications */}
            <Card className="data-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Scientific Research Applications
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Key research applications enabled by the Summit 2 Shore monitoring network
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-3 p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2">
                      <Mountain className="h-5 w-5 text-red-600" />
                      <h4 className="font-semibold text-red-800">Climate Gradients</h4>
                    </div>
                    <p className="text-sm text-red-700">
                      Quantifying temperature and precipitation lapse rates across Vermont elevational gradients
                    </p>
                    <ul className="text-xs text-red-600 space-y-1">
                      <li>• Orographic precipitation modeling</li>
                      <li>• Temperature inversion analysis</li>
                      <li>• Microclimate characterization</li>
                    </ul>
                  </div>

                  <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 text-blue-600">❄️</div>
                      <h4 className="font-semibold text-blue-800">Snow Hydrology</h4>
                    </div>
                    <p className="text-sm text-blue-700">
                      Understanding snowpack dynamics and hydrological processes across elevation zones
                    </p>
                    <ul className="text-xs text-blue-600 space-y-1">
                      <li>• Snow water equivalent tracking</li>
                      <li>• Ablation timing patterns</li>
                      <li>• Watershed discharge modeling</li>
                    </ul>
                  </div>

                  <div className="space-y-3 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 text-green-600">🌿</div>
                      <h4 className="font-semibold text-green-800">Ecosystem Response</h4>
                    </div>
                    <p className="text-sm text-green-700">
                      Monitoring climate change impacts on Vermont forest and alpine ecosystems
                    </p>
                    <ul className="text-xs text-green-600 space-y-1">
                      <li>• Species range migration</li>
                      <li>• Phenological shifts</li>
                      <li>• Alpine ecosystem vulnerability</li>
                    </ul>
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