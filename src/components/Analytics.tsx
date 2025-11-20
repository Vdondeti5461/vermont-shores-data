import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Thermometer, Wind, Snowflake, MapPin, Database, Download, Filter } from 'lucide-react';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart 
} from 'recharts';
import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRealTimeAnalyticsState } from '@/hooks/useRealTimeAnalytics';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';

const Analytics = () => {
  const navigate = useNavigate();
  const [selectedAttribute, setSelectedAttribute] = useState('snow_depth');

  // Use real-time analytics hook
  const {
    seasons,
    locations,
    rawData,
    cleanData,
    qaqcData,
    selectedSeason,
    selectedLocations,
    setSelectedSeason,
    setSelectedLocations,
    isLoading
  } = useRealTimeAnalyticsState();

  // Attribute configuration for display
  const ATTRIBUTES = useMemo(() => [
    { 
      id: 'snow_depth', 
      label: 'Snow Depth', 
      unit: 'cm', 
      icon: Snowflake,
      rawKey: 'snow_depth_raw',
      cleanKey: 'snow_depth_clean',
      qaqcKey: 'snow_depth_qaqc',
      color: '#3b82f6'
    },
    { 
      id: 'air_temperature_avg_c', 
      label: 'Air Temperature', 
      unit: '°C', 
      icon: Thermometer,
      rawKey: 'air_temperature_raw',
      cleanKey: 'air_temperature_clean',
      qaqcKey: 'air_temperature_qaqc',
      color: '#ef4444'
    },
    { 
      id: 'wind_speed_max_ms', 
      label: 'Wind Speed', 
      unit: 'm/s', 
      icon: Wind,
      rawKey: 'wind_speed_raw',
      cleanKey: 'wind_speed_clean',
      qaqcKey: 'wind_speed_qaqc',
      color: '#10b981'
    }
  ], []);

  // Get selected attribute configuration
  const currentAttribute = ATTRIBUTES.find(attr => attr.id === selectedAttribute) || ATTRIBUTES[0];

  // Location handlers
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

  // Process time series data for charts
  const chartData = useMemo(() => {
    if (!rawData.length && !cleanData.length && !qaqcData.length) {
      return [];
    }

    // Combine all data sources and group by timestamp
    const dataByTimestamp = new Map<string, any>();

    // Process raw data
    rawData.forEach(point => {
      const key = `${point.timestamp}_${point.location}`;
      if (!dataByTimestamp.has(key)) {
        dataByTimestamp.set(key, {
          timestamp: point.timestamp,
          location: point.location,
          dateLabel: point.timestamp ? format(new Date(point.timestamp), 'MMM dd, yyyy') : ''
        });
      }
      const data = dataByTimestamp.get(key);
      data[currentAttribute.rawKey] = (point as any)[currentAttribute.rawKey];
    });

    // Process clean data
    cleanData.forEach(point => {
      const key = `${point.timestamp}_${point.location}`;
      if (!dataByTimestamp.has(key)) {
        dataByTimestamp.set(key, {
          timestamp: point.timestamp,
          location: point.location,
          dateLabel: point.timestamp ? format(new Date(point.timestamp), 'MMM dd, yyyy') : ''
        });
      }
      const data = dataByTimestamp.get(key);
      data[currentAttribute.cleanKey] = (point as any)[currentAttribute.cleanKey];
    });

    // Process QAQC data
    qaqcData.forEach(point => {
      const key = `${point.timestamp}_${point.location}`;
      if (!dataByTimestamp.has(key)) {
        dataByTimestamp.set(key, {
          timestamp: point.timestamp,
          location: point.location,
          dateLabel: point.timestamp ? format(new Date(point.timestamp), 'MMM dd, yyyy') : ''
        });
      }
      const data = dataByTimestamp.get(key);
      data[currentAttribute.qaqcKey] = (point as any)[currentAttribute.qaqcKey];
    });

    // Convert to array and sort by timestamp
    const sortedData = Array.from(dataByTimestamp.values())
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Sample data if too many points (keep every Nth point for performance)
    const maxPoints = 1000;
    if (sortedData.length > maxPoints) {
      const step = Math.ceil(sortedData.length / maxPoints);
      return sortedData.filter((_, index) => index % step === 0);
    }

    return sortedData;
  }, [rawData, cleanData, qaqcData, currentAttribute]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const rawValues = chartData.map(d => d[currentAttribute.rawKey]).filter(v => v != null);
    const cleanValues = chartData.map(d => d[currentAttribute.cleanKey]).filter(v => v != null);
    const qaqcValues = chartData.map(d => d[currentAttribute.qaqcKey]).filter(v => v != null);

    const calcStats = (values: number[]) => {
      if (values.length === 0) return { avg: 0, min: 0, max: 0, count: 0 };
      return {
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        count: values.length
      };
    };

    return {
      raw: calcStats(rawValues),
      clean: calcStats(cleanValues),
      qaqc: calcStats(qaqcValues)
    };
  }, [chartData, currentAttribute]);

  // Show loading skeleton
  if (isLoading) {
    return (
      <section id="analytics" className="py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-96 w-full" />
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section id="analytics" className="py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <Tabs defaultValue="raw" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="raw">Raw Data</TabsTrigger>
            <TabsTrigger value="clean">Clean Data</TabsTrigger>
            <TabsTrigger value="qaqc">QAQC Data</TabsTrigger>
          </TabsList>

          {/* Filters - Shared across all tabs */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Data Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Season Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Season</label>
                  <Select
                    value={selectedSeason?.id || ''}
                    onValueChange={(value) => {
                      const season = seasons.find(s => s.id === value);
                      setSelectedSeason(season);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select season..." />
                    </SelectTrigger>
                    <SelectContent>
                      {seasons.map(season => (
                        <SelectItem key={season.id} value={season.id}>
                          <div className="flex items-center gap-2">
                            <Database className="w-4 h-4" />
                            {season.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Attribute Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Attribute</label>
                  <Select
                    value={selectedAttribute}
                    onValueChange={setSelectedAttribute}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ATTRIBUTES.map(attr => {
                        const Icon = attr.icon;
                        return (
                          <SelectItem key={attr.id} value={attr.id}>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              {attr.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Locations</label>
                  <div className="border rounded-md p-4 max-h-48 overflow-y-auto">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 pb-2 border-b">
                        <Checkbox
                          id="select-all"
                          checked={selectedLocations.length === locations.length}
                          onCheckedChange={handleSelectAllLocations}
                        />
                        <label
                          htmlFor="select-all"
                          className="text-sm font-medium cursor-pointer"
                        >
                          Select All ({locations.length})
                        </label>
                      </div>
                      {locations.map(location => (
                        <div key={location.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={location.id}
                            checked={selectedLocations.includes(location.id)}
                            onCheckedChange={() => handleLocationToggle(location.id)}
                          />
                          <label
                            htmlFor={location.id}
                            className="text-sm cursor-pointer flex items-center gap-2"
                          >
                            <MapPin className="w-3 h-3" />
                            {location.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Raw Data Tab */}
          <TabsContent value="raw" className="space-y-8">
            <div className="text-center mb-8">
              <Badge variant="outline" className="mb-4">Raw Time Series Data</Badge>
              <h2 className="text-2xl font-bold mb-2">Unprocessed Sensor Data</h2>
              <p className="text-sm text-muted-foreground">
                Direct measurements from environmental sensors before any processing
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Raw Data Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {statistics.raw.avg.toFixed(2)} {currentAttribute.unit}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Range: {statistics.raw.min.toFixed(1)} - {statistics.raw.max.toFixed(1)} {currentAttribute.unit}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {statistics.raw.count} data points
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Raw Data: {currentAttribute.label}</span>
                  <Badge variant="outline">{selectedSeason?.name || 'No season selected'}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={500}>
                    <RechartsLineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis 
                        dataKey="dateLabel" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis 
                        label={{ value: `${currentAttribute.label} (${currentAttribute.unit})`, angle: -90, position: 'insideLeft' }}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '1px solid hsl(var(--border))' 
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey={currentAttribute.rawKey} 
                        stroke="#94a3b8" 
                        name="Raw Data"
                        dot={false}
                        strokeWidth={2}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
                    <Database className="w-16 h-16 mb-4 opacity-20" />
                    <p className="text-lg font-medium">No data available</p>
                    <p className="text-sm">Select a season and location to view raw data</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clean Data Tab */}
          <TabsContent value="clean" className="space-y-8">
            <div className="text-center mb-8">
              <Badge variant="outline" className="mb-4">Clean Time Series Data</Badge>
              <h2 className="text-2xl font-bold mb-2">Processed & Validated Data</h2>
              <p className="text-sm text-muted-foreground">
                Data after quality control processing and validation
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Clean Data Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {statistics.clean.avg.toFixed(2)} {currentAttribute.unit}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Range: {statistics.clean.min.toFixed(1)} - {statistics.clean.max.toFixed(1)} {currentAttribute.unit}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {statistics.clean.count} data points
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Clean Data: {currentAttribute.label}</span>
                  <Badge variant="outline">{selectedSeason?.name || 'No season selected'}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={500}>
                    <RechartsLineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis 
                        dataKey="dateLabel" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis 
                        label={{ value: `${currentAttribute.label} (${currentAttribute.unit})`, angle: -90, position: 'insideLeft' }}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '1px solid hsl(var(--border))' 
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey={currentAttribute.cleanKey} 
                        stroke="#3b82f6" 
                        name="Clean Data"
                        dot={false}
                        strokeWidth={2}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
                    <Database className="w-16 h-16 mb-4 opacity-20" />
                    <p className="text-lg font-medium">No data available</p>
                    <p className="text-sm">Select a season and location to view clean data</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* QAQC Data Tab */}
          <TabsContent value="qaqc" className="space-y-8">
            <div className="text-center mb-8">
              <Badge variant="outline" className="mb-4">QAQC Time Series Data</Badge>
              <h2 className="text-2xl font-bold mb-2">Quality Assured & Quality Controlled</h2>
              <p className="text-sm text-muted-foreground">
                Final verified data after complete quality assurance process
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  QAQC Data Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {statistics.qaqc.avg.toFixed(2)} {currentAttribute.unit}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Range: {statistics.qaqc.min.toFixed(1)} - {statistics.qaqc.max.toFixed(1)} {currentAttribute.unit}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {statistics.qaqc.count} data points
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>QAQC Data: {currentAttribute.label}</span>
                  <Badge variant="outline">{selectedSeason?.name || 'No season selected'}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={500}>
                    <RechartsLineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis 
                        dataKey="dateLabel" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis 
                        label={{ value: `${currentAttribute.label} (${currentAttribute.unit})`, angle: -90, position: 'insideLeft' }}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '1px solid hsl(var(--border))' 
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey={currentAttribute.qaqcKey} 
                        stroke="#10b981" 
                        name="QAQC Data"
                        dot={false}
                        strokeWidth={2}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
                    <Database className="w-16 h-16 mb-4 opacity-20" />
                    <p className="text-lg font-medium">No data available</p>
                    <p className="text-sm">Select a season and location to view QAQC data</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">
                Download Data for Analysis
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Export time series data in CSV or Excel format for further analysis in your preferred tools.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Button onClick={() => navigate('/data-download')} size="lg">
                  <Download className="w-4 h-4 mr-2" />
                  Download Data
                </Button>
                <Button variant="outline" onClick={() => navigate('/documentation')} size="lg">
                  View Documentation
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
