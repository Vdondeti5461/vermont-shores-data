import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DataMap from '@/components/DataMap';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Thermometer, Wind, CloudSnow, Droplets } from 'lucide-react';

const Network = () => {
  const monitoringTypes = [
    {
      id: 'temperature',
      name: 'Temperature & Humidity',
      icon: Thermometer,
      description: 'Air and soil temperature, relative humidity measurements',
      count: 15,
      color: 'text-red-500'
    },
    {
      id: 'wind',
      name: 'Wind Monitoring',
      icon: Wind,
      description: 'Wind speed, direction, and gust measurements',
      count: 12,
      color: 'text-blue-500'
    },
    {
      id: 'snow',
      name: 'Snow & Ice',
      icon: CloudSnow,
      description: 'Snow depth, water equivalent, ice content',
      count: 8,
      color: 'text-cyan-500'
    },
    {
      id: 'precipitation',
      name: 'Precipitation',
      icon: Droplets,
      description: 'Rainfall, snowfall, and accumulation data',
      count: 10,
      color: 'text-blue-600'
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">
                <MapPin className="w-4 h-4 mr-2" />
                Monitoring Network
              </Badge>
              <h1 className="scientific-heading text-4xl md:text-6xl mb-6">
                Vermont's <span className="text-primary">Environmental</span>
                <br />Monitoring Network
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                A comprehensive network of automated monitoring stations collecting real-time environmental data 
                across Vermont's diverse landscapes, from mountain peaks to lake shores.
              </p>
            </div>
          </div>
        </section>

        {/* Network Overview */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {monitoringTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <Card key={type.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Icon className={`h-8 w-8 ${type.color}`} />
                        <Badge variant="secondary">{type.count} stations</Badge>
                      </div>
                      <CardTitle className="text-lg">{type.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Interactive Map Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">
                Interactive Map
              </Badge>
              <h2 className="scientific-heading text-3xl md:text-4xl mb-6">
                Explore <span className="text-primary">Station Locations</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Click on any station marker to view real-time data, historical trends, and station details
              </p>
            </div>

            <Tabs defaultValue="map" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="map">Interactive Map</TabsTrigger>
                <TabsTrigger value="list">Station List</TabsTrigger>
                <TabsTrigger value="status">Network Status</TabsTrigger>
              </TabsList>

              <TabsContent value="map" className="space-y-4">
                <DataMap />
              </TabsContent>

              <TabsContent value="list" className="space-y-4">
                <div className="grid gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Station Directory</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Comprehensive list of all monitoring stations with detailed information, 
                        coordinates, and operational status.
                      </p>
                      {/* Station list would go here */}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="status" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-green-600">Active Stations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-600">42</div>
                      <p className="text-sm text-muted-foreground">Currently operational</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-yellow-600">Maintenance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-yellow-600">3</div>
                      <p className="text-sm text-muted-foreground">Under maintenance</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Technical Specifications */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">
                Technical Details
              </Badge>
              <h2 className="scientific-heading text-3xl md:text-4xl mb-6">
                Network <span className="text-primary">Specifications</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Data Collection</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• 15-minute measurement intervals</li>
                    <li>• Real-time data transmission</li>
                    <li>• Quality assurance protocols</li>
                    <li>• Automated backup systems</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Instrumentation</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Campbell Scientific dataloggers</li>
                    <li>• Research-grade sensors</li>
                    <li>• Solar power systems</li>
                    <li>• Cellular communication</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Coverage Area</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Elevation range: 100-1,500m</li>
                    <li>• Multiple climate zones</li>
                    <li>• Lake and mountain sites</li>
                    <li>• Urban and forest locations</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Network;