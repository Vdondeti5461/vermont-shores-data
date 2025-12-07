import { useState, useEffect, useMemo, useCallback } from 'react';
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
  ResponsiveContainer, Brush, ReferenceArea, ReferenceLine 
} from 'recharts';
import { 
  MapPin, TrendingUp, Download, Settings2, Eye, EyeOff, 
  RefreshCw, ZoomIn, ZoomOut, Calendar, Snowflake, Droplets, Scale
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

interface ChartDataPoint {
  timestamp: string;
  displayTime: string;
  [key: string]: string | number | null;
}

export const SnowAnalyticsDashboard = () => {
  const { toast } = useToast();
  
  // State
  const [locations, setLocations] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedAttribute, setSelectedAttribute] = useState<string>('snow_depth_cm');
  const [isLoading, setIsLoading] = useState(false);
  const [comparisonData, setComparisonData] = useState<{ database: DatabaseType; data: TimeSeriesDataPoint[] }[]>([]);
  
  // View settings
  const [viewMode, setViewMode] = useState<'interactive' | 'scientific'>('interactive');
  const [showGrid, setShowGrid] = useState(true);
  const [showDataPoints, setShowDataPoints] = useState(true);
  const [visibleDatabases, setVisibleDatabases] = useState<Set<DatabaseType>>(new Set(COMPARISON_DATABASES));
  
  // Date range
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  // Zoom state for interactive mode
  const [refAreaLeft, setRefAreaLeft] = useState<string>('');
  const [refAreaRight, setRefAreaRight] = useState<string>('');
  const [zoomedData, setZoomedData] = useState<ChartDataPoint[] | null>(null);

  const TABLE: TableType = 'raw_env_core_observations';

  // Fetch locations on mount
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const locs = await fetchLocations('CRRELS2S_raw_data_ingestion', TABLE);
        setLocations(locs);
        // Auto-select first location if available
        if (locs.length > 0 && !selectedLocation) {
          setSelectedLocation(locs[0].id);
        }
      } catch (error) {
        console.error('Error loading locations:', error);
        toast({
          title: "Connection Error",
          description: "Failed to load locations. Please check API connection.",
          variant: "destructive",
        });
      }
    };
    loadLocations();
  }, [toast]);

  // Fetch comparison data when filters change
  useEffect(() => {
    if (!selectedLocation || !selectedAttribute) return;

    const loadComparisonData = async () => {
      setIsLoading(true);
      setZoomedData(null); // Reset zoom on new data
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
      } catch (error) {
        console.error('Error loading comparison data:', error);
        toast({
          title: "Data Error",
          description: "Failed to load time series data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadComparisonData();
  }, [selectedLocation, selectedAttribute, startDate, endDate, toast]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!comparisonData || comparisonData.length === 0) return [];

    const allTimestamps = new Set<string>();
    comparisonData.forEach(({ data }) => {
      data.forEach((point) => allTimestamps.add(point.timestamp));
    });

    const sortedTimestamps = Array.from(allTimestamps).sort();
    
    return sortedTimestamps.map((timestamp) => {
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
  }, [comparisonData, selectedAttribute, viewMode]);

  // Get data to display (zoomed or full)
  const displayData = zoomedData || chartData;

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

  // Zoom handlers
  const handleMouseDown = (e: any) => {
    if (viewMode !== 'interactive' || !e?.activeLabel) return;
    setRefAreaLeft(e.activeLabel);
  };

  const handleMouseMove = (e: any) => {
    if (refAreaLeft && e?.activeLabel) {
      setRefAreaRight(e.activeLabel);
    }
  };

  const handleMouseUp = () => {
    if (!refAreaLeft || !refAreaRight) {
      setRefAreaLeft('');
      setRefAreaRight('');
      return;
    }

    let left = refAreaLeft;
    let right = refAreaRight;

    if (left > right) [left, right] = [right, left];

    const filtered = chartData.filter(
      d => d.displayTime >= left && d.displayTime <= right
    );

    if (filtered.length >= 2) {
      setZoomedData(filtered);
    }

    setRefAreaLeft('');
    setRefAreaRight('');
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

  return (
    <div className="space-y-6">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Location */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <MapPin className="h-4 w-4 text-primary" />
                  Location
                </Label>
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
          {!isLoading && selectedLocation && selectedAttribute && displayData.length > 0 && (
            <Card className={viewMode === 'scientific' ? 'bg-white dark:bg-card' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      {selectedAttributeInfo?.icon && <selectedAttributeInfo.icon className="w-5 h-5 text-primary" />}
                      {selectedAttributeInfo?.label} Time Series
                    </CardTitle>
                    <CardDescription>
                      {locationName} | {displayData.length} data points
                      {zoomedData && <Badge variant="secondary" className="ml-2">Zoomed</Badge>}
                    </CardDescription>
                  </div>
                  {viewMode === 'interactive' && (
                    <div className="text-xs text-muted-foreground">
                      <ZoomIn className="inline w-3 h-3 mr-1" />
                      Click and drag to zoom
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={viewMode === 'scientific' ? 450 : 500}>
                  <LineChart 
                    data={displayData} 
                    margin={{ top: 20, right: 30, left: 20, bottom: viewMode === 'scientific' ? 60 : 80 }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
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
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: viewMode === 'scientific' ? 10 : 11 }}
                      tickLine={viewMode === 'scientific'}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: viewMode === 'scientific' ? 10 : 11 }}
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
                      wrapperStyle={{ paddingTop: viewMode === 'scientific' ? '10px' : '20px' }}
                    />
                    
                    {/* Reference area for zoom selection */}
                    {refAreaLeft && refAreaRight && (
                      <ReferenceArea
                        x1={refAreaLeft}
                        x2={refAreaRight}
                        strokeOpacity={0.3}
                        fill="hsl(var(--primary))"
                        fillOpacity={0.1}
                      />
                    )}

                    {COMPARISON_DATABASES.filter(db => visibleDatabases.has(db)).map((database) => (
                      <Line
                        key={database}
                        type="monotone"
                        dataKey={database}
                        name={database}
                        stroke={DATABASE_COLORS[database]}
                        strokeWidth={viewMode === 'scientific' ? 1.5 : 2.5}
                        dot={showDataPoints ? { r: viewMode === 'scientific' ? 1 : 2, fill: DATABASE_COLORS[database] } : false}
                        activeDot={{ r: 4, fill: DATABASE_COLORS[database] }}
                        connectNulls
                      />
                    ))}

                    {/* Brush for interactive mode */}
                    {viewMode === 'interactive' && !zoomedData && displayData.length > 50 && (
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

          {/* Empty State */}
          {!isLoading && (!selectedLocation || !selectedAttribute || displayData.length === 0) && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12">
                <Snowflake className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  {!selectedLocation 
                    ? "Select a location to view snow metrics"
                    : displayData.length === 0 
                      ? "No data available for the selected filters"
                      : "Select an attribute to view time series comparison"
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="statistics">
          <AnalyticsStatisticsPanel 
            statistics={statistics}
            attributeInfo={selectedAttributeInfo}
            locationName={locationName}
            visibleDatabases={visibleDatabases}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
