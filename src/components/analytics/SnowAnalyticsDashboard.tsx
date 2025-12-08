import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Brush
} from 'recharts';
import { 
  MapPin, Download, Settings2, Eye, EyeOff, 
  ZoomOut, Calendar, Snowflake, Droplets, Scale, Play, AlertCircle
} from 'lucide-react';
import { DatabaseType, TableType, TimeSeriesDataPoint, fetchLocations, fetchMultiQualityComparison } from '@/services/realTimeAnalyticsService';
import { useToast } from '@/hooks/use-toast';
import { AnalyticsStatisticsPanel } from './AnalyticsStatisticsPanel';
import { DateRangeFilter } from './DateRangeFilter';

// Snow-specific attributes with metadata
const SNOW_ATTRIBUTES = [
  { value: 'snow_depth_cm', label: 'Snow Depth', unit: 'cm', icon: Snowflake, color: 'hsl(200, 80%, 50%)' },
  { value: 'snow_water_equivalent_mm', label: 'Snow Water Equivalent (SWE)', unit: 'mm', icon: Droplets, color: 'hsl(210, 90%, 55%)' },
  { value: 'snowpack_density_kg_m3', label: 'Snowpack Density', unit: 'kg/m³', icon: Scale, color: 'hsl(220, 70%, 60%)' },
  { value: 'ice_content_percent', label: 'Ice Content', unit: '%', icon: Snowflake, color: 'hsl(190, 85%, 45%)' },
  { value: 'water_content_percent', label: 'Water Content', unit: '%', icon: Droplets, color: 'hsl(205, 75%, 55%)' },
] as const;

// Three databases for comparison
const COMPARISON_DATABASES: DatabaseType[] = [
  'CRRELS2S_raw_data_ingestion',
  'CRRELS2S_stage_clean_data',
  'CRRELS2S_stage_qaqc_data',
];

const DATABASE_COLORS: Record<DatabaseType, string> = {
  'CRRELS2S_raw_data_ingestion': 'hsl(0, 75%, 55%)',
  'CRRELS2S_stage_clean_data': 'hsl(217, 85%, 55%)',
  'CRRELS2S_stage_qaqc_data': 'hsl(142, 70%, 42%)',
  'CRRELS2S_seasonal_qaqc_data': 'hsl(280, 70%, 55%)',
};

const DATABASE_LABELS: Record<DatabaseType, string> = {
  'CRRELS2S_raw_data_ingestion': 'Raw Data',
  'CRRELS2S_stage_clean_data': 'Clean Data',
  'CRRELS2S_stage_qaqc_data': 'QAQC Data',
  'CRRELS2S_seasonal_qaqc_data': 'Seasonal QAQC',
};

// Maximum data points to display for performance
const MAX_DISPLAY_POINTS = 500;

interface ChartDataPoint {
  timestamp: string;
  displayTime: string;
  [key: string]: string | number | null;
}

// Sample data to reduce points for chart performance
function sampleData<T>(data: T[], maxPoints: number): T[] {
  if (data.length <= maxPoints) return data;
  
  const step = Math.ceil(data.length / maxPoints);
  const sampled: T[] = [];
  
  for (let i = 0; i < data.length; i += step) {
    sampled.push(data[i]);
  }
  
  // Always include the last point
  if (sampled[sampled.length - 1] !== data[data.length - 1]) {
    sampled.push(data[data.length - 1]);
  }
  
  return sampled;
}

