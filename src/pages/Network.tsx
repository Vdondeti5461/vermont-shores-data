import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DataMap from '@/components/DataMap';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MapPin, Thermometer, Wind, CloudSnow, Droplets, Activity, CheckCircle, AlertCircle } from 'lucide-react';
import { getSiteColorByCode } from '@/lib/siteColors';

const Network = () => {
  const monitoringTypes = [
    {
      id: 'core',
      name: 'Core Environmental Data',
      icon: Thermometer,
      description: 'Air/soil temperature, humidity, snow depth, radiation, soil moisture and heat flux',
      count: 22,
      color: 'text-red-500'
    },
    {
      id: 'wind',
      name: 'Wind Monitoring',
      icon: Wind,
      description: 'Wind speed, direction, gusts, and vector averages',
      count: 22,
      color: 'text-blue-500'
    },
    {
      id: 'snow',
      name: 'Snowpack Analysis',
      icon: CloudSnow,
      description: 'Snow depth, water equivalent, density, ice and water content, temperature profiles',
      count: 22,
      color: 'text-cyan-500'
    },
    {
      id: 'precipitation',
      name: 'Precipitation',
      icon: Droplets,
      description: 'Real-time and NRT precipitation intensity and accumulation',
      count: 22,
      color: 'text-blue-600'
    }
  ];

  // Survey-verified location data - exact 22 locations from spreadsheet with accurate coordinates
  const locationData = [
    { code: 'SUMM', name: 'Mansfield Summit', lat: 44.52796261, lng: -72.81496117, elev: 1168.568, region: 'Alpine', status: 'active' },
    { code: 'RB01', name: 'Ranch Brook #1', lat: 44.52322238, lng: -72.80863215, elev: 1075.002, region: 'Ranch Brook', status: 'active' },
    { code: 'RB02', name: 'Ranch Brook #2', lat: 44.51775982, lng: -72.81039188, elev: 910.188, region: 'Ranch Brook', status: 'active' },
    { code: 'RB12', name: 'Ranch Brook #12', lat: 44.51880228, lng: -72.79785548, elev: 884.151, region: 'Ranch Brook', status: 'active' },
    { code: 'RB09', name: 'Ranch Brook #9', lat: 44.48905, lng: -72.79285, elev: 847, region: 'Ranch Brook', status: 'active' },
    { code: 'RB03', name: 'Ranch Brook #3', lat: 44.51481829, lng: -72.80905263, elev: 794.901, region: 'Ranch Brook', status: 'active' },
    { code: 'UNDR', name: 'Mansfield West SCAN', lat: 44.53511455, lng: -72.83462236, elev: 698.292, region: 'Mansfield West', status: 'active' },
    { code: 'RB04', name: 'Ranch Brook #4', lat: 44.51097861, lng: -72.80281519, elev: 639.716, region: 'Ranch Brook', status: 'active' },
    { code: 'RB10', name: 'Ranch Brook #10', lat: 44.49505, lng: -72.78639, elev: 624, region: 'Ranch Brook', status: 'active' },
    { code: 'RB07', name: 'Ranch Brook #7', lat: 44.51528492, lng: -72.78513705, elev: 613.31, region: 'Ranch Brook', status: 'active' },
    { code: 'SR01', name: 'Sleepers R3/Main', lat: 44.48296257, lng: -72.16464901, elev: 552.866, region: 'Sleepers', status: 'active' },
    { code: 'RB05', name: 'Ranch Brook #5', lat: 44.5044967, lng: -72.79947434, elev: 505.38, region: 'Ranch Brook', status: 'active' },
    { code: 'RB08', name: 'Ranch Brook #8', lat: 44.50953955, lng: -72.78220384, elev: 471.51, region: 'Ranch Brook', status: 'active' },
    { code: 'PROC', name: 'Mansfield West Proctor', lat: 44.5285819, lng: -72.866737, elev: 418.212, region: 'Mansfield West', status: 'active' },
    { code: 'RB06', name: 'Ranch Brook #6', lat: 44.50370289, lng: -72.78352521, elev: 414.489, region: 'Ranch Brook', status: 'active' },
    { code: 'RB11', name: 'Ranch Brook #11', lat: 44.50545202, lng: -72.7713791, elev: 388.039, region: 'Ranch Brook', status: 'active' },
    { code: 'SR25', name: 'Sleepers R25', lat: 44.47682346, lng: -72.12589909, elev: 356.653, region: 'Sleepers', status: 'active' },
    { code: 'SI11', name: 'Sleepers W1/R11', lat: 44.45002119, lng: -72.06714939, elev: 225.481, region: 'Sleepers', status: 'active' },
    { code: 'JRCL', name: 'Jericho Clearing', lat: 44.447694, lng: -73.00228357, elev: 199, region: 'Jericho', status: 'active' },
    { code: 'JRFO', name: 'Jericho Forest', lat: 44.44780437, lng: -73.00270872, elev: 196, region: 'Jericho', status: 'active' },
    { code: 'SPST', name: 'Spear St', lat: 44.45258109, lng: -73.19181715, elev: 87.108, region: 'Urban', status: 'active' },
    { code: 'PTSH', name: 'Potash Brook', lat: 44.44489861, lng: -73.21425398, elev: 44.711, region: 'Urban', status: 'active' }
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
                              <TableCell className="font-mono font-medium">
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-3 h-3 rounded-full border border-white shadow-sm flex-shrink-0"
                                    style={{ backgroundColor: getSiteColorByCode(station.code) }}
                                  />
                                  {station.code}
                                </div>
                              </TableCell>
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

                {/* Station Visual Overview */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      All Monitoring Stations
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Each station has a unique color identifier used across all views
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {locationData.map((station) => (
                        <div 
                          key={station.code}
                          className="flex items-center gap-2 p-2 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                        >
                          <div 
                            className="w-4 h-4 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                            style={{ backgroundColor: getSiteColorByCode(station.code) }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="font-mono text-xs font-semibold truncate">{station.code}</div>
                            <div className="text-[10px] text-muted-foreground truncate">{station.elev}m</div>
                          </div>
                          {station.status === 'active' ? (
                            <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                          ) : (
                            <AlertCircle className="h-3 w-3 text-yellow-600 flex-shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Network Coverage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                         <div className="flex justify-between items-center">
                           <span className="text-sm text-muted-foreground">Elevation Range</span>
                           <span className="font-medium">47m - 1,163m</span>
                         </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Regions Covered</span>
                          <span className="font-medium">2 regions (Ranch Brook + Distributed)</span>
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
                          <span className="font-medium">10 minutes</span>
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
                    <li>• 10-minute measurement intervals</li>
                    <li>• Real-time data transmission</li>
                    <li>• Multi-tier quality assurance (Raw → Clean → QAQC → Seasonal)</li>
                    <li>• Automated backup and archival systems</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Instrumentation</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Campbell Scientific CR1000X/CR6 dataloggers</li>
                    <li>• Research-grade environmental sensors</li>
                    <li>• Solar power with battery backup</li>
                    <li>• Cellular telemetry for real-time data</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Coverage Area</CardTitle>
                </CardHeader>
                <CardContent>
                   <ul className="space-y-2 text-sm text-muted-foreground">
                     <li>• Elevation range: 47-1,163m (154-3,816 ft)</li>
                     <li>• Alpine to lakeshore transects</li>
                     <li>• Multiple land cover types</li>
                     <li>• Ranch Brook intensive study area</li>
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