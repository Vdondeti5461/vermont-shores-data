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

  // Survey-verified location data - exact 22 locations from spreadsheet
  const locationData = [
    { code: 'SUMMIT', name: 'Mansfield Summit', lat: 44.5284, lng: -72.8147, elev: 1163, region: 'Alpine', status: 'active' },
    { code: 'RB-01', name: 'Site #1', lat: 44.5232, lng: -72.8087, elev: 1072, region: 'Ranch Brook', status: 'active' },
    { code: 'RB-02', name: 'Site #2', lat: 44.5178, lng: -72.8104, elev: 911, region: 'Ranch Brook', status: 'active' },
    { code: 'FEMC', name: 'FEMC', lat: 44.5189, lng: -72.7979, elev: 872, region: 'Distributed', status: 'active' },
    { code: 'RB-09', name: 'Site #9', lat: 44.4891, lng: -72.7928, elev: 846, region: 'Ranch Brook', status: 'active' },
    { code: 'RB-03', name: 'Site #3', lat: 44.5148, lng: -72.8091, elev: 795, region: 'Ranch Brook', status: 'active' },
    { code: 'RB-14', name: 'West SCAN', lat: 44.535, lng: -72.8346, elev: 705, region: 'Ranch Brook', status: 'active' },
    { code: 'RB-04', name: 'Site #4', lat: 44.511, lng: -72.8028, elev: 639, region: 'Ranch Brook', status: 'active' },
    { code: 'RB-07', name: 'Site #7', lat: 44.515, lng: -72.7854, elev: 613, region: 'Ranch Brook', status: 'active' },
    { code: 'SLP-R3', name: 'Sleepers R3/Main', lat: 44.483, lng: -72.1647, elev: 553, region: 'Distributed', status: 'active' },
    { code: 'RB-05', name: 'Site #5', lat: 44.5045, lng: -72.7994, elev: 507, region: 'Ranch Brook', status: 'active' },
    { code: 'RB-08', name: 'Site #8', lat: 44.5096, lng: -72.7824, elev: 472, region: 'Ranch Brook', status: 'active' },
    { code: 'PROC', name: 'Proctor Maple', lat: 44.5285, lng: -72.8667, elev: 422, region: 'Distributed', status: 'active' },
    { code: 'RB-06', name: 'Site #6', lat: 44.5037, lng: -72.7836, elev: 412, region: 'Ranch Brook', status: 'active' },
    { code: 'RB-11', name: 'Site #11', lat: 44.5055, lng: -72.7714, elev: 380, region: 'Ranch Brook', status: 'active' },
    { code: 'SLP-R25', name: 'Sleepers R25', lat: 44.4767, lng: -72.126, elev: 360, region: 'Distributed', status: 'active' },
    { code: 'RB-10', name: 'Site #10', lat: 44.495, lng: -72.7864, elev: 324, region: 'Ranch Brook', status: 'active' },
    { code: 'SLP-W1', name: 'Sleepers W1/R11', lat: 44.4999, lng: -72.0671, elev: 226, region: 'Distributed', status: 'active' },
    { code: 'JER-C', name: 'Jericho (Clearing)', lat: 44.4477, lng: -73.0025, elev: 198, region: 'Distributed', status: 'active' },
    { code: 'JER-F', name: 'Jericho (Forested)', lat: 44.4478, lng: -73.0027, elev: 196, region: 'Distributed', status: 'active' },
    { code: 'SPEAR', name: 'Spear St', lat: 44.4526, lng: -73.1919, elev: 86, region: 'Distributed', status: 'active' },
    { code: 'POTASH', name: 'Potash Brook', lat: 44.4448, lng: -73.2143, elev: 47, region: 'Distributed', status: 'active' }
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