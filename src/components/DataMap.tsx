import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Thermometer, Droplets, Wind, Eye, AlertCircle } from 'lucide-react';
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success text-success-foreground';
      case 'maintenance': return 'bg-warning text-warning-foreground';
      case 'offline': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <section id="map" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Interactive Data Visualization
          </Badge>
          <h2 className="scientific-heading text-4xl md:text-5xl mb-6">
            <span className="text-primary">Vermont</span> Monitoring Network
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Explore real-time environmental data from our 22 monitoring stations across Vermont. 
            Click on any location to view detailed measurements and historical trends.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Map Placeholder - Would integrate with actual mapping service */}
          <div className="lg:col-span-2">
            <Card className="data-card h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Vermont Monitoring Sites
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="map-container h-full bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center relative overflow-hidden">
                  {/* SVG Map Outline of Vermont */}
                  <div className="relative w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 300 400" className="w-80 h-96 opacity-20">
                      <path 
                        d="M50 50 L250 50 L240 120 L220 200 L200 280 L180 350 L80 360 L60 280 L40 200 L30 120 Z" 
                        fill="currentColor" 
                        className="text-primary"
                      />
                    </svg>
                    
                    {/* Real monitoring points */}
                    {locations.slice(0, 8).map((site, index) => (
                      <div
                        key={site.id}
                        className="absolute w-4 h-4 rounded-full border-2 border-white shadow-lg cursor-pointer transform hover:scale-125 transition-transform"
                        style={{
                          backgroundColor: site.status === 'active' ? '#22c55e' : site.status === 'maintenance' ? '#f59e0b' : '#ef4444',
                          left: `${15 + (index % 4) * 20}%`,
                          top: `${15 + Math.floor(index / 4) * 25}%`
                        }}
                        title={site.name}
                      />
                    ))}
                  </div>
                  
                  {/* Interactive Map Notice */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Card className="bg-background/80 backdrop-blur-sm border-primary/20">
                      <CardContent className="p-6 text-center">
                        <MapPin className="h-12 w-12 mx-auto mb-4 text-primary" />
                        <h3 className="font-semibold mb-2">Interactive Map Coming Soon</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Full interactive mapping with real-time data visualization
                        </p>
                        <Button size="sm" className="btn-research">
                          View Site Details
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Site Information Panel */}
          <div className="space-y-6">
            <Card className="data-card">
              <CardHeader>
                <CardTitle className="text-xl">Network Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Sites</span>
                    <Badge className="bg-primary text-primary-foreground">{locations.length}/22</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active Sites</span>
                    <Badge className="bg-success text-success-foreground">
                      {locations.filter(site => site.status === 'active').length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Maintenance</span>
                    <Badge className="bg-warning text-warning-foreground">
                      {locations.filter(site => site.status === 'maintenance').length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Offline</span>
                    <Badge className="bg-destructive text-destructive-foreground">
                      {locations.filter(site => site.status === 'offline').length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Recent Site Data</h3>
              {locationsLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Loading locations...</p>
                </div>
              ) : locationsError ? (
                <Card className="data-card border-destructive/20">
                  <CardContent className="p-4 text-center">
                    <AlertCircle className="h-6 w-6 mx-auto mb-2 text-destructive" />
                    <p className="text-sm text-destructive">Failed to load location data</p>
                  </CardContent>
                </Card>
              ) : (
                locations.slice(0, 4).map((site) => (
                  <Card key={site.id} className="data-card">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{site.name}</h4>
                        <Badge className={getStatusColor(site.status || 'active')}>
                          {site.status || 'active'}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mb-3">
                        Elevation: {site.elevation ? `${site.elevation}ft` : 'N/A'}
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-primary" />
                          <span>{site.latitude.toFixed(4)}°N</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-accent" />
                          <span>{site.longitude.toFixed(4)}°W</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full mt-3 text-xs">
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DataMap;