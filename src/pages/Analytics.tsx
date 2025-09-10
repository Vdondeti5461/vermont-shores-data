import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Analytics from '@/components/Analytics';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, Clock, Database } from 'lucide-react';
import { Link } from 'react-router-dom';

const AnalyticsPage = () => {
  const analyticsFeatures = [
    {
      title: 'Snow Depth Analysis',
      description: 'Time series comparison of raw vs cleaned DBTCDT measurements',
      icon: BarChart3,
      href: '/analytics/snow-depth'
    },
    {
      title: 'Real-time Dashboard',
      description: 'Live environmental data visualization',
      icon: Clock,
      href: '/analytics/realtime'
    },
    {
      title: 'Historical Analysis',
      description: 'Long-term trends and patterns',
      icon: TrendingUp,
      href: '/analytics/historical'
    },
    {
      title: 'Advanced Analytics',
      description: 'Machine learning and forecasting',
      icon: BarChart3,
      href: '/analytics/advanced'
    },
    {
      title: 'Data Quality',
      description: 'Quality assurance metrics',
      icon: Database,
      href: '/analytics/quality'
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
                <BarChart3 className="w-4 h-4 mr-2" />
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

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                      <Button asChild variant="outline" size="sm">
                        <Link to={feature.href}>Explore</Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Main Analytics Dashboard */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">
                Live Dashboard
              </Badge>
              <h2 className="scientific-heading text-3xl md:text-4xl mb-6">
                Current <span className="text-primary">Conditions</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Real-time environmental data from all monitoring stations across Vermont
              </p>
            </div>

            <Analytics />
          </div>
        </section>

        {/* Analytics Categories */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">
                Analysis Tools
              </Badge>
              <h2 className="scientific-heading text-3xl md:text-4xl mb-6">
                Explore <span className="text-primary">Data Insights</span>
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
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AnalyticsPage;