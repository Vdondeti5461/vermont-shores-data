import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Area, ComposedChart } from 'recharts';
import { Loader2, MapPin, TrendingUp, RefreshCw, Clock, Radio, GitCompare } from 'lucide-react';
import { DatabaseType, TimeSeriesDataPoint, fetchMultiQualityComparison } from '@/services/realTimeAnalyticsService';
import { getLocationOptions } from '@/lib/locationData';
import { useToast } from '@/hooks/use-toast';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mapping of attributes to display names and units
const ATTRIBUTES = [
  { value: 'snow_depth_cm', label: 'Snow Depth', unit: 'cm' },
  { value: 'air_temperature_avg_c', label: 'Air Temperature Average', unit: '°C' },
  { value: 'relative_humidity_percent', label: 'Relative Humidity', unit: '%' },
] as const;

// Time range presets for real-time monitoring (10-min data intervals)
const TIME_RANGES = [
  { value: '1h', label: '1 Hour', hours: 1 },
  { value: '6h', label: '6 Hours', hours: 6 },
  { value: '12h', label: '12 Hours', hours: 12 },
  { value: '24h', label: '24 Hours', hours: 24 },
  { value: '1w', label: '1 Week', hours: 24 * 7 },
  { value: '1m', label: '1 Month', hours: 24 * 30 },
] as const;

// Auto-refresh interval (10 minutes = 600000ms to match data collection)
const AUTO_REFRESH_INTERVAL = 10 * 60 * 1000;

// Only Raw and Clean data for real-time view (QAQC requires manual review)
const COMPARISON_DATABASES: DatabaseType[] = [
  'CRRELS2S_raw_data_ingestion',
  'CRRELS2S_stage_clean_data',
];

const DATABASE_COLORS: Record<string, string> = {
  'CRRELS2S_raw_data_ingestion': 'hsl(0, 84%, 60%)',    // Red
  'CRRELS2S_stage_clean_data': 'hsl(217, 91%, 60%)',   // Blue
  'difference': 'hsl(142, 71%, 45%)',                    // Green for difference
};

const DATABASE_LABELS: Record<string, string> = {
  'CRRELS2S_raw_data_ingestion': 'Raw Data',
  'CRRELS2S_stage_clean_data': 'Clean Data',
  'difference': 'Difference (Raw - Clean)',
};

// LTTB downsampling for performance
const MAX_DISPLAY_POINTS = 500;

function lttbDownsample<T>(data: T[], threshold: number, valueKey: string): T[] {
  if (data.length <= threshold || threshold < 3) return data;

  const sampled: T[] = [data[0]];
  const bucketSize = (data.length - 2) / (threshold - 2);

  let a = 0;
  for (let i = 0; i < threshold - 2; i++) {
    const avgRangeStart = Math.floor((i + 1) * bucketSize) + 1;
    const avgRangeEnd = Math.min(Math.floor((i + 2) * bucketSize) + 1, data.length);

    let avgX = 0, avgY = 0, count = 0;
    for (let j = avgRangeStart; j < avgRangeEnd; j++) {
      avgX += j;
      const val = (data[j] as any)[valueKey];
      avgY += typeof val === 'number' ? val : 0;
      count++;
    }
    avgX /= count;
    avgY /= count;

    const rangeStart = Math.floor(i * bucketSize) + 1;
    const rangeEnd = Math.floor((i + 1) * bucketSize) + 1;

    let maxArea = -1, maxAreaPoint = rangeStart;
    const pointAX = a;
    const pointAY = ((data[a] as any)[valueKey] as number) || 0;

    for (let j = rangeStart; j < rangeEnd; j++) {
      const val = (data[j] as any)[valueKey];
      const area = Math.abs((pointAX - avgX) * (val - pointAY) - (pointAX - j) * (avgY - pointAY)) * 0.5;
      if (area > maxArea) {
        maxArea = area;
        maxAreaPoint = j;
      }
    }

    sampled.push(data[maxAreaPoint]);
    a = maxAreaPoint;
  }

  sampled.push(data[data.length - 1]);
  return sampled;
}

// Format EST timestamp for display
function formatESTTime(date: Date): string {
  return date.toLocaleString('en-US', {
    timeZone: 'America/New_York',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

// Get current time in EST
function getCurrentEST(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
}

// Calculate time range dates (in EST, returns ISO strings for API)
function getTimeRangeDates(hours: number): { startDate: string; endDate: string } {
  const now = new Date();
  const endDate = now.toISOString();
  const startDate = new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();
  return { startDate, endDate };
}

// Data source options
type DataSourceType = 'both' | 'raw' | 'clean';

const DATA_SOURCE_OPTIONS: { value: DataSourceType; label: string }[] = [
  { value: 'both', label: 'Both' },
  { value: 'raw', label: 'Raw Data' },
  { value: 'clean', label: 'Clean Data' },
];

export const RealTimeAnalytics = () => {
  const { toast } = useToast();
  const locations = getLocationOptions();
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedLocation2, setSelectedLocation2] = useState<string>('');
  const [compareLocations, setCompareLocations] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState<string>('');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('24h');
  const [selectedDataSource, setSelectedDataSource] = useState<DataSourceType>('both');
  const [isLoading, setIsLoading] = useState(false);
  const [comparisonData, setComparisonData] = useState<{ database: DatabaseType; data: TimeSeriesDataPoint[] }[]>([]);
  const [comparisonData2, setComparisonData2] = useState<{ database: DatabaseType; data: TimeSeriesDataPoint[] }[]>([]);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const autoRefreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  const TABLE = 'raw_env_core_observations';

  // Get active databases based on data source selection
  const getActiveDataSources = useCallback((): DatabaseType[] => {
    switch (selectedDataSource) {
      case 'raw':
        return ['CRRELS2S_raw_data_ingestion'];
      case 'clean':
        return ['CRRELS2S_stage_clean_data'];
      default:
        return COMPARISON_DATABASES;
    }
  }, [selectedDataSource]);

  // Get time range in hours
  const getTimeRangeHours = useCallback(() => {
    const range = TIME_RANGES.find(r => r.value === selectedTimeRange);
    return range?.hours || 24;
  }, [selectedTimeRange]);

  // Load data function for a single location
  const loadLocationData = useCallback(async (
    location: string,
    setData: (data: { database: DatabaseType; data: TimeSeriesDataPoint[] }[]) => void,
    signal: AbortSignal
  ) => {
    const hours = getTimeRangeHours();
    const { startDate, endDate } = getTimeRangeDates(hours);
    const activeSources = getActiveDataSources();

    console.log(`[RealTime] Fetching data for ${location} from ${startDate} to ${endDate}, sources: ${activeSources.join(', ')}`);

    const data = await fetchMultiQualityComparison(
      activeSources,
      TABLE,
      location,
      [selectedAttribute],
      startDate,
      endDate,
      signal
    );
    
    setData(data);
    return data;
  }, [selectedAttribute, getTimeRangeHours, getActiveDataSources]);

  // Load data function
  const loadData = useCallback(async (showToast = true) => {
    if (!selectedLocation || !selectedAttribute) return;

    // Cancel any pending request
    if (abortController) {
      abortController.abort();
    }

    const controller = new AbortController();
    setAbortController(controller);
    setIsLoading(true);

    try {
      // Fetch location 1 data
      const data1Promise = loadLocationData(selectedLocation, setComparisonData, controller.signal);
      
      // Fetch location 2 data if comparing
      let data2Promise: Promise<any> | null = null;
      if (compareLocations && selectedLocation2) {
        data2Promise = loadLocationData(selectedLocation2, setComparisonData2, controller.signal);
      } else {
        setComparisonData2([]);
      }

      const [data1, data2] = await Promise.all([
        data1Promise,
        data2Promise || Promise.resolve(null)
      ]);
      
      if (!controller.signal.aborted) {
        setLastRefresh(new Date());
        
        // Check if data is available
        const hasData = data1.some((d: any) => d.data.length > 0) || 
                        (data2 && data2.some((d: any) => d.data.length > 0));
        if (!hasData && showToast) {
          toast({
            title: "No Data Available",
            description: "Real-time data ingestion is not yet active. Data will appear here once sensors start streaming.",
          });
        }
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Error loading comparison data:', error);
        if (showToast) {
          toast({
            title: "Error",
            description: "Failed to load time series data. Please try again.",
            variant: "destructive",
          });
        }
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [selectedLocation, selectedLocation2, selectedAttribute, selectedTimeRange, compareLocations, toast, abortController, loadLocationData]);

  // Auto-load when selections change
  useEffect(() => {
    if (selectedLocation && selectedAttribute) {
      loadData();
    }
    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, [selectedLocation, selectedLocation2, selectedAttribute, selectedTimeRange, compareLocations, selectedDataSource]);

  // Auto-refresh timer
  useEffect(() => {
    if (autoRefreshTimerRef.current) {
      clearInterval(autoRefreshTimerRef.current);
    }

    if (autoRefresh && selectedLocation && selectedAttribute) {
      autoRefreshTimerRef.current = setInterval(() => {
        console.log('[RealTime] Auto-refreshing data...');
        loadData(false); // Don't show toast on auto-refresh
      }, AUTO_REFRESH_INTERVAL);
    }

    return () => {
      if (autoRefreshTimerRef.current) {
        clearInterval(autoRefreshTimerRef.current);
      }
    };
  }, [autoRefresh, selectedLocation, selectedAttribute, loadData]);

  // Prepare chart data with LTTB sampling
  const prepareChartData = useCallback(() => {
    if (!comparisonData || comparisonData.length === 0) return [];

    const allTimestamps = new Set<string>();
    comparisonData.forEach(({ data }) => {
      data.forEach((point) => allTimestamps.add(point.timestamp));
    });

    const sortedTimestamps = Array.from(allTimestamps).sort();
    
    // Format display time based on time range (EST timezone)
    const hours = getTimeRangeHours();
    const formatTime = (timestamp: string) => {
      const date = new Date(timestamp);
      if (hours <= 24) {
        // For short ranges, show time only (EST)
        return date.toLocaleString('en-US', { 
          timeZone: 'America/New_York',
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
      } else if (hours <= 24 * 7) {
        // For week, show day + time (EST)
        return date.toLocaleString('en-US', { 
          timeZone: 'America/New_York',
          weekday: 'short', 
          hour: '2-digit',
          hour12: false
        });
      } else {
        // For month, show date (EST)
        return date.toLocaleString('en-US', { 
          timeZone: 'America/New_York',
          month: 'short', 
          day: 'numeric' 
        });
      }
    };

    const rawData = sortedTimestamps.map((timestamp) => {
      const point: any = { 
        timestamp,
        displayTime: formatTime(timestamp)
      };
      
      comparisonData.forEach(({ database, data }) => {
        const dataPoint = data.find((d) => d.timestamp === timestamp);
        if (dataPoint) {
          const attrKey = Object.keys(dataPoint).find(
            k => k.toLowerCase() === selectedAttribute.toLowerCase()
          );
          point[database] = attrKey ? dataPoint[attrKey] : null;
        } else {
          point[database] = null;
        }
      });
      
      return point;
    });

    if (rawData.length > MAX_DISPLAY_POINTS) {
      return lttbDownsample(rawData, MAX_DISPLAY_POINTS, COMPARISON_DATABASES[0]);
    }
    
    return rawData;
  }, [comparisonData, selectedAttribute, getTimeRangeHours]);

  const chartData = prepareChartData();
  
  // Prepare chart data for location 2 (when comparing)
  const prepareChartData2 = useCallback(() => {
    if (!comparisonData2 || comparisonData2.length === 0) return [];

    const allTimestamps = new Set<string>();
    comparisonData2.forEach(({ data }) => {
      data.forEach((point) => allTimestamps.add(point.timestamp));
    });

    const sortedTimestamps = Array.from(allTimestamps).sort();
    const hours = getTimeRangeHours();
    const formatTime = (timestamp: string) => {
      const date = new Date(timestamp);
      if (hours <= 24) {
        return date.toLocaleString('en-US', { 
          timeZone: 'America/New_York',
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
      } else if (hours <= 24 * 7) {
        return date.toLocaleString('en-US', { 
          timeZone: 'America/New_York',
          weekday: 'short', 
          hour: '2-digit',
          hour12: false
        });
      } else {
        return date.toLocaleString('en-US', { 
          timeZone: 'America/New_York',
          month: 'short', 
          day: 'numeric' 
        });
      }
    };

    const rawData = sortedTimestamps.map((timestamp) => {
      const point: any = { 
        timestamp,
        displayTime: formatTime(timestamp)
      };
      
      comparisonData2.forEach(({ database, data }) => {
        const dataPoint = data.find((d) => d.timestamp === timestamp);
        if (dataPoint) {
          const attrKey = Object.keys(dataPoint).find(
            k => k.toLowerCase() === selectedAttribute.toLowerCase()
          );
          point[database] = attrKey ? dataPoint[attrKey] : null;
        } else {
          point[database] = null;
        }
      });
      
      return point;
    });

    if (rawData.length > MAX_DISPLAY_POINTS) {
      return lttbDownsample(rawData, MAX_DISPLAY_POINTS, COMPARISON_DATABASES[0]);
    }
    
    return rawData;
  }, [comparisonData2, selectedAttribute, getTimeRangeHours]);

  const chartData2 = prepareChartData2();
  
  // Prepare comparison data showing difference (Raw - Clean)
  const comparisonChartData = chartData.map((point: any) => {
    const rawVal = point['CRRELS2S_raw_data_ingestion'];
    const cleanVal = point['CRRELS2S_stage_clean_data'];
    const difference = (typeof rawVal === 'number' && typeof cleanVal === 'number')
      ? rawVal - cleanVal
      : null;
    return {
      ...point,
      difference,
    };
  });

  const selectedAttributeInfo = ATTRIBUTES.find(a => a.value === selectedAttribute);
  const selectedTimeRangeInfo = TIME_RANGES.find(r => r.value === selectedTimeRange);
  const location1Name = locations.find(l => l.id === selectedLocation)?.name || selectedLocation;
  const location2Name = locations.find(l => l.id === selectedLocation2)?.name || selectedLocation2;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Real-Time Monitoring</h2>
            <p className="text-muted-foreground">
              Live environmental data from sensors (10-minute intervals, EST)
            </p>
          </div>
        </div>
        
        {/* Auto-refresh toggle & status */}
        <div className="flex items-center gap-4">
          {lastRefresh && (
            <span className="text-xs text-muted-foreground">
              Last updated: {formatESTTime(lastRefresh)} EST
            </span>
          )}
          <div className="flex items-center gap-2">
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
            <Label htmlFor="auto-refresh" className="text-sm flex items-center gap-1">
              <Radio className={`h-3 w-3 ${autoRefresh ? 'text-green-500 animate-pulse' : 'text-muted-foreground'}`} />
              Auto-refresh
            </Label>
          </div>
        </div>
      </div>

      {/* Time Range Toggle */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time Range
          </CardTitle>
          <CardDescription>
            Select the time window for real-time data (from current time going back)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ToggleGroup 
            type="single" 
            value={selectedTimeRange}
            onValueChange={(value) => value && setSelectedTimeRange(value)}
            className="flex flex-wrap justify-start gap-2"
          >
            {TIME_RANGES.map((range) => (
              <ToggleGroupItem 
                key={range.value} 
                value={range.value}
                variant="outline"
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                {range.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <p className="text-xs text-muted-foreground mt-2">
            All times are in Eastern Standard Time (EST)
          </p>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Data Selection</CardTitle>
          <CardDescription>
            Select a location and measurement attribute to view real-time data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Compare Locations Toggle */}
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border">
            <Switch
              id="compare-locations"
              checked={compareLocations}
              onCheckedChange={(checked) => {
                setCompareLocations(checked);
                if (!checked) {
                  setSelectedLocation2('');
                  setComparisonData2([]);
                }
              }}
            />
            <Label htmlFor="compare-locations" className="text-sm flex items-center gap-2 cursor-pointer">
              <GitCompare className="h-4 w-4" />
              Compare Two Locations
            </Label>
          </div>

          <div className={`grid gap-4 ${compareLocations ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
            {/* Location 1 Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {compareLocations ? 'Location 1' : 'Location'}
              </Label>
              <Select
                value={selectedLocation}
                onValueChange={setSelectedLocation}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location 2 Selection (when comparing) */}
            {compareLocations && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location 2
                </Label>
                <Select
                  value={selectedLocation2}
                  onValueChange={setSelectedLocation2}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select second location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations
                      .filter(loc => loc.id !== selectedLocation)
                      .map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Attribute Selection */}
            <div className="space-y-2">
              <Label>Attribute</Label>
              <Select
                value={selectedAttribute}
                onValueChange={setSelectedAttribute}
                disabled={!selectedLocation}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select attribute" />
                </SelectTrigger>
                <SelectContent>
                  {ATTRIBUTES.map((attr) => (
                    <SelectItem key={attr.value} value={attr.value}>
                      {attr.label} ({attr.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Data Source Selection */}
          <div className="space-y-2">
            <Label className="text-sm">Data Source</Label>
            <ToggleGroup 
              type="single" 
              value={selectedDataSource}
              onValueChange={(value) => value && setSelectedDataSource(value as DataSourceType)}
              className="flex justify-start gap-1"
            >
              {DATA_SOURCE_OPTIONS.map((option) => (
                <ToggleGroupItem 
                  key={option.value} 
                  value={option.value}
                  variant="outline"
                  size="sm"
                  className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  {option.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          {/* Refresh Button */}
          {selectedLocation && selectedAttribute && (
            <Button 
              onClick={() => loadData(true)} 
              variant="outline" 
              size="sm"
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          )}

          {/* Info Display */}
          {selectedLocation && selectedAttribute && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-3">
                Displaying <span className="font-semibold text-foreground">{selectedAttributeInfo?.label}</span> for{' '}
                <span className="font-semibold text-foreground">{locations.find(l => l.id === selectedLocation)?.name}</span>
                {compareLocations && selectedLocation2 && (
                  <>
                    {' vs '}
                    <span className="font-semibold text-foreground">{locations.find(l => l.id === selectedLocation2)?.name}</span>
                  </>
                )}
                {' '}— <span className="font-semibold text-foreground">{selectedTimeRangeInfo?.label}</span>
              </p>
              <div className="flex flex-wrap gap-4">
                {getActiveDataSources().map((db) => (
                  <div key={db} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: DATABASE_COLORS[db] }}
                    />
                    <span className="text-xs font-medium">{DATABASE_LABELS[db]}</span>
                  </div>
                ))}
              </div>
              {autoRefresh && (
                <Badge variant="outline" className="mt-3 text-xs">
                  <Radio className="h-2 w-2 mr-1 text-green-500 animate-pulse" />
                  Auto-refreshes every 10 minutes
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center p-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading real-time data...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Side-by-side Location Comparison */}
      {!isLoading && compareLocations && selectedLocation && selectedLocation2 && selectedAttribute && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Location 1 Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                {location1Name}
              </CardTitle>
              <CardDescription>
                {selectedAttributeInfo?.label} — {selectedTimeRangeInfo?.label}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis
                      dataKey="displayTime"
                      angle={-45}
                      textAnchor="end"
                      height={70}
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        padding: '8px'
                      }}
                      formatter={(value: any, name: string) => [
                        `${typeof value === 'number' ? value.toFixed(2) : value} ${selectedAttributeInfo?.unit || ''}`,
                        DATABASE_LABELS[name]
                      ]}
                    />
                    <Legend formatter={(value) => DATABASE_LABELS[value]} />
                    {getActiveDataSources().map((database) => (
                      <Line
                        key={database}
                        type="monotone"
                        dataKey={database}
                        stroke={DATABASE_COLORS[database]}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[350px]">
                  <p className="text-muted-foreground text-sm">No data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location 2 Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                {location2Name}
              </CardTitle>
              <CardDescription>
                {selectedAttributeInfo?.label} — {selectedTimeRangeInfo?.label}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartData2.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={chartData2} margin={{ top: 10, right: 20, left: 10, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis
                      dataKey="displayTime"
                      angle={-45}
                      textAnchor="end"
                      height={70}
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        padding: '8px'
                      }}
                      formatter={(value: any, name: string) => [
                        `${typeof value === 'number' ? value.toFixed(2) : value} ${selectedAttributeInfo?.unit || ''}`,
                        DATABASE_LABELS[name]
                      ]}
                    />
                    <Legend formatter={(value) => DATABASE_LABELS[value]} />
                    {getActiveDataSources().map((database) => (
                      <Line
                        key={database}
                        type="monotone"
                        dataKey={database}
                        stroke={DATABASE_COLORS[database]}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[350px]">
                  <p className="text-muted-foreground text-sm">No data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Single Location View */}
      {!isLoading && !compareLocations && selectedLocation && selectedAttribute && chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {selectedAttributeInfo?.label} — {selectedTimeRangeInfo?.label}
            </CardTitle>
            <CardDescription>
              {location1Name} | Real-Time Monitoring (EST)
              {chartData.length >= MAX_DISPLAY_POINTS && (
                <span className="ml-2 text-xs text-muted-foreground">
                  (Sampled to {MAX_DISPLAY_POINTS} points)
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overlay" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="overlay" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Raw vs Clean
                </TabsTrigger>
                <TabsTrigger value="comparison" className="gap-2">
                  <GitCompare className="h-4 w-4" />
                  Comparison
                </TabsTrigger>
              </TabsList>

              {/* Raw vs Clean Overlay */}
              <TabsContent value="overlay">
                <ResponsiveContainer width="100%" height={500}>
                  <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="hsl(var(--border))" 
                      opacity={0.3} 
                    />
                    <XAxis
                      dataKey="displayTime"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      label={{ 
                        value: selectedAttributeInfo?.unit || '', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { fill: 'hsl(var(--muted-foreground))' }
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        padding: '12px'
                      }}
                      labelFormatter={(label, payload) => {
                        if (payload && payload.length > 0) {
                          const timestamp = payload[0]?.payload?.timestamp;
                          if (timestamp) {
                            return new Date(timestamp).toLocaleString('en-US', {
                              timeZone: 'America/New_York',
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            }) + ' EST';
                          }
                        }
                        return label;
                      }}
                      formatter={(value: any, name: string) => [
                        `${typeof value === 'number' ? value.toFixed(2) : value} ${selectedAttributeInfo?.unit || ''}`,
                        DATABASE_LABELS[name]
                      ]}
                    />
                    <Legend 
                      formatter={(value) => DATABASE_LABELS[value]}
                      wrapperStyle={{ paddingTop: '20px' }}
                    />
                    {getActiveDataSources().map((database) => (
                      <Line
                        key={database}
                        type="monotone"
                        dataKey={database}
                        name={database}
                        stroke={DATABASE_COLORS[database]}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>

              {/* Comparison View - Shows difference and both series */}
              <TabsContent value="comparison">
                <div className="space-y-4">
                  {/* Difference Chart */}
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <GitCompare className="h-4 w-4 text-muted-foreground" />
                      Difference (Raw − Clean) — Data Quality Impact
                    </h4>
                    <ResponsiveContainer width="100%" height={250}>
                      <ComposedChart data={comparisonChartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                        <CartesianGrid 
                          strokeDasharray="3 3" 
                          stroke="hsl(var(--border))" 
                          opacity={0.3} 
                        />
                        <XAxis
                          dataKey="displayTime"
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          stroke="hsl(var(--muted-foreground))"
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                        />
                        <YAxis
                          stroke="hsl(var(--muted-foreground))"
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                          label={{ 
                            value: `Δ ${selectedAttributeInfo?.unit || ''}`, 
                            angle: -90, 
                            position: 'insideLeft',
                            style: { fill: 'hsl(var(--muted-foreground))' }
                          }}
                        />
                        <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            padding: '12px'
                          }}
                          labelFormatter={(label, payload) => {
                            if (payload && payload.length > 0) {
                              const timestamp = payload[0]?.payload?.timestamp;
                              if (timestamp) {
                                return new Date(timestamp).toLocaleString('en-US', {
                                  timeZone: 'America/New_York',
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: true
                                }) + ' EST';
                              }
                            }
                            return label;
                          }}
                          formatter={(value: any, name: string) => [
                            `${typeof value === 'number' ? value.toFixed(3) : value} ${selectedAttributeInfo?.unit || ''}`,
                            name === 'difference' ? 'Difference (Raw − Clean)' : DATABASE_LABELS[name]
                          ]}
                        />
                        <Area
                          type="monotone"
                          dataKey="difference"
                          name="difference"
                          stroke={DATABASE_COLORS['difference']}
                          fill={DATABASE_COLORS['difference']}
                          fillOpacity={0.3}
                          strokeWidth={2}
                          isAnimationActive={false}
                          connectNulls
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Positive values indicate raw readings were higher than cleaned data; negative values indicate lower raw readings.
                      Large deviations may indicate sensor noise removed during cleaning.
                    </p>
                  </div>

                  {/* Side-by-side comparison info */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DATABASE_COLORS['CRRELS2S_raw_data_ingestion'] }} />
                        <span className="text-sm font-medium">Raw Data</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Unprocessed sensor readings directly from instruments
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DATABASE_COLORS['CRRELS2S_stage_clean_data'] }} />
                        <span className="text-sm font-medium">Clean Data</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Automated quality control removes outliers and sensor errors
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && (!selectedLocation || !selectedAttribute) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Select a location and attribute to view real-time data
            </p>
          </CardContent>
        </Card>
      )}

      {/* No Data State - Single Location */}
      {!isLoading && !compareLocations && selectedLocation && selectedAttribute && chartData.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-12">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Real-Time Data Coming Soon</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Real-time data ingestion is not yet active for this location. 
              Once sensors begin streaming data (every 10 minutes), it will appear here automatically.
            </p>
            {autoRefresh && (
              <Badge variant="outline" className="mt-4">
                <Radio className="h-2 w-2 mr-1 text-green-500 animate-pulse" />
                Monitoring for new data...
              </Badge>
            )}
          </CardContent>
        </Card>
      )}

      {/* No Data State - Comparing Locations */}
      {!isLoading && compareLocations && selectedLocation && selectedLocation2 && selectedAttribute && chartData.length === 0 && chartData2.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-12">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Real-Time Data Coming Soon</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Real-time data ingestion is not yet active for these locations. 
              Once sensors begin streaming data (every 10 minutes), it will appear here automatically.
            </p>
            {autoRefresh && (
              <Badge variant="outline" className="mt-4">
                <Radio className="h-2 w-2 mr-1 text-green-500 animate-pulse" />
                Monitoring for new data...
              </Badge>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
