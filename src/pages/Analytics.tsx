import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Analytics } from '@/components/Analytics';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, TrendingUp, Clock, Database, Map, LineChart, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

const AnalyticsPage = () => {
  const analyticsFeatures = [
    {
      title: 'Time Series Plots',
      description: 'Raw, Clean, and QAQC data visualization',
      icon: LineChart,
      href: '#plots'
    },
    {
      title: 'Seasonal QAQC Analytics',
      description: 'Quality-controlled seasonal environmental data (2022-2025)',
      icon: Database,
      href: '/analytics/seasonal'
    },
    {
      title: 'Real-time Dashboard',
      description: 'Live environmental data monitoring',
      icon: Clock,
      href: '/analytics/realtime'
    },
    {
      title: 'Machine Learning',
      description: 'Predictive models and advanced analytics',
      icon: Brain,
      href: '/analytics/advanced'
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
                Data Analytics
              </Badge>
              <h1 className="scientific-heading text-4xl md:text-6xl mb-6">
                Environmental <span className="text-primary">Data</span>
                <br />Analytics Platform
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Comprehensive analysis tools for exploring environmental patterns, trends, and insights 
                from Vermont's Summit-to-Shore monitoring network.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {analyticsFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card key={feature.title} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="text-center pb-3">
                      <Icon className="h-8 w-8 text-primary mx-auto mb-2" />
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-sm text-muted-foreground mb-4">{feature.description}</p>
                      {feature.href.startsWith('#') ? (
                        <Button asChild variant="outline" size="sm">
                          <a href={feature.href}>Explore</a>
                        </Button>
                      ) : (
                        <Button asChild variant="outline" size="sm">
                          <Link to={feature.href}>Explore</Link>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Analytics Subsections Navigation */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="maps" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="maps" className="gap-2">
                  <Map className="w-4 h-4" />
                  Maps/Analysis
                </TabsTrigger>
                <TabsTrigger value="plots" className="gap-2">
                  <LineChart className="w-4 h-4" />
                  Plots
                </TabsTrigger>
                <TabsTrigger value="others" className="gap-2">
                  <Layers className="w-4 h-4" />
                  Others
                </TabsTrigger>
              </TabsList>

              {/* Maps/Analysis Tab */}
              <TabsContent value="maps" className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="scientific-heading text-3xl md:text-4xl mb-4">
                    Spatial <span className="text-primary">Analysis</span>
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Interactive maps and geographic visualization of environmental data
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Snow Depth Mapping</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        Geographic distribution of snow depth measurements across monitoring stations.
                      </p>
                      <Button asChild variant="outline">
                        <Link to="/analytics/snow-depth">View Map</Link>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Station Network</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        Explore all monitoring stations and their real-time measurements.
                      </p>
                      <Button asChild variant="outline">
                        <Link to="/analytics/realtime">View Network</Link>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Elevation Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        Compare environmental conditions across different elevation zones.
                      </p>
                      <Button asChild variant="outline">
                        <Link to="/analytics/advanced">View Analysis</Link>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Regional Comparison</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        Spatial patterns and regional variations in climate data.
                      </p>
                      <Button asChild variant="outline">
                        <Link to="/analytics/historical">View Comparison</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Plots Tab */}
              <TabsContent value="plots" className="space-y-8">
                <div className="text-center mb-8">
                  <Badge variant="outline" className="mb-4">
                    Time Series Analysis
                  </Badge>
                  <h2 className="scientific-heading text-3xl md:text-4xl mb-6">
                    Environmental Data <span className="text-primary">Quality Comparison</span>
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Explore raw, clean, and QAQC time series data from Vermont's monitoring network
                  </p>
                </div>

                <Analytics />

                <div className="mt-16">
                  <div className="text-center mb-8">
                    <Badge variant="outline" className="mb-4">
                      Analysis Tools
                    </Badge>
                    <h2 className="scientific-heading text-3xl md:text-4xl mb-6">
                      Time Series <span className="text-primary">Analysis</span>
                    </h2>
                  </div>

                  <Tabs defaultValue="climate" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="climate">Climate</TabsTrigger>
                      <TabsTrigger value="hydrology">Hydrology</TabsTrigger>
                      <TabsTrigger value="air-quality">Air Quality</TabsTrigger>
                      <TabsTrigger value="soil">Soil</TabsTrigger>
                    </TabsList>

                    <TabsContent value="climate" className="mt-8">
                      <div className="grid md:grid-cols-2 gap-8">
                        <Card>
                          <CardHeader>
                            <CardTitle>Temperature Trends</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground mb-4">
                              Long-term temperature patterns and seasonal variations across different elevations.
                            </p>
                            <Button asChild variant="outline">
                              <Link to="/analytics/climate/temperature">View Analysis</Link>
                            </Button>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle>Precipitation Patterns</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground mb-4">
                              Rainfall and snowfall analysis, including intensity and seasonal distribution.
                            </p>
                            <Button asChild variant="outline">
                              <Link to="/analytics/climate/precipitation">View Analysis</Link>
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="hydrology" className="mt-8">
                      <div className="grid md:grid-cols-2 gap-8">
                        <Card>
                          <CardHeader>
                            <CardTitle>Snow Water Equivalent</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground mb-4">
                              Snow pack analysis and water content measurements across elevation gradients.
                            </p>
                            <Button asChild variant="outline">
                              <Link to="/analytics/hydrology/snow">View Analysis</Link>
                            </Button>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle>Soil Moisture</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground mb-4">
                              Soil water content monitoring and drought condition assessments.
                            </p>
                            <Button asChild variant="outline">
                              <Link to="/analytics/hydrology/soil-moisture">View Analysis</Link>
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="air-quality" className="mt-8">
                      <Card>
                        <CardHeader>
                          <CardTitle>Atmospheric Conditions</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground mb-4">
                            Air quality metrics, humidity levels, and atmospheric pressure analysis.
                          </p>
                          <Button asChild variant="outline">
                            <Link to="/analytics/air-quality">View Analysis</Link>
                          </Button>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="soil" className="mt-8">
                      <Card>
                        <CardHeader>
                          <CardTitle>Soil Conditions</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground mb-4">
                            Soil temperature, moisture content, and seasonal freeze-thaw cycles.
                          </p>
                          <Button asChild variant="outline">
                            <Link to="/analytics/soil">View Analysis</Link>
                          </Button>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              </TabsContent>

              {/* Others Tab */}
              <TabsContent value="others" className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="scientific-heading text-3xl md:text-4xl mb-4">
                    Additional <span className="text-primary">Tools</span>
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Data quality metrics, advanced features, and specialized analysis tools
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Seasonal QAQC Data</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        Quality-controlled seasonal environmental data from 2022-2025.
                      </p>
                      <Button asChild variant="outline">
                        <Link to="/analytics/seasonal">View Analysis</Link>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Machine Learning Models</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        Predictive analytics, forecasting, and pattern recognition.
                      </p>
                      <Button asChild variant="outline">
                        <Link to="/analytics/advanced">Explore Models</Link>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Export & Reports</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        Download data, generate custom reports, and export visualizations.
                      </p>
                      <Button asChild variant="outline">
                        <Link to="/data-download">Access Tools</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AnalyticsPage;