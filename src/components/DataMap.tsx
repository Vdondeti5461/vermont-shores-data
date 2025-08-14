import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Eye, Activity, Mountain } from 'lucide-react';
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

        {/* Network Overview Header */}
        <div className="mb-8 text-center">
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-700">{networkSites.filter(s => s.type === 'ranch_brook').length}</div>
                <div className="text-sm text-red-600">Ranch Brook Sites</div>
                <div className="text-xs text-muted-foreground">Mount Mansfield Transect</div>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-700">{networkSites.filter(s => s.type === 'distributed').length}</div>
                <div className="text-sm text-blue-600">Distributed Sites</div>
                <div className="text-xs text-muted-foreground">Regional Network</div>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-700">{networkSites.length}</div>
                <div className="text-sm text-green-600">Total Sites</div>
                <div className="text-xs text-muted-foreground">47m - 1163m elevation</div>
              </CardContent>
            </Card>
          </div>
        </div>
          
        {/* Interactive Network Map */}
        <Card className="data-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Summit 2 Shore Observatory Network
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              22 monitoring sites across Vermont's elevational gradients - Click sites for details
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[700px] bg-gradient-to-br from-green-50 to-blue-50 rounded-lg relative overflow-hidden border">
              
              {/* Vermont State Outline */}
              <svg viewBox="0 0 400 500" className="absolute inset-0 w-full h-full opacity-30">
                <path 
                  d="M50 60 L350 60 L340 140 L320 220 L300 300 L280 380 L260 460 L80 470 L60 390 L40 310 L30 230 L20 150 Z" 
                  fill="currentColor" 
                  className="text-green-200"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>

              {/* Site Markers */}
              {networkSites.map((site) => {
                // Convert coordinates to map position (rough approximation for Vermont)
                const mapX = ((site.longitude + 73.5) * 800) + 50; // Adjust longitude scaling
                const mapY = ((44.8 - site.latitude) * 900) + 50; // Adjust latitude scaling
                
                return (
                  <div
                    key={site.id}
                    className={`absolute ${getElevationSize(site.elevation)} rounded-full border-2 border-white shadow-lg cursor-pointer transform hover:scale-150 transition-all duration-300 hover:z-50 group`}
                    style={{
                      backgroundColor: getElevationColor(site.elevation, site.type),
                      left: `${Math.max(5, Math.min(95, (mapX / 400) * 100))}%`,
                      top: `${Math.max(5, Math.min(95, (mapY / 500) * 100))}%`,
                      boxShadow: `0 0 0 2px rgba(255,255,255,0.9), 0 2px 8px rgba(0,0,0,0.3)`
                    }}
                  >
                    {/* Site Info Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-50">
                      <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3 border shadow-lg whitespace-nowrap">
                        <div className="font-bold text-sm">{site.shortName}</div>
                        <div className="text-xs text-muted-foreground">{site.name}</div>
                        <div className="text-xs mt-1">
                          <div>Elevation: {site.elevation}m</div>
                          <div>Lat: {site.latitude.toFixed(4)}°N</div>
                          <div>Lng: {site.longitude.toFixed(4)}°W</div>
                        </div>
                        <div className="text-xs mt-1">
                          <Badge 
                            variant="outline" 
                            className={site.type === 'ranch_brook' ? 'text-red-700 border-red-300' : 'text-blue-700 border-blue-300'}
                          >
                            {site.type === 'ranch_brook' ? 'Ranch Brook' : 'Distributed'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 border shadow-lg">
                <h4 className="font-semibold mb-3 text-gray-800">Network Legend</h4>
                
                {/* Site Types */}
                <div className="space-y-3 mb-4">
                  <div className="text-sm font-medium text-gray-700">Site Types:</div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-4 h-4 rounded-full bg-red-600 border border-white"></div>
                    <span>Ranch Brook (Mount Mansfield)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-4 h-4 rounded-full bg-blue-600 border border-white"></div>
                    <span>Distributed Sites</span>
                  </div>
                </div>
                
                {/* Elevation Scale */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">Elevation:</div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full bg-green-500 border border-white"></div>
                    <span>&lt; 200m (Valley)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-4 h-4 rounded-full bg-blue-500 border border-white"></div>
                    <span>200-500m (Mid)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-5 h-5 rounded-full bg-purple-500 border border-white"></div>
                    <span>&gt; 500m (High)</span>
                  </div>
                </div>
              </div>

              {/* Mount Mansfield Highlight */}
              <div className="absolute top-1/3 right-1/4 bg-red-100/80 border border-red-300 rounded-lg p-2 text-xs">
                <div className="font-semibold text-red-800">Mount Mansfield</div>
                <div className="text-red-600">13 Ranch Brook Sites</div>
                <div className="text-red-500">324m - 1163m</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Site Directory */}
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Ranch Brook Sites */}
          <Card className="data-card border-red-200">
            <CardHeader className="bg-red-50">
              <CardTitle className="text-red-800 flex items-center gap-2">
                <Mountain className="h-5 w-5" />
                Ranch Brook Transect
              </CardTitle>
              <p className="text-sm text-red-600">Mount Mansfield elevational gradient</p>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {networkSites
                  .filter(site => site.type === 'ranch_brook')
                  .sort((a, b) => a.elevation - b.elevation)
                  .map((site) => (
                    <div key={site.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100 hover:bg-red-100 transition-colors">
                      <div>
                        <div className="font-semibold text-sm">{site.shortName}</div>
                        <div className="text-xs text-muted-foreground">{site.name}</div>
                        <div className="text-xs text-red-600 mt-1">
                          {site.latitude.toFixed(4)}°N, {site.longitude.toFixed(4)}°W
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg text-red-700">{site.elevation}m</div>
                        <div 
                          className="w-4 h-4 rounded-full border border-white mx-auto mt-1"
                          style={{ backgroundColor: getElevationColor(site.elevation, site.type) }}
                        ></div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Distributed Sites */}
          <Card className="data-card border-blue-200">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-blue-800 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Distributed Network
              </CardTitle>
              <p className="text-sm text-blue-600">Regional monitoring stations</p>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {networkSites
                  .filter(site => site.type === 'distributed')
                  .sort((a, b) => a.elevation - b.elevation)
                  .map((site) => (
                    <div key={site.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors">
                      <div>
                        <div className="font-semibold text-sm">{site.shortName}</div>
                        <div className="text-xs text-muted-foreground">{site.name}</div>
                        <div className="text-xs text-blue-600 mt-1">
                          {site.latitude.toFixed(4)}°N, {site.longitude.toFixed(4)}°W
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg text-blue-700">{site.elevation}m</div>
                        <div 
                          className="w-4 h-4 rounded-full border border-white mx-auto mt-1"
                          style={{ backgroundColor: getElevationColor(site.elevation, site.type) }}
                        ></div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default DataMap;