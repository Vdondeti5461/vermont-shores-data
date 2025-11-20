import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Analytics } from '@/components/Analytics';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, LineChart, TrendingUp, GitCompare, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ApiDiagnostic } from '@/components/ApiDiagnostic';

const AnalyticsPage = () => {
  const databaseInfo = [
    {
      name: 'Raw Data Ingestion',
      description: 'Unprocessed sensor measurements from environmental monitoring stations',
      tables: ['Core Observations', 'Wind Data', 'Snowpack Temperature', 'Precipitation'],
      color: 'text-red-500'
    },
    {
      name: 'Clean Data',
      description: 'Validated and processed data with initial quality checks applied',
      tables: ['Core Observations', 'Wind Data', 'Snowpack Temperature', 'Precipitation'],
      color: 'text-blue-500'
    },
    {
      name: 'QAQC Data',
      description: 'Quality assured and quality controlled data ready for scientific analysis',
      tables: ['Core Observations', 'Wind Data', 'Snowpack Temperature', 'Precipitation'],
      color: 'text-green-500'
    },
    {
      name: 'Seasonal QAQC',
      description: 'Seasonally aggregated quality-controlled data (2022-2025)',
      tables: ['Season 2022-2023', 'Season 2023-2024', 'Season 2024-2025'],
      color: 'text-purple-500'
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
                <LineChart className="w-4 h-4 mr-2" />
                Environmental Data Analytics
              </Badge>
              <h1 className="scientific-heading text-4xl md:text-6xl mb-6">
                Time Series <span className="text-primary">Data Analysis</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Explore and compare environmental monitoring data across multiple quality levels. 
                Analyze raw sensor readings, cleaned datasets, and quality-controlled seasonal aggregations 
                from Vermont's Summit-to-Shore research network.
              </p>
            </div>

            {/* Database Overview */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {databaseInfo.map((db) => (
                <Card key={db.name} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className={`h-5 w-5 ${db.color}`} />
                      <CardTitle className="text-base">{db.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{db.description}</p>
                    <div className="space-y-1">
                      {db.tables.map((table) => (
                        <div key={table} className="text-xs text-muted-foreground flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-current"></span>
                          {table}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Navigation */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center pb-3">
                  <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                  <CardTitle className="text-lg">Real-Time Analysis</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Compare data quality levels across all observation tables
                  </p>
                  <Button asChild variant="outline" size="sm">
                    <a href="#analytics">Explore Below</a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center pb-3">
                  <Layers className="h-8 w-8 text-primary mx-auto mb-2" />
                  <CardTitle className="text-lg">Seasonal Analysis</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Three full seasons of quality-controlled environmental data
                  </p>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/analytics/seasonal">View Seasons</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center pb-3">
                  <GitCompare className="h-8 w-8 text-primary mx-auto mb-2" />
                  <CardTitle className="text-lg">Advanced Analytics</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Statistical analysis, trends, and predictive models
                  </p>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/analytics/advanced">Coming Soon</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Main Analytics Interface */}
        <section id="analytics" className="py-16">
          <div className="container mx-auto px-4">
            {/* API Diagnostic Tool */}
            <ApiDiagnostic />
            
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">
                Interactive Analysis
              </Badge>
              <h2 className="scientific-heading text-3xl md:text-4xl mb-6">
                Multi-Quality <span className="text-primary">Data Comparison</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Select from four observation tables and compare time series data across 
                raw, clean, QAQC, and seasonal quality levels
              </p>
            </div>

            <Analytics />
          </div>
        </section>

        {/* Key Attributes Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="scientific-heading text-3xl md:text-4xl mb-4">
                Key <span className="text-primary">Environmental Attributes</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our monitoring network captures critical environmental variables across Vermont's diverse elevations
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Snow Measurements</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-1">
                  <p>• Snow depth (cm)</p>
                  <p>• Snow water equivalent (mm)</p>
                  <p>• Snowpack density (kg/m³)</p>
                  <p>• Ice & water content (%)</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Temperature & Humidity</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-1">
                  <p>• Air temperature (°C)</p>
                  <p>• Soil temperature (°C)</p>
                  <p>• Snowpack temperature profile</p>
                  <p>• Relative humidity (%)</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Wind & Precipitation</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-1">
                  <p>• Wind speed & direction</p>
                  <p>• Precipitation intensity & accumulation</p>
                  <p>• Real-time & NRT measurements</p>
                  <p>• Bucket measurements (mm)</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Radiation</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-1">
                  <p>• Shortwave radiation (in/out)</p>
                  <p>• Longwave radiation (in/out)</p>
                  <p>• Net radiation balance</p>
                  <p>• Energy flux (W/m²)</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Soil Conditions</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-1">
                  <p>• Soil moisture (wfv)</p>
                  <p>• Soil heat flux (W/m²)</p>
                  <p>• Temperature profiles</p>
                  <p>• Freeze-thaw cycles</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">System Metrics</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-1">
                  <p>• Battery voltage</p>
                  <p>• Panel temperature</p>
                  <p>• Data quality flags</p>
                  <p>• Quality numbers (0-600)</p>
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

export default AnalyticsPage;