export const SnowAnalyticsDashboard = () => {
  const { toast } = useToast();
  
  // State
  const [locations, setLocations] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedAttribute, setSelectedAttribute] = useState<string>('snow_depth_cm');
  const [isLoading, setIsLoading] = useState(false);
  const [isLocationsLoading, setIsLocationsLoading] = useState(true);
  const [comparisonData, setComparisonData] = useState<{ database: DatabaseType; data: TimeSeriesDataPoint[] }[]>([]);
  const [hasLoadedData, setHasLoadedData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // View settings
  const [viewMode, setViewMode] = useState<'interactive' | 'scientific'>('interactive');
  const [showGrid, setShowGrid] = useState(true);
  const [showDataPoints, setShowDataPoints] = useState(false); // Disabled by default for performance
  const [visibleDatabases, setVisibleDatabases] = useState<Set<DatabaseType>>(new Set(COMPARISON_DATABASES));
  
  // Date range
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  // Zoom state for interactive mode
  const [zoomedData, setZoomedData] = useState<ChartDataPoint[] | null>(null);
  
  // Abort controller for cancelling requests
  const abortControllerRef = useRef<AbortController | null>(null);

  const TABLE: TableType = 'raw_env_core_observations';

  // Fetch locations on mount - uses raw_data database to get location list
  useEffect(() => {
    const loadLocations = async () => {
      setIsLocationsLoading(true);
      try {
        const locs = await fetchLocations('CRRELS2S_raw_data_ingestion', TABLE);
        setLocations(locs);
        setError(null);
      } catch (err) {
        console.error('[SnowAnalytics] Error loading locations:', err);
        setError('Failed to connect to data server. Please try again later.');
        toast({
          title: "Connection Error",
          description: "Failed to load locations. Please check API connection.",
          variant: "destructive",
        });
      } finally {
        setIsLocationsLoading(false);
      }
    };
    loadLocations();
  }, [toast]);

  // Load data function - called explicitly by user
  const loadData = useCallback(async () => {
    if (!selectedLocation || !selectedAttribute) {
      toast({
        title: "Selection Required",
        description: "Please select a location and attribute first.",
        variant: "destructive",
      });
      return;
    }

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setZoomedData(null);
    setError(null);
    
    try {
      const data = await fetchMultiQualityComparison(
        COMPARISON_DATABASES,
        TABLE,
        selectedLocation,
        [selectedAttribute],
        startDate || undefined,
        endDate || undefined
      );
      
      setComparisonData(data);
      setHasLoadedData(true);
      
      const totalPoints = data.reduce((sum, d) => sum + d.data.length, 0);
      if (totalPoints === 0) {
        toast({
          title: "No Data",
          description: "No data found for the selected filters.",
        });
      } else {
        toast({
          title: "Data Loaded",
          description: `Loaded ${totalPoints} data points across ${data.length} databases.`,
        });
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('[SnowAnalytics] Error loading data:', err);
        setError('Failed to load time series data.');
        toast({
          title: "Data Error",
          description: "Failed to load time series data.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedLocation, selectedAttribute, startDate, endDate, toast]);

  // Prepare chart data with sampling for performance
  const chartData = useMemo(() => {
    if (!comparisonData || comparisonData.length === 0) return [];

    const allTimestamps = new Set<string>();
    comparisonData.forEach(({ data }) => {
      data.forEach((point) => allTimestamps.add(point.timestamp));
    });

    const sortedTimestamps = Array.from(allTimestamps).sort();
    
    const fullData = sortedTimestamps.map((timestamp) => {
      const date = new Date(timestamp);
      const point: ChartDataPoint = { 
        timestamp,
        displayTime: viewMode === 'scientific' 
          ? date.toISOString().split('T')[0]
          : date.toLocaleString('en-US', { 
              month: 'short', 
              day: 'numeric',
              hour: '2-digit',
            })
      };
      
      comparisonData.forEach(({ database, data }) => {
        const dataPoint = data.find((d) => d.timestamp === timestamp);
        point[database] = dataPoint ? (dataPoint[selectedAttribute] as number | null) : null;
      });
      
      return point;
    });

    // Sample data if too large
    return sampleData(fullData, MAX_DISPLAY_POINTS);
  }, [comparisonData, selectedAttribute, viewMode]);

  // Get data to display (zoomed or full)
  const displayData = zoomedData || chartData;
  
  // Total raw data points (before sampling)
  const totalRawPoints = useMemo(() => {
    return comparisonData.reduce((sum, d) => sum + d.data.length, 0);
  }, [comparisonData]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const stats: Record<DatabaseType, {
      mean: number;
      min: number;
      max: number;
      stdDev: number;
      count: number;
      completeness: number;
    }> = {} as any;

    COMPARISON_DATABASES.forEach((db) => {
      const values = displayData
        .map(d => d[db] as number)
        .filter(v => v !== null && v !== undefined && !isNaN(v));
      
      const count = values.length;
      const total = displayData.length;
      const mean = count > 0 ? values.reduce((a, b) => a + b, 0) / count : 0;
      const min = count > 0 ? Math.min(...values) : 0;
      const max = count > 0 ? Math.max(...values) : 0;
      const variance = count > 0 
        ? values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / count 
        : 0;
      const stdDev = Math.sqrt(variance);
      const completeness = total > 0 ? (count / total) * 100 : 0;

      stats[db] = { mean, min, max, stdDev, count, completeness };
    });

    return stats;
  }, [displayData]);

  // Toggle database visibility
  const toggleDatabase = (db: DatabaseType) => {
    setVisibleDatabases(prev => {
      const next = new Set(prev);
      if (next.has(db)) {
        if (next.size > 1) next.delete(db);
      } else {
        next.add(db);
      }
      return next;
    });
  };

  const resetZoom = () => {
    setZoomedData(null);
  };

  // Export chart as PNG
  const exportChart = useCallback(() => {
    toast({
      title: "Export Started",
      description: "Chart export functionality coming soon.",
    });
  }, [toast]);

  const selectedAttributeInfo = SNOW_ATTRIBUTES.find(a => a.value === selectedAttribute);
  const locationName = locations.find(l => l.id === selectedLocation)?.name || selectedLocation;
  const isSampled = totalRawPoints > MAX_DISPLAY_POINTS;

  return (
    <div className="space-y-6">
      {/* Error State */}
      {error && !isLocationsLoading && (
        <Card className="border-destructive">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Controls Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filter Card */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings2 className="w-5 h-5" />
              Data Selection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Location */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <MapPin className="h-4 w-4 text-primary" />
                  Location
                </Label>
                {isLocationsLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
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
                )}
              </div>

              {/* Attribute */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Snowflake className="h-4 w-4 text-primary" />
                  Snow Metric
                </Label>
                <Select value={selectedAttribute} onValueChange={setSelectedAttribute}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select metric" />
                  </SelectTrigger>
                  <SelectContent>
                    {SNOW_ATTRIBUTES.map((attr) => (
                      <SelectItem key={attr.value} value={attr.value}>
                        {attr.label} ({attr.unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4 text-primary" />
                  Date Range
                </Label>
                <DateRangeFilter
                  startDate={startDate}
                  endDate={endDate}
                  onStartDateChange={setStartDate}
                  onEndDateChange={setEndDate}
                />
              </div>

              {/* Load Button */}
              <div className="space-y-2">
                <Label className="text-sm font-medium opacity-0">Action</Label>
                <Button 
                  onClick={loadData} 
                  disabled={!selectedLocation || isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>Loading...</>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Load Data
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* View Settings Card */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Display Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* View Mode Toggle */}
            <div className="flex items-center justify-between">
              <Label className="text-sm">Scientific Mode</Label>
              <Switch 
                checked={viewMode === 'scientific'}
                onCheckedChange={(checked) => setViewMode(checked ? 'scientific' : 'interactive')}
              />
            </div>

            {/* Show Grid */}
            <div className="flex items-center justify-between">
              <Label className="text-sm">Show Grid</Label>
              <Switch checked={showGrid} onCheckedChange={setShowGrid} />
            </div>

            {/* Show Data Points */}
            <div className="flex items-center justify-between">
              <Label className="text-sm">Show Data Points</Label>
              <Switch checked={showDataPoints} onCheckedChange={setShowDataPoints} />
            </div>

            {/* Export Button */}
            <Button variant="outline" size="sm" className="w-full" onClick={exportChart}>
              <Download className="w-4 h-4 mr-2" />
              Export Chart
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Database Toggle Buttons */}
      {hasLoadedData && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">Data Sources:</span>
              {COMPARISON_DATABASES.map((db) => (
                <Button
                  key={db}
                  variant={visibleDatabases.has(db) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleDatabase(db)}
                  className="gap-2"
                  style={{
                    backgroundColor: visibleDatabases.has(db) ? DATABASE_COLORS[db] : undefined,
                    borderColor: DATABASE_COLORS[db],
                  }}
                >
                  {visibleDatabases.has(db) ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  {DATABASE_LABELS[db]}
                </Button>
              ))}
              
              {zoomedData && (
                <Button variant="ghost" size="sm" onClick={resetZoom} className="ml-auto">
                  <ZoomOut className="w-4 h-4 mr-2" />
                  Reset Zoom
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs defaultValue="chart" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="chart">Time Series Chart</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="chart" className="space-y-4">
          {/* Loading State */}
          {isLoading && (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-[400px] w-full" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Chart Display */}
          {!isLoading && hasLoadedData && displayData.length > 0 && (
            <Card className={viewMode === 'scientific' ? 'bg-white dark:bg-card' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      {selectedAttributeInfo?.icon && <selectedAttributeInfo.icon className="w-5 h-5 text-primary" />}
                      {selectedAttributeInfo?.label} Time Series
                    </CardTitle>
                    <CardDescription className="flex flex-wrap items-center gap-2">
                      {locationName} | {displayData.length} points displayed
                      {isSampled && (
                        <Badge variant="secondary" className="text-xs">
                          Sampled from {totalRawPoints}
                        </Badge>
                      )}
                      {zoomedData && <Badge variant="secondary">Zoomed</Badge>}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={viewMode === 'scientific' ? 450 : 400}>
                  <LineChart 
                    data={displayData} 
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    {showGrid && (
                      <CartesianGrid 
                        strokeDasharray={viewMode === 'scientific' ? '2 2' : '3 3'} 
                        stroke="hsl(var(--border))" 
                        opacity={viewMode === 'scientific' ? 0.5 : 0.3} 
                      />
                    )}
                    <XAxis
                      dataKey="displayTime"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                      tickLine={viewMode === 'scientific'}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                      label={{ 
                        value: selectedAttributeInfo?.unit || '', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { fill: 'hsl(var(--muted-foreground))', fontSize: 12 }
                      }}
                      tickLine={viewMode === 'scientific'}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        padding: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                      formatter={(value: any, name: string) => [
                        `${typeof value === 'number' ? value.toFixed(2) : value} ${selectedAttributeInfo?.unit || ''}`,
                        DATABASE_LABELS[name as DatabaseType]
                      ]}
                      labelFormatter={(label) => `Time: ${label}`}
                    />
                    <Legend 
                      formatter={(value) => DATABASE_LABELS[value as DatabaseType]}
                      wrapperStyle={{ paddingTop: '10px' }}
                    />

                    {COMPARISON_DATABASES.filter(db => visibleDatabases.has(db)).map((database) => (
                      <Line
                        key={database}
                        type="monotone"
                        dataKey={database}
                        name={database}
                        stroke={DATABASE_COLORS[database]}
                        strokeWidth={viewMode === 'scientific' ? 1.5 : 2}
                        dot={showDataPoints ? { r: 1.5, fill: DATABASE_COLORS[database] } : false}
                        activeDot={{ r: 4, fill: DATABASE_COLORS[database] }}
                        connectNulls
                        isAnimationActive={false}
                      />
                    ))}

                    {/* Brush for interactive mode */}
                    {viewMode === 'interactive' && displayData.length > 30 && (
                      <Brush 
                        dataKey="displayTime" 
                        height={30} 
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--muted))"
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Empty State - Before Loading */}
          {!isLoading && !hasLoadedData && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12">
                <Snowflake className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center mb-4">
                  Select a location and click "Load Data" to view snow metrics
                </p>
              </CardContent>
            </Card>
          )}

          {/* Empty State - No Data */}
          {!isLoading && hasLoadedData && displayData.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  No data available for the selected filters
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="statistics">
          {hasLoadedData && displayData.length > 0 ? (
            <AnalyticsStatisticsPanel 
              statistics={statistics}
              attributeInfo={selectedAttributeInfo}
              locationName={locationName}
              visibleDatabases={visibleDatabases}
            />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12">
                <Snowflake className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  Load data to view statistics
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
