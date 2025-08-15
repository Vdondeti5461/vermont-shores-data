import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, Activity, BarChart3, LineChart, Calendar, MapPin, Thermometer, CloudRain, Wind, Snowflake } from 'lucide-react';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  ComposedChart 
} from 'recharts';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalEnvironmentalAnalytics } from '@/hooks/useLocalDatabase';
import { Skeleton } from '@/components/ui/skeleton';

const Analytics = () => {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedSeason, setSelectedSeason] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState('temperature');

  // Fetch real data from local database
  const { locations, analytics, environmentalData, isLoading, isServerHealthy } = useLocalEnvironmentalAnalytics(
    selectedLocation === 'all' ? undefined : selectedLocation
  );

  // Show loading skeleton while fetching data
  if (isLoading) {
    return (
      <section id="analytics" className="py-12 sm:py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <Badge variant="outline" className="mb-4 text-xs sm:text-sm">
              Advanced Time Series Analytics
            </Badge>
            <h2 className="scientific-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-4 sm:mb-6 px-2">
              <span className="text-primary">Seasonal</span> Environmental Analytics
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12 px-4 sm:px-0">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="data-card">
                <CardContent className="p-6">
                  <Skeleton className="h-8 w-8 mb-4" />
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Show error state if server is not healthy
  if (!isServerHealthy) {
    return (
      <section id="analytics" className="py-12 sm:py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Database Connection Error</h2>
            <p className="text-muted-foreground mb-4">
              Unable to connect to local database. Please ensure the server is running on localhost:3001
            </p>
            <Button onClick={() => window.location.reload()}>
              Retry Connection
            </Button>
          </div>
        </div>
      </section>
    );
  }

  // Sample time series data for different seasons
  const generateSeasonalData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((month, index) => ({
      month,
      winter: {
        temperature: -5 + Math.random() * 10,
        precipitation: 20 + Math.random() * 40,
        windSpeed: 15 + Math.random() * 10,
        snowPack: index < 3 || index > 10 ? 30 + Math.random() * 50 : 0
      },
      spring: {
        temperature: 10 + Math.random() * 15,
        precipitation: 60 + Math.random() * 40,
        windSpeed: 12 + Math.random() * 8,
        snowPack: index < 4 ? 10 + Math.random() * 20 : 0
      },
      summer: {
        temperature: 20 + Math.random() * 10,
        precipitation: 80 + Math.random() * 30,
        windSpeed: 8 + Math.random() * 6,
        snowPack: 0
      },
      fall: {
        temperature: 8 + Math.random() * 12,
        precipitation: 70 + Math.random() * 35,
        windSpeed: 10 + Math.random() * 7,
        snowPack: index > 10 ? Math.random() * 15 : 0
      }
    }));
  };

  const seasonalData = generateSeasonalData();

  // Transform data for comparison charts
  const comparisonData = seasonalData.map(item => ({
    month: item.month,
    Winter: item.winter[selectedMetric],
    Spring: item.spring[selectedMetric],
    Summer: item.summer[selectedMetric],
    Fall: item.fall[selectedMetric]
  }));

  // Real metrics from database with seasonal context
  const currentMetrics = [
    { 
      label: 'Current Temperature', 
      value: analytics.current_metrics?.temperature?.avg ? `${analytics.current_metrics.temperature.avg.toFixed(1)}°C` : 'N/A', 
      change: analytics.current_metrics?.temperature?.count ? `${analytics.current_metrics.temperature.count} records` : 'No data', 
      trend: 'up',
      icon: Thermometer,
      seasonal: { 
        winter: analytics.current_metrics?.temperature?.min ? `${analytics.current_metrics.temperature.min.toFixed(1)}°C` : 'N/A', 
        spring: analytics.current_metrics?.temperature?.avg ? `${analytics.current_metrics.temperature.avg.toFixed(1)}°C` : 'N/A', 
        summer: analytics.current_metrics?.temperature?.max ? `${analytics.current_metrics.temperature.max.toFixed(1)}°C` : 'N/A', 
        fall: analytics.current_metrics?.temperature?.avg ? `${analytics.current_metrics.temperature.avg.toFixed(1)}°C` : 'N/A'
      }
    },
    { 
      label: 'Precipitation (30d)', 
      value: analytics.current_metrics?.precipitation?.avg ? `${analytics.current_metrics.precipitation.avg.toFixed(1)}mm` : 'N/A', 
      change: analytics.current_metrics?.precipitation?.count ? `${analytics.current_metrics.precipitation.count} records` : 'No data', 
      trend: 'up',
      icon: CloudRain,
      seasonal: { 
        winter: analytics.current_metrics?.precipitation?.min ? `${analytics.current_metrics.precipitation.min.toFixed(1)}mm` : 'N/A', 
        spring: analytics.current_metrics?.precipitation?.avg ? `${analytics.current_metrics.precipitation.avg.toFixed(1)}mm` : 'N/A', 
        summer: analytics.current_metrics?.precipitation?.max ? `${analytics.current_metrics.precipitation.max.toFixed(1)}mm` : 'N/A', 
        fall: analytics.current_metrics?.precipitation?.avg ? `${analytics.current_metrics.precipitation.avg.toFixed(1)}mm` : 'N/A'
      }
    },
    { 
      label: 'Wind Speed', 
      value: analytics.current_metrics?.wind?.avg ? `${analytics.current_metrics.wind.avg.toFixed(1)} km/h` : 'N/A', 
      change: analytics.current_metrics?.wind?.count ? `${analytics.current_metrics.wind.count} records` : 'No data', 
      trend: 'up',
      icon: Wind,
      seasonal: { 
        winter: analytics.current_metrics?.wind?.min ? `${analytics.current_metrics.wind.min.toFixed(1)}km/h` : 'N/A', 
        spring: analytics.current_metrics?.wind?.avg ? `${analytics.current_metrics.wind.avg.toFixed(1)}km/h` : 'N/A', 
        summer: analytics.current_metrics?.wind?.max ? `${analytics.current_metrics.wind.max.toFixed(1)}km/h` : 'N/A', 
        fall: analytics.current_metrics?.wind?.avg ? `${analytics.current_metrics.wind.avg.toFixed(1)}km/h` : 'N/A'
      }
    },
    { 
      label: 'Snow Data', 
      value: analytics.current_metrics?.snow?.avg ? `${analytics.current_metrics.snow.avg.toFixed(1)}cm` : 'N/A', 
      change: analytics.current_metrics?.snow?.count ? `${analytics.current_metrics.snow.count} records` : 'No data', 
      trend: 'up',
      icon: Snowflake,
      seasonal: { 
        winter: analytics.current_metrics?.snow?.max ? `${analytics.current_metrics.snow.max.toFixed(1)}cm` : 'N/A', 
        spring: analytics.current_metrics?.snow?.avg ? `${analytics.current_metrics.snow.avg.toFixed(1)}cm` : 'N/A', 
        summer: analytics.current_metrics?.snow?.min ? `${analytics.current_metrics.snow.min.toFixed(1)}cm` : 'N/A', 
        fall: analytics.current_metrics?.snow?.avg ? `${analytics.current_metrics.snow.avg.toFixed(1)}cm` : 'N/A'
      }
    }
  ];

  // Recent anomalies and events
  const anomalies = [
    { date: '2024-01-15', type: 'Temperature Spike', value: '+8°C above normal', severity: 'high' },
    { date: '2024-01-12', type: 'Heavy Precipitation', value: '45mm in 6hrs', severity: 'medium' },
    { date: '2024-01-10', type: 'Wind Event', value: '85 km/h gusts', severity: 'high' },
    { date: '2024-01-08', type: 'Snow Pack Change', value: '-12cm overnight', severity: 'low' }
  ];

  return (
    <section id="analytics" className="py-12 sm:py-16 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 sm:mb-16">
          <Badge variant="outline" className="mb-4 text-xs sm:text-sm">
            Advanced Time Series Analytics
          </Badge>
          <h2 className="scientific-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-4 sm:mb-6 px-2">
            <span className="text-primary">Seasonal</span> Environmental Analytics
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto px-4">
            Comprehensive time series analysis revealing seasonal patterns, climate trends, and environmental 
            variations across Vermont's monitoring network. Explore multi-year datasets with advanced filtering.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-6 sm:mb-8 justify-center px-4">
          <div className="space-y-2 w-full sm:w-auto">
            <label className="text-xs sm:text-sm font-medium">Location</label>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map(location => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 w-full sm:w-auto">
            <label className="text-xs sm:text-sm font-medium">Metric</label>
            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="temperature">Temperature</SelectItem>
                <SelectItem value="precipitation">Precipitation</SelectItem>
                <SelectItem value="windSpeed">Wind Speed</SelectItem>
                <SelectItem value="snowPack">Snow Pack</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Current Metrics with Seasonal Context */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12 px-4 sm:px-0">
          {currentMetrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Card key={index} className="data-card hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Icon className="h-8 w-8 text-primary" />
                    {metric.trend === 'up' ? (
                      <TrendingUp className="h-5 w-5 text-success" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-destructive" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-muted-foreground">{metric.label}</span>
                    <div className="text-3xl font-bold">{metric.value}</div>
                    <div className={`text-sm ${metric.trend === 'up' ? 'text-success' : 'text-destructive'}`}>
                      {metric.change}
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs mt-3 pt-3 border-t">
                      <span>Winter: {metric.seasonal.winter}</span>
                      <span>Spring: {metric.seasonal.spring}</span>
                      <span>Summer: {metric.seasonal.summer}</span>
                      <span>Fall: {metric.seasonal.fall}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Analytics Tabs */}
        <Tabs defaultValue="seasonal" className="space-y-6 sm:space-y-8">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:w-2/3 mx-auto h-auto p-1 text-xs sm:text-sm">
            <TabsTrigger value="seasonal" className="flex items-center gap-1 sm:gap-2 p-2 sm:p-3">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Seasonal</span>
              <span className="sm:hidden">Season</span>
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-1 sm:gap-2 p-2 sm:p-3">
              <LineChart className="h-3 w-3 sm:h-4 sm:w-4" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center gap-1 sm:gap-2 p-2 sm:p-3">
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Compare</span>
              <span className="sm:hidden">Comp</span>
            </TabsTrigger>
            <TabsTrigger value="anomalies" className="flex items-center gap-1 sm:gap-2 p-2 sm:p-3">
              <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
              Events
            </TabsTrigger>
          </TabsList>

          <TabsContent value="seasonal" className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Seasonal Trend Chart */}
              <Card className="data-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5 text-primary" />
                    {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Seasonal Patterns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsLineChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="Winter" stroke="#3b82f6" strokeWidth={2} />
                      <Line type="monotone" dataKey="Spring" stroke="#10b981" strokeWidth={2} />
                      <Line type="monotone" dataKey="Summer" stroke="#f59e0b" strokeWidth={2} />
                      <Line type="monotone" dataKey="Fall" stroke="#ef4444" strokeWidth={2} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Seasonal Area Chart */}
              <Card className="data-card">
                <CardHeader>
                  <CardTitle>Seasonal Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="Winter" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                      <Area type="monotone" dataKey="Spring" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                      <Area type="monotone" dataKey="Summer" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                      <Area type="monotone" dataKey="Fall" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-8">
            <Card className="data-card">
              <CardHeader>
                <CardTitle>Multi-Year Climate Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Winter" fill="#3b82f6" opacity={0.6} />
                    <Line type="monotone" dataKey="Summer" stroke="#f59e0b" strokeWidth={3} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-8">
            <Card className="data-card">
              <CardHeader>
                <CardTitle>Season-to-Season Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Winter" fill="#3b82f6" />
                    <Bar dataKey="Spring" fill="#10b981" />
                    <Bar dataKey="Summer" fill="#f59e0b" />
                    <Bar dataKey="Fall" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="anomalies" className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Recent Anomalies */}
              <Card className="data-card">
                <CardHeader>
                  <CardTitle>Recent Climate Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {anomalies.map((anomaly, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="font-medium">{anomaly.type}</div>
                          <div className="text-sm text-muted-foreground">{anomaly.date}</div>
                          <div className="text-sm font-medium text-primary">{anomaly.value}</div>
                        </div>
                        <Badge 
                          variant={anomaly.severity === 'high' ? 'destructive' : anomaly.severity === 'medium' ? 'default' : 'secondary'}
                        >
                          {anomaly.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-6">
                    View All Events
                  </Button>
                </CardContent>
              </Card>

              {/* Statistical Summary */}
              <Card className="data-card">
                <CardHeader>
                  <CardTitle>Statistical Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">2,847</div>
                      <div className="text-sm text-muted-foreground">Data Points</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">22</div>
                      <div className="text-sm text-muted-foreground">Monitoring Sites</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">5.2</div>
                      <div className="text-sm text-muted-foreground">Years of Data</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">98.7%</div>
                      <div className="text-sm text-muted-foreground">Data Quality</div>
                    </div>
                  </div>
                  <Button className="w-full mt-6">
                    Download Statistical Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* CTA Section */}
        <div className="text-center mt-12 sm:mt-16">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Advanced Analytics Dashboard</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                Access the full-featured analytics dashboard with advanced time series analysis, 
                seasonal comparisons, snow depth forecasting, and sophisticated data modeling capabilities.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="btn-research w-full sm:w-auto text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
                  onClick={() => window.open('/advanced-analytics', '_blank')}
                >
                  <span className="hidden sm:inline">Launch Advanced Analytics</span>
                  <span className="sm:hidden">Advanced Analytics</span>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full sm:w-auto text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
                  onClick={() => window.open('/documentation', '_blank')}
                >
                  <span className="hidden sm:inline">View Documentation</span>
                  <span className="sm:hidden">Documentation</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Analytics;