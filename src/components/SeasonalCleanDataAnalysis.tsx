import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Database, MapPin, Calendar, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { useSeasonalAnalyticsState } from '@/hooks/useSeasonalAnalytics';
import { useMemo, useCallback } from 'react';

const SeasonalCleanDataAnalysis = () => {
  const {
    seasons,
    locations,
    environmentalData,
    seasonalMetrics,
    selectedLocations,
    selectedSeason,
    setSelectedLocations,
    setSelectedSeason,
    isLoading
  } = useSeasonalAnalyticsState();

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

  // Process data for visualization
  const chartData = useMemo(() => {
    if (!environmentalData || environmentalData.length === 0) return [];

    const grouped = environmentalData.reduce((acc, item) => {
      const date = new Date(item.datetime);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          temperature: [],
          snow_depth: [],
          wind_speed: []
        };
      }
      
      if (item.temperature != null) acc[monthKey].temperature.push(item.temperature);
      if (item.snow_depth != null) acc[monthKey].snow_depth.push(item.snow_depth);
      if (item.wind_speed != null) acc[monthKey].wind_speed.push(item.wind_speed);
      
      return acc;
    }, {} as Record<string, any>);

    return Object.entries(grouped).map(([month, data]) => ({
      month,
      avgTemperature: data.temperature.length > 0 
        ? data.temperature.reduce((a: number, b: number) => a + b, 0) / data.temperature.length 
        : null,
      avgSnowDepth: data.snow_depth.length > 0
        ? data.snow_depth.reduce((a: number, b: number) => a + b, 0) / data.snow_depth.length
        : null,
      avgWindSpeed: data.wind_speed.length > 0
        ? data.wind_speed.reduce((a: number, b: number) => a + b, 0) / data.wind_speed.length
        : null
    })).sort((a, b) => a.month.localeCompare(b.month));
  }, [environmentalData]);

  // Radar chart data for location comparison
  const radarData = useMemo(() => {
    if (!seasonalMetrics || seasonalMetrics.length === 0) return [];

    return seasonalMetrics.map(metric => ({
      location: metric.location,
      temperature: metric.avgTemperature,
      snowDepth: metric.avgSnowDepth,
      windSpeed: metric.avgWindSpeed,
      dataQuality: (metric.dataPoints / 10000) * 100 // Normalize to 100
    }));
  }, [seasonalMetrics]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-96 w-full" />
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Seasonal Data Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Season Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Season
              </label>
              <Select
                value={selectedSeason || ''}
                onValueChange={setSelectedSeason}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select season..." />
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

            {/* Location Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Locations
              </label>
              <div className="border rounded-md p-4 max-h-48 overflow-y-auto">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 pb-2 border-b">
                    <Checkbox
                      id="select-all-seasonal"
                      checked={selectedLocations.length === locations.length}
                      onCheckedChange={handleSelectAllLocations}
                    />
                    <label
                      htmlFor="select-all-seasonal"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Select All ({locations.length})
                    </label>
                  </div>
                  {locations.map(location => (
                    <div key={location.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`seasonal-${location.id}`}
                        checked={selectedLocations.includes(location.id)}
                        onCheckedChange={() => handleLocationToggle(location.id)}
                      />
                      <label
                        htmlFor={`seasonal-${location.id}`}
                        className="text-sm cursor-pointer"
                      >
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

      {/* Seasonal Metrics Cards */}
      {seasonalMetrics && seasonalMetrics.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Temperature
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(seasonalMetrics.reduce((sum, m) => sum + m.avgTemperature, 0) / seasonalMetrics.length).toFixed(2)}°C
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Across {seasonalMetrics.length} location{seasonalMetrics.length !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Snow Depth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(seasonalMetrics.reduce((sum, m) => sum + m.avgSnowDepth, 0) / seasonalMetrics.length).toFixed(2)} cm
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Seasonal average
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Data Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {seasonalMetrics.reduce((sum, m) => sum + m.dataPoints, 0).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Total QAQC records
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Monthly Trends Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Monthly Environmental Trends
              </span>
              <Badge variant="outline">
                {seasons.find(s => s.id === selectedSeason)?.name || 'All Seasons'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis yAxisId="left" label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: 'Snow Depth (cm)', angle: 90, position: 'insideRight' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))'
                  }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="avgTemperature"
                  stroke="#ef4444"
                  name="Temperature (°C)"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgSnowDepth"
                  stroke="#3b82f6"
                  name="Snow Depth (cm)"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Location Comparison - Radar Chart */}
      {radarData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Location Performance Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="location" />
                <PolarRadiusAxis />
                <Radar
                  name="Data Quality %"
                  dataKey="dataQuality"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.6}
                />
                <Legend />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))'
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* No Data Message */}
      {!isLoading && (!chartData || chartData.length === 0) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-96 text-muted-foreground">
            <Database className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-medium">No seasonal data available</p>
            <p className="text-sm">Select a season and locations to view QAQC analytics</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SeasonalCleanDataAnalysis;
