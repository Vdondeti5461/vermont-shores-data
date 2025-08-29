import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DataMap from '@/components/DataMap';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MapPin, Thermometer, Wind, CloudSnow, Droplets, Activity, CheckCircle, AlertCircle } from 'lucide-react';

const Network = () => {
  const monitoringTypes = [
    {
      id: 'temperature',
      name: 'Temperature & Humidity',
      icon: Thermometer,
      description: 'Air and soil temperature, relative humidity measurements',
      count: 22,
      color: 'text-red-500'
    },
    {
      id: 'wind',
      name: 'Wind Monitoring',
      icon: Wind,
      description: 'Wind speed, direction, and gust measurements',
      count: 18,
      color: 'text-blue-500'
    },
    {
      id: 'snow',
      name: 'Snow & Ice',
      icon: CloudSnow,
      description: 'Snow depth, water equivalent, ice content',
      count: 20,
      color: 'text-cyan-500'
    },
    {
      id: 'precipitation',
      name: 'Precipitation',
      icon: Droplets,
      description: 'Rainfall, snowfall, and accumulation data',
      count: 16,
      color: 'text-blue-600'
    }
  ];

  // Survey-verified location data with precise coordinates and elevations
  const locationData = [
    { code: 'RB01', name: 'Mansfield East Ranch Brook 1', lat: 44.5232, lng: -72.8086, elev: 1075, region: 'Mansfield East', status: 'active' },
    { code: 'RB02', name: 'Mansfield East Ranch Brook 2', lat: 44.5178, lng: -72.8104, elev: 910, region: 'Mansfield East', status: 'active' },
    { code: 'RB03', name: 'Mansfield East Ranch Brook 3', lat: 44.5148, lng: -72.8091, elev: 795, region: 'Mansfield East', status: 'active' },
    { code: 'RB04', name: 'Mansfield East Ranch Brook 4', lat: 44.5110, lng: -72.8028, elev: 640, region: 'Mansfield East', status: 'active' },
    { code: 'RB05', name: 'Mansfield East Ranch Brook 5', lat: 44.5045, lng: -72.7995, elev: 505, region: 'Mansfield East', status: 'active' },
    { code: 'RB06', name: 'Mansfield East Ranch Brook 6', lat: 44.5037, lng: -72.7835, elev: 414, region: 'Mansfield East', status: 'active' },
    { code: 'RB07', name: 'Mansfield East Ranch Brook 7', lat: 44.5153, lng: -72.7851, elev: 613, region: 'Mansfield East', status: 'active' },
    { code: 'RB08', name: 'Mansfield East Ranch Brook 8', lat: 44.5095, lng: -72.7021, elev: 472, region: 'Mansfield East', status: 'active' },
    { code: 'RB09', name: 'Mansfield East Ranch Brook 9', lat: 44.4891, lng: -72.7929, elev: 847, region: 'Mansfield East', status: 'active' },
    { code: 'RB10', name: 'Mansfield East Ranch Brook 10', lat: 44.4951, lng: -72.7864, elev: 624, region: 'Mansfield East', status: 'active' },
    { code: 'RB11', name: 'Mansfield East Ranch Brook 11', lat: 44.5055, lng: -72.7714, elev: 388, region: 'Mansfield East', status: 'active' },
    { code: 'RB12', name: 'Mansfield East FEMC', lat: 44.5188, lng: -72.7985, elev: 884, region: 'Mansfield East', status: 'active' },
    { code: 'SPST', name: 'Spear Street', lat: 44.4526, lng: -73.1918, elev: 87, region: 'Urban', status: 'active' },
    { code: 'SR01', name: 'Sleepers R3/Main', lat: 44.4830, lng: -72.1646, elev: 553, region: 'Sleepers River', status: 'active' },
    { code: 'SR11', name: 'Sleepers W1/R11', lat: 44.4500, lng: -72.0671, elev: 225, region: 'Sleepers River', status: 'active' },
    { code: 'SR25', name: 'Sleepers R25', lat: 44.4768, lng: -72.1258, elev: 357, region: 'Sleepers River', status: 'maintenance' },
    { code: 'JRCL', name: 'Jericho clearing', lat: 44.4479, lng: -73.0023, elev: 199, region: 'Jericho', status: 'active' },
    { code: 'JRFO', name: 'Jericho Forest', lat: 44.4478, lng: -73.0027, elev: 196, region: 'Jericho', status: 'active' },
    { code: 'PROC', name: 'Mansfield West Proctor', lat: 44.5286, lng: -72.8867, elev: 418, region: 'Mansfield West', status: 'active' },
    { code: 'PTSH', name: 'Potash Brook', lat: 44.4449, lng: -73.2143, elev: 45, region: 'Urban', status: 'active' },
    { code: 'SUMM', name: 'Mansfield SUMMIT', lat: 44.5280, lng: -72.8150, elev: 1169, region: 'Mansfield West', status: 'active' },
    { code: 'UNDR', name: 'Mansfield West SCAN', lat: 44.5351, lng: -72.8346, elev: 698, region: 'Mansfield West', status: 'maintenance' }
  ];

  const activeStations = locationData.filter(station => station.status === 'active').length;
  const maintenanceStations = locationData.filter(station => station.status === 'maintenance').length;

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
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Station Directory
                      <Badge variant="secondary">{locationData.length} Total Stations</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Station Name</TableHead>
                            <TableHead>Region</TableHead>
                            <TableHead>Elevation (m)</TableHead>
                            <TableHead>Coordinates</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {locationData.map((station) => (
                            <TableRow key={station.code}>
                              <TableCell className="font-mono font-medium">{station.code}</TableCell>
                              <TableCell>{station.name}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{station.region}</Badge>
                              </TableCell>
                              <TableCell>{station.elev}m</TableCell>
                              <TableCell className="font-mono text-sm">
                                {station.lat.toFixed(4)}, {station.lng.toFixed(4)}
                              </TableCell>
                              <TableCell>
                                {station.status === 'active' ? (
                                  <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-200">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Active
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Maintenance
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="status" className="space-y-4">
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        Active Stations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-600">{activeStations}</div>
                      <p className="text-sm text-muted-foreground">Currently operational</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-yellow-600">
                        <AlertCircle className="h-5 w-5" />
                        Maintenance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-yellow-600">{maintenanceStations}</div>
                      <p className="text-sm text-muted-foreground">Under maintenance</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-primary">
                        <Activity className="h-5 w-5" />
                        Total Network
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-primary">{locationData.length}</div>
                      <p className="text-sm text-muted-foreground">Total monitoring stations</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Network Coverage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                         <div className="flex justify-between items-center">
                           <span className="text-sm text-muted-foreground">Elevation Range</span>
                           <span className="font-medium">45m - 1,169m</span>
                         </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Regions Covered</span>
                          <span className="font-medium">6 regions</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Data Streams</span>
                          <span className="font-medium">4 primary tables</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Data Collection Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Collection Interval</span>
                          <span className="font-medium">15 minutes</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Data Quality</span>
                          <span className="font-medium text-green-600">Excellent</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Uptime</span>
                          <span className="font-medium">{((activeStations / locationData.length) * 100).toFixed(1)}%</span>
                        </div>
                      </div>
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
                     <li>• Elevation range: 45-1,169m</li>
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