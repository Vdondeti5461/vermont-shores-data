import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Thermometer, Droplets, Wind, Eye } from 'lucide-react';

const DataMap = () => {
  // Sample data for Vermont monitoring sites
  const monitoringSites = [
    { id: 1, name: 'Mount Mansfield Summit', lat: 44.5434, lon: -72.8148, elevation: 4393, status: 'active', temp: 12.3, humidity: 78 },
    { id: 2, name: 'Burlington Lakefront', lat: 44.4759, lon: -73.2121, elevation: 200, status: 'active', temp: 18.7, humidity: 65 },
    { id: 3, name: 'Green Mountain Forest', lat: 44.1367, lon: -72.8092, elevation: 2850, status: 'active', temp: 15.2, humidity: 82 },
    { id: 4, name: 'Champlain Valley', lat: 44.3106, lon: -73.1817, elevation: 320, status: 'active', temp: 19.1, humidity: 62 },
    { id: 5, name: 'Northeast Kingdom', lat: 44.8042, lon: -71.9956, elevation: 1650, status: 'maintenance', temp: 14.8, humidity: 74 },
    { id: 6, name: 'Connecticut River Valley', lat: 43.9108, lon: -72.2791, elevation: 450, status: 'active', temp: 17.9, humidity: 68 }
  ];

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
                    
                    {/* Sample monitoring points */}
                    {monitoringSites.slice(0, 6).map((site, index) => (
                      <div
                        key={site.id}
                        className="absolute w-4 h-4 rounded-full border-2 border-white shadow-lg cursor-pointer transform hover:scale-125 transition-transform"
                        style={{
                          backgroundColor: site.status === 'active' ? '#22c55e' : '#f59e0b',
                          left: `${20 + (index % 3) * 25}%`,
                          top: `${20 + Math.floor(index / 3) * 30}%`
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
                    <span className="text-sm">Active Sites</span>
                    <Badge className="bg-success text-success-foreground">18/22</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Maintenance</span>
                    <Badge className="bg-warning text-warning-foreground">3/22</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Offline</span>
                    <Badge className="bg-destructive text-destructive-foreground">1/22</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Recent Site Data</h3>
              {monitoringSites.slice(0, 4).map((site) => (
                <Card key={site.id} className="data-card">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{site.name}</h4>
                      <Badge className={getStatusColor(site.status)}>
                        {site.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mb-3">
                      Elevation: {site.elevation}ft
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center gap-1">
                        <Thermometer className="h-3 w-3 text-primary" />
                        <span>{site.temp}°C</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Droplets className="h-3 w-3 text-accent" />
                        <span>{site.humidity}%</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-3 text-xs">
                      <Eye className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DataMap;