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
            {/* Hero Mountain Profile */}
            <Card className="data-card bg-gradient-to-b from-sky-100 via-blue-50 to-green-50 border-none overflow-hidden">
              <CardContent className="p-0">
                <div className="relative h-80 flex items-end justify-center overflow-hidden">
                  {/* Mountain silhouette background */}
                  <div className="absolute inset-0 bg-gradient-to-t from-green-200/30 via-blue-200/20 to-sky-300/40"></div>
                  
                  {/* Site markers on mountain profile */}
                  <div className="relative w-full h-full flex items-end justify-center">
                    {networkSites
                      .sort((a, b) => a.elevation - b.elevation)
                      .map((site, index) => {
                        const heightPercent = ((site.elevation - 47) / (1163 - 47)) * 70 + 10;
                        const isSubmit = site.shortName === "RB-13";
                        const isRanchBrook = site.type === 'ranch_brook';
                        
                        return (
                          <div
                            key={site.id}
                            className="absolute group cursor-pointer transition-all duration-500 hover:scale-125"
                            style={{ 
                              bottom: `${heightPercent}%`,
                              left: `${15 + (index * 3.2)}%`,
                              zIndex: isSubmit ? 50 : 10
                            }}
                          >
                            {/* Site marker */}
                            <div className={`relative ${isSubmit ? 'animate-pulse' : ''}`}>
                              <div 
                                className={`w-6 h-6 rounded-full border-4 border-white shadow-lg transition-all duration-300 ${
                                  isSubmit 
                                    ? 'bg-yellow-400 shadow-yellow-400/50 w-8 h-8' 
                                    : isRanchBrook 
                                      ? 'bg-red-500' 
                                      : 'bg-blue-500'
                                }`}
                              ></div>
                              
                              {/* Summit crown */}
                              {isSubmit && (
                                <div className="absolute -top-2 -left-1 text-yellow-500 text-xl">👑</div>
                              )}
                              
                              {/* Site info tooltip */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                                <div className="bg-white rounded-lg shadow-xl p-3 min-w-48 border">
                                  <div className="text-center">
                                    <div className={`font-bold text-lg ${
                                      isSubmit ? 'text-yellow-600' : isRanchBrook ? 'text-red-600' : 'text-blue-600'
                                    }`}>
                                      {isSubmit ? '🏔️ SUMMIT' : site.shortName}
                                    </div>
                                    <div className="text-sm text-gray-600">{site.name}</div>
                                    <div className="text-xl font-bold text-gray-800 mt-1">{site.elevation}m</div>
                                    <div className="text-xs text-gray-500">
                                      {site.latitude.toFixed(4)}°N, {site.longitude.toFixed(4)}°W
                                    </div>
                                    <div className={`inline-block px-2 py-1 rounded-full text-xs mt-2 ${
                                      isRanchBrook 
                                        ? 'bg-red-100 text-red-700' 
                                        : 'bg-blue-100 text-blue-700'
                                    }`}>
                                      {isRanchBrook ? 'Ranch Brook' : 'Distributed'}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                  
                  {/* Elevation labels */}
                  <div className="absolute left-4 top-4 text-right">
                    <div className="text-2xl font-bold text-gray-700">1163m</div>
                    <div className="text-sm text-gray-500">🏔️ Summit</div>
                  </div>
                  <div className="absolute left-4 bottom-4 text-right">
                    <div className="text-lg font-bold text-gray-700">47m</div>
                    <div className="text-sm text-gray-500">🌊 Valley</div>
                  </div>
                  
                  {/* Network title overlay */}
                  <div className="absolute top-6 right-6 text-right">
                    <h3 className="text-2xl font-bold text-gray-800">Summit 2 Shore</h3>
                    <p className="text-sm text-gray-600">Environmental Monitoring Network</p>
                    <div className="flex gap-2 mt-2 justify-end">
                      <Badge className="bg-red-500">
                        {networkSites.filter(s => s.type === 'ranch_brook').length} RB Sites
                      </Badge>
                      <Badge className="bg-blue-500">
                        {networkSites.filter(s => s.type === 'distributed').length} Distributed
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interactive Network Explorer */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Summit Spotlight */}
              <Card className="lg:col-span-1 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
                <CardHeader className="text-center">
                  <div className="text-4xl mb-2">🏔️</div>
                  <CardTitle className="text-yellow-800">Mount Mansfield Summit</CardTitle>
                  <p className="text-sm text-yellow-600">Highest Monitoring Station</p>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  {(() => {
                    const summitSite = networkSites.find(s => s.shortName === "RB-13");
                    return summitSite ? (
                      <div className="space-y-3">
                        <div className="text-4xl font-bold text-yellow-700">{summitSite.elevation}m</div>
                        <div className="text-sm text-yellow-600">Above Sea Level</div>
                        <div className="bg-yellow-100 rounded-lg p-3">
                          <div className="text-sm font-medium text-yellow-800">Alpine Environment</div>
                          <div className="text-xs text-yellow-600 mt-1">
                            Extreme weather conditions, snow-dominated
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          📍 {summitSite.latitude.toFixed(4)}°N, {summitSite.longitude.toFixed(4)}°W
                        </div>
                      </div>
                    ) : null;
                  })()}
                </CardContent>
              </Card>

              {/* Live Network Status */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    Live Network Status
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Real-time monitoring across elevation zones</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{networkSites.length}</div>
                      <div className="text-sm text-green-700">Active Sites</div>
                      <div className="text-xs text-gray-500">🟢 Online</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">24/7</div>
                      <div className="text-sm text-blue-700">Monitoring</div>
                      <div className="text-xs text-gray-500">⏰ Continuous</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">1116m</div>
                      <div className="text-sm text-purple-700">Range</div>
                      <div className="text-xs text-gray-500">📏 Elevation</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">Vermont</div>
                      <div className="text-sm text-orange-700">Statewide</div>
                      <div className="text-xs text-gray-500">🗺️ Coverage</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Elevation Zones */}
            <Card className="data-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mountain className="h-5 w-5 text-primary" />
                  Monitoring Zones by Elevation
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Sites organized by ecological and climatic zones
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    {
                      zone: "Alpine Zone",
                      range: "800m - 1163m",
                      emoji: "🏔️",
                      color: "from-red-500 to-red-600",
                      bgColor: "bg-red-50",
                      borderColor: "border-red-200",
                      textColor: "text-red-700",
                      sites: networkSites.filter(s => s.elevation >= 800)
                    },
                    {
                      zone: "Montane Zone", 
                      range: "500m - 799m",
                      emoji: "🌲",
                      color: "from-orange-500 to-orange-600",
                      bgColor: "bg-orange-50", 
                      borderColor: "border-orange-200",
                      textColor: "text-orange-700",
                      sites: networkSites.filter(s => s.elevation >= 500 && s.elevation < 800)
                    },
                    {
                      zone: "Valley Zone",
                      range: "47m - 499m", 
                      emoji: "🌿",
                      color: "from-green-500 to-green-600",
                      bgColor: "bg-green-50",
                      borderColor: "border-green-200", 
                      textColor: "text-green-700",
                      sites: networkSites.filter(s => s.elevation < 500)
                    }
                  ].map((zone, zoneIndex) => (
                    <div key={zone.zone} className={`rounded-lg border ${zone.borderColor} ${zone.bgColor} p-4`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{zone.emoji}</span>
                          <div>
                            <h4 className={`font-bold ${zone.textColor}`}>{zone.zone}</h4>
                            <p className="text-sm text-gray-600">{zone.range} • {zone.sites.length} sites</p>
                          </div>
                        </div>
                        <div className={`px-3 py-1 bg-gradient-to-r ${zone.color} text-white rounded-full text-sm font-medium`}>
                          {zone.sites.length} Sites
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {zone.sites
                          .sort((a, b) => b.elevation - a.elevation)
                          .map((site) => (
                            <div 
                              key={site.id} 
                              className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div 
                                    className={`w-3 h-3 rounded-full ${
                                      site.shortName === "RB-13" 
                                        ? 'bg-yellow-400 animate-pulse' 
                                        : site.type === 'ranch_brook' 
                                          ? 'bg-red-500' 
                                          : 'bg-blue-500'
                                    }`}
                                  ></div>
                                  <div>
                                    <div className="font-medium text-sm">
                                      {site.shortName === "RB-13" ? "🏔️ SUMMIT" : site.shortName}
                                    </div>
                                    <div className="text-xs text-gray-500">{site.name}</div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-sm">{site.elevation}m</div>
                                  <div className="text-xs text-gray-400">
                                    {site.type === 'ranch_brook' ? 'RB' : 'DIST'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
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