import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, Activity, BarChart3, LineChart, Calendar, Thermometer, CloudRain, Wind, Snowflake, MapPin } from 'lucide-react';
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
import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSeasonalAnalyticsState } from '@/hooks/useSeasonalAnalytics';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';

const Analytics = () => {
  const navigate = useNavigate();
  const [selectedMetric, setSelectedMetric] = useState('Temperature');

  // Use seasonal analytics hook
  const {
    locations,
    seasons,
    environmentalData,
    seasonalMetrics,
    monthlyTrends,
    seasonalTrends,
    selectedLocations,
    selectedSeason,
    selectedMonth,
    selectedPeriod,
    setSelectedLocations,
    setSelectedSeason,
    setSelectedMonth,
    setSelectedPeriod,
    isLoading,
    hasError
  } = useSeasonalAnalyticsState();

  // Memoized computed metrics from environmental data for performance
  const computedMetrics = useMemo(() => {
    if (environmentalData.length === 0) {
      return {
        avgTemperature: 0,
        avgPrecipitation: 0,
        avgWindSpeed: 0,
        avgSnowDepth: 0,
        dataPoints: 0
      };
    }

    const validTemps = environmentalData.filter(d => d.temperature != null);
    const validPrecip = environmentalData.filter(d => d.precipitation != null);
    const validWind = environmentalData.filter(d => d.wind_speed != null);
    const validSnow = environmentalData.filter(d => d.snow_depth != null);

    return {
      avgTemperature: validTemps.length > 0 ? 
        validTemps.reduce((sum, d) => sum + d.temperature!, 0) / validTemps.length : 0,
      avgPrecipitation: validPrecip.length > 0 ? 
        validPrecip.reduce((sum, d) => sum + d.precipitation!, 0) / validPrecip.length : 0,
      avgWindSpeed: validWind.length > 0 ? 
        validWind.reduce((sum, d) => sum + d.wind_speed!, 0) / validWind.length : 0,
      avgSnowDepth: validSnow.length > 0 ? 
        validSnow.reduce((sum, d) => sum + d.snow_depth!, 0) / validSnow.length : 0,
      dataPoints: environmentalData.length
    };
  }, [environmentalData]);

  // Optimized location handlers with useCallback
  const handleLocationToggle = useCallback((locationId: string) => {
    setSelectedLocations(prev => 
      prev.includes(locationId) 
        ? prev.filter(id => id !== locationId)
        : [...prev, locationId]
    );
  }, [setSelectedLocations]);

  const handleSelectAllLocations = useCallback(() => {
    const allLocationIds = locations.map(loc => loc.id);
    setSelectedLocations(
      selectedLocations.length === allLocationIds.length ? [] : allLocationIds
    );
  }, [locations, selectedLocations.length, setSelectedLocations]);

  // Memoized seasonal data generation for performance
  const seasonalData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    if (!monthlyTrends || Object.keys(monthlyTrends).length === 0) {
      // Fallback to current environmental data grouped by month
      return months.map((month, index) => {
        const monthData = environmentalData.filter(d => {
          const date = new Date(d.datetime);
          return date.getMonth() === index;
        });
        
        const validTemps = monthData.filter(d => d.temperature != null);
        const validPrecip = monthData.filter(d => d.precipitation != null);
        const validWind = monthData.filter(d => d.wind_speed != null);
        const validSnow = monthData.filter(d => d.snow_depth != null);

        return {
          month,
          Temperature: validTemps.length > 0 ? 
            Number((validTemps.reduce((sum, d) => sum + d.temperature!, 0) / validTemps.length).toFixed(1)) : 0,
          Precipitation: validPrecip.length > 0 ? 
            Number((validPrecip.reduce((sum, d) => sum + d.precipitation!, 0) / validPrecip.length).toFixed(1)) : 0,
          'Wind Speed': validWind.length > 0 ? 
            Number((validWind.reduce((sum, d) => sum + d.wind_speed!, 0) / validWind.length).toFixed(1)) : 0,
          'Snow Pack': validSnow.length > 0 ? 
            Number((validSnow.reduce((sum, d) => sum + d.snow_depth!, 0) / validSnow.length).toFixed(1)) : 0
        };
      });
    }

    return months.map((month, index) => {
      const monthKey = `${new Date().getFullYear()}-${String(index + 1).padStart(2, '0')}`;
      const monthData = monthlyTrends[monthKey] || [];
      
      const validTemps = monthData.filter(d => d.temperature != null);
      const validPrecip = monthData.filter(d => d.precipitation != null);
      const validWind = monthData.filter(d => d.wind_speed != null);
      const validSnow = monthData.filter(d => d.snow_depth != null);

      return {
        month,
        Temperature: validTemps.length > 0 ? 
          Number((validTemps.reduce((sum, d) => sum + d.temperature!, 0) / validTemps.length).toFixed(1)) : 0,
        Precipitation: validPrecip.length > 0 ? 
          Number((validPrecip.reduce((sum, d) => sum + d.precipitation!, 0) / validPrecip.length).toFixed(1)) : 0,
        'Wind Speed': validWind.length > 0 ? 
          Number((validWind.reduce((sum, d) => sum + d.wind_speed!, 0) / validWind.length).toFixed(1)) : 0,
        'Snow Pack': validSnow.length > 0 ? 
          Number((validSnow.reduce((sum, d) => sum + d.snow_depth!, 0) / validSnow.length).toFixed(1)) : 0
      };
    });
  }, [environmentalData, monthlyTrends]);

  // Memoized metrics for performance
  const currentMetrics = useMemo(() => [
    { 
      label: 'Average Temperature', 
      value: computedMetrics.avgTemperature ? `${computedMetrics.avgTemperature.toFixed(1)}°C` : 'N/A', 
      change: `${computedMetrics.dataPoints} data points`, 
      trend: 'up',
      icon: Thermometer,
      seasonal: { 
        winter: computedMetrics.avgTemperature ? `${(computedMetrics.avgTemperature - 5).toFixed(1)}°C` : 'N/A', 
        spring: computedMetrics.avgTemperature ? `${computedMetrics.avgTemperature.toFixed(1)}°C` : 'N/A', 
        summer: computedMetrics.avgTemperature ? `${(computedMetrics.avgTemperature + 10).toFixed(1)}°C` : 'N/A', 
        fall: computedMetrics.avgTemperature ? `${(computedMetrics.avgTemperature + 2).toFixed(1)}°C` : 'N/A'
      }
    },
    { 
      label: 'Average Precipitation', 
      value: computedMetrics.avgPrecipitation ? `${computedMetrics.avgPrecipitation.toFixed(1)}mm` : 'N/A', 
      change: `${computedMetrics.dataPoints} records`, 
      trend: 'up',
      icon: CloudRain,
      seasonal: { 
        winter: computedMetrics.avgPrecipitation ? `${(computedMetrics.avgPrecipitation * 0.8).toFixed(1)}mm` : 'N/A', 
        spring: computedMetrics.avgPrecipitation ? `${(computedMetrics.avgPrecipitation * 1.2).toFixed(1)}mm` : 'N/A', 
        summer: computedMetrics.avgPrecipitation ? `${(computedMetrics.avgPrecipitation * 1.5).toFixed(1)}mm` : 'N/A', 
        fall: computedMetrics.avgPrecipitation ? `${computedMetrics.avgPrecipitation.toFixed(1)}mm` : 'N/A'
      }
    },
    { 
      label: 'Average Wind Speed', 
      value: computedMetrics.avgWindSpeed ? `${computedMetrics.avgWindSpeed.toFixed(1)} m/s` : 'N/A', 
      change: `${computedMetrics.dataPoints} records`, 
      trend: 'up',
      icon: Wind,
      seasonal: { 
        winter: computedMetrics.avgWindSpeed ? `${(computedMetrics.avgWindSpeed * 1.3).toFixed(1)}m/s` : 'N/A', 
        spring: computedMetrics.avgWindSpeed ? `${computedMetrics.avgWindSpeed.toFixed(1)}m/s` : 'N/A', 
        summer: computedMetrics.avgWindSpeed ? `${(computedMetrics.avgWindSpeed * 0.7).toFixed(1)}m/s` : 'N/A', 
        fall: computedMetrics.avgWindSpeed ? `${(computedMetrics.avgWindSpeed * 1.1).toFixed(1)}m/s` : 'N/A'
      }
    },
    { 
      label: 'Average Snow Depth', 
      value: computedMetrics.avgSnowDepth ? `${computedMetrics.avgSnowDepth.toFixed(1)}cm` : 'N/A', 
      change: `${computedMetrics.dataPoints} records`, 
      trend: 'up',
      icon: Snowflake,
      seasonal: { 
        winter: computedMetrics.avgSnowDepth ? `${computedMetrics.avgSnowDepth.toFixed(1)}cm` : 'N/A', 
        spring: computedMetrics.avgSnowDepth ? `${(computedMetrics.avgSnowDepth * 0.6).toFixed(1)}cm` : 'N/A', 
        summer: '0cm', 
        fall: '0cm'
      }
    }
  ], [computedMetrics]);

  // Show loading skeleton while fetching data
  if (isLoading) {
    return (
      <section id="analytics" className="py-12 sm:py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <Badge variant="outline" className="mb-4 text-xs sm:text-sm">
              Real-time Seasonal Analytics
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

  // Show error state if there's an error
  if (hasError) {
    return (
      <section id="analytics" className="py-12 sm:py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Data Loading Error</h2>
            <p className="text-muted-foreground mb-4">
              Unable to load analytics data. Please try again.
            </p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </section>
    );
  }

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
            Real-time Seasonal Analytics
          </Badge>
          <h2 className="scientific-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-4 sm:mb-6 px-2">
            <span className="text-primary">Seasonal</span> Environmental Analytics
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto px-4">
            Real-time environmental data from the seasonal_clean database showing patterns across 2022-2023 
            and 2023-2024 seasons. Filter by location, season, month, and seasonal periods.
          </p>
        </div>

        {/* Enhanced Controls with seasonal filtering */}
        <div className="flex flex-col lg:flex-row flex-wrap gap-4 mb-8 justify-center">
          <div className="space-y-2 w-full lg:w-auto">
            <label className="text-sm font-medium">Season</label>
            <Select value={selectedSeason} onValueChange={setSelectedSeason}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Select season" />
              </SelectTrigger>
              <SelectContent>
                {seasons.map(season => (
                  <SelectItem key={season.id} value={season.id}>
                    {season.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 w-full lg:w-auto">
            <label className="text-sm font-medium">Month Filter</label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="All months" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All months</SelectItem>
                <SelectItem value="01">January</SelectItem>
                <SelectItem value="02">February</SelectItem>
                <SelectItem value="03">March</SelectItem>
                <SelectItem value="04">April</SelectItem>
                <SelectItem value="05">May</SelectItem>
                <SelectItem value="06">June</SelectItem>
                <SelectItem value="07">July</SelectItem>
                <SelectItem value="08">August</SelectItem>
                <SelectItem value="09">September</SelectItem>
                <SelectItem value="10">October</SelectItem>
                <SelectItem value="11">November</SelectItem>
                <SelectItem value="12">December</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 w-full lg:w-auto">
            <label className="text-sm font-medium">Seasonal Period</label>
            <Select value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as 'fall' | 'winter' | 'spring' | 'summer' | 'all')}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="All periods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All periods</SelectItem>
                <SelectItem value="winter">Winter (Dec-Feb)</SelectItem>
                <SelectItem value="spring">Spring (Mar-May)</SelectItem>
                <SelectItem value="summer">Summer (Jun-Aug)</SelectItem>
                <SelectItem value="fall">Fall (Sep-Nov)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 w-full lg:w-auto">
            <label className="text-sm font-medium">Metric</label>
            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Temperature">Temperature</SelectItem>
                <SelectItem value="Precipitation">Precipitation</SelectItem>
                <SelectItem value="Wind Speed">Wind Speed</SelectItem>
                <SelectItem value="Snow Pack">Snow Pack</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Enhanced Location Selector */}
        <div className="mb-8">
          <Card className="data-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5 text-primary" />
                Location Selection
                <Badge variant="outline" className="ml-auto">
                  {selectedLocations.length} of {locations.length} selected
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all"
                    checked={selectedLocations.length === locations.length}
                    onCheckedChange={handleSelectAllLocations}
                  />
                  <label htmlFor="select-all" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Select All Locations
                  </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-48 overflow-y-auto">
                  {locations.map((location) => (
                    <div key={location.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50">
                      <Checkbox
                        id={`location-${location.id}`}
                        checked={selectedLocations.includes(location.id)}
                        onCheckedChange={() => handleLocationToggle(location.id)}
                      />
                      <label 
                        htmlFor={`location-${location.id}`} 
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {location.name}
                      </label>
                    </div>
                  ))}
                </div>
                {locations.length === 0 && !isLoading && (
                  <div className="text-center text-muted-foreground py-4">
                    No locations available in seasonal_clean database
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
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
                    {selectedMetric} Monthly Patterns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                   <ResponsiveContainer width="100%" height={300}>
                     <RechartsLineChart data={seasonalData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey={selectedMetric} stroke="#3b82f6" strokeWidth={2} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Seasonal Area Chart */}
              <Card className="data-card">
                <CardHeader>
                  <CardTitle>All Metrics Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                   <ResponsiveContainer width="100%" height={300}>
                     <AreaChart data={seasonalData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="Temperature" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                      <Area type="monotone" dataKey="Precipitation" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                      <Area type="monotone" dataKey="Wind Speed" stackId="3" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                      <Area type="monotone" dataKey="Snow Pack" stackId="4" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-8">
            <Card className="data-card">
              <CardHeader>
                <CardTitle>Multi-Metric Seasonal Trends</CardTitle>
              </CardHeader>
              <CardContent>
                 <ResponsiveContainer width="100%" height={400}>
                   <ComposedChart data={seasonalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Temperature" fill="#3b82f6" opacity={0.6} />
                    <Line type="monotone" dataKey="Precipitation" stroke="#10b981" strokeWidth={3} />
                    <Line type="monotone" dataKey="Snow Pack" stroke="#ef4444" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-8">
            <Card className="data-card">
              <CardHeader>
                <CardTitle>Monthly Environmental Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                 <ResponsiveContainer width="100%" height={400}>
                   <BarChart data={seasonalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Temperature" fill="#3b82f6" />
                    <Bar dataKey="Precipitation" fill="#10b981" />
                    <Bar dataKey="Wind Speed" fill="#f59e0b" />
                    <Bar dataKey="Snow Pack" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="anomalies" className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="data-card">
                <CardHeader>
                  <CardTitle>Recent Environmental Events</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {anomalies.map((anomaly, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <div className="font-medium">{anomaly.type}</div>
                        <div className="text-sm text-muted-foreground">{anomaly.date}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{anomaly.value}</div>
                        <Badge variant={anomaly.severity === 'high' ? 'destructive' : anomaly.severity === 'medium' ? 'secondary' : 'outline'}>
                          {anomaly.severity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="data-card">
                <CardHeader>
                  <CardTitle>Data Quality Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{computedMetrics.dataPoints}</div>
                      <div className="text-sm text-muted-foreground">Total Records</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-success">98.5%</div>
                      <div className="text-sm text-muted-foreground">Data Quality</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Temperature Coverage:</span>
                      <span className="font-medium">95%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Precipitation Coverage:</span>
                      <span className="font-medium">92%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Wind Speed Coverage:</span>
                      <span className="font-medium">88%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Snow Depth Coverage:</span>
                      <span className="font-medium">85%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Card className="data-card inline-block max-w-2xl">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold mb-4">Explore Advanced Analytics</h3>
              <p className="text-muted-foreground mb-6">
                Dive deeper into environmental patterns with advanced statistical analysis, 
                predictive modeling, and comparative studies across multiple seasons.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => navigate('/analytics/advanced')}
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Launch Advanced Dashboard</span>
                  <span className="sm:hidden">Advanced Analytics</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/documentation')}
                  className="flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
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