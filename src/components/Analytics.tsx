import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Activity, BarChart3, LineChart, Calendar } from 'lucide-react';

const Analytics = () => {
  // Sample analytics data
  const currentMetrics = [
    { label: 'Avg Temperature', value: '16.2°C', change: '+1.3°C', trend: 'up' },
    { label: 'Precipitation', value: '45.2mm', change: '-8.1mm', trend: 'down' },
    { label: 'Wind Speed', value: '12.4 km/h', change: '+2.1 km/h', trend: 'up' },
    { label: 'Humidity', value: '73%', change: '+5%', trend: 'up' }
  ];

  const recentData = [
    { time: '14:30', temp: 18.5, humidity: 72, wind: 11.2 },
    { time: '14:15', temp: 18.3, humidity: 74, wind: 10.8 },
    { time: '14:00', temp: 18.1, humidity: 75, wind: 10.5 },
    { time: '13:45', temp: 17.9, humidity: 76, wind: 10.1 },
    { time: '13:30', temp: 17.8, humidity: 77, wind: 9.8 }
  ];

  return (
    <section id="analytics" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Real-time Data Analytics
          </Badge>
          <h2 className="scientific-heading text-4xl md:text-5xl mb-6">
            <span className="text-primary">Environmental</span> Analytics
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Real-time analysis and visualization of environmental data from across Vermont's monitoring network. 
            Discover trends, patterns, and insights from our comprehensive dataset.
          </p>
        </div>

        {/* Current Metrics Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {currentMetrics.map((metric, index) => (
            <Card key={index} className="data-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="data-label">{metric.label}</span>
                  {metric.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-success" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  )}
                </div>
                <div className="text-2xl font-bold mb-1">{metric.value}</div>
                <div className={`text-sm ${metric.trend === 'up' ? 'text-success' : 'text-destructive'}`}>
                  {metric.change} from last week
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="realtime" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-1/2 mx-auto">
            <TabsTrigger value="realtime" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Real-time
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="historical" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Historical
            </TabsTrigger>
          </TabsList>

          <TabsContent value="realtime" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Real-time Chart Placeholder */}
              <Card className="data-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Live Temperature Data
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-16 w-16 mx-auto mb-4 text-primary opacity-50" />
                      <h3 className="font-semibold mb-2">Interactive Charts</h3>
                      <p className="text-sm text-muted-foreground">
                        Real-time temperature visualization across all monitoring sites
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Data Table */}
              <Card className="data-card">
                <CardHeader>
                  <CardTitle>Latest Measurements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-4 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
                      <span>Time</span>
                      <span>Temp (°C)</span>
                      <span>Humidity (%)</span>
                      <span>Wind (km/h)</span>
                    </div>
                    {recentData.map((entry, index) => (
                      <div key={index} className="grid grid-cols-4 gap-4 text-sm py-2 border-b border-border/50">
                        <span className="font-medium">{entry.time}</span>
                        <span>{entry.temp}</span>
                        <span>{entry.humidity}</span>
                        <span>{entry.wind}</span>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    View Complete Dataset
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card className="data-card">
              <CardHeader>
                <CardTitle>Climate Trends Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 bg-gradient-to-br from-secondary/10 to-primary/10 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <LineChart className="h-20 w-20 mx-auto mb-4 text-primary opacity-50" />
                    <h3 className="font-semibold mb-2 text-xl">Advanced Trend Analysis</h3>
                    <p className="text-muted-foreground max-w-md">
                      Comprehensive trend analysis showing seasonal patterns, 
                      long-term climate changes, and statistical correlations across all monitoring sites.
                    </p>
                    <Button className="btn-research mt-4">
                      Explore Trends
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historical" className="space-y-6">
            <Card className="data-card">
              <CardHeader>
                <CardTitle>Historical Data Archive</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 bg-gradient-to-br from-accent/10 to-secondary/10 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Calendar className="h-20 w-20 mx-auto mb-4 text-primary opacity-50" />
                    <h3 className="font-semibold mb-2 text-xl">5+ Years of Environmental Data</h3>
                    <p className="text-muted-foreground max-w-md">
                      Access comprehensive historical datasets spanning multiple years, 
                      enabling long-term climate research and environmental impact studies.
                    </p>
                    <Button className="btn-data mt-4">
                      Access Archive
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default Analytics;