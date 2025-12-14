import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Loader2, MapPin, Snowflake, RefreshCw, Calendar } from 'lucide-react';
import { API_BASE_URL } from '@/lib/apiConfig';
import { getLocationOptions } from '@/lib/locationData';
import { useToast } from '@/hooks/use-toast';

// Three seasons with their database table names
const SEASONS = [
  { id: '2022-2023', table: 'core_observations_2022_2023_qaqc', label: '2022-2023', color: 'hsl(0, 84%, 60%)' },   // Red
  { id: '2023-2024', table: 'core_observations_2023_2024_qaqc', label: '2023-2024', color: 'hsl(217, 91%, 60%)' }, // Blue
  { id: '2024-2025', table: 'core_observations_2024_2025_qaqc', label: '2024-2025', color: 'hsl(142, 71%, 45%)' }, // Green
];

// Default attribute for snow depth
const SNOW_DEPTH_ATTRIBUTE = 'snow_depth_cm';

// LTTB downsampling for performance
const MAX_DISPLAY_POINTS = 500;

interface SeasonData {
  seasonId: string;
  data: any[];
}

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

// Fetch data from seasonal QAQC database
async function fetchSeasonalData(
  table: string,
  location: string,
  signal?: AbortSignal
): Promise<any[]> {
  const params = new URLSearchParams({
    location,
    attributes: SNOW_DEPTH_ATTRIBUTE,
    limit: '50000',
  });

  const url = `${API_BASE_URL}/api/databases/seasonal_qaqc_data/analytics/${table}?${params}`;
  console.log(`[Seasonal] Fetching from: ${url}`);

  const response = await fetch(url, { 
    signal,
    headers: { 'Cache-Control': 'no-cache' }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Seasonal] Error fetching ${table}:`, errorText);
    throw new Error(`Failed to fetch ${table}: ${response.status}`);
  }
  
  const data = await response.json();
  console.log(`[Seasonal] Received ${data.length} points from ${table}`);
  return data;
}

export const SeasonalAnalyticsDashboard = () => {
  const { toast } = useToast();
  const locations = getLocationOptions();
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [seasonData, setSeasonData] = useState<SeasonData[]>([]);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>(SEASONS.map(s => s.id)); // All selected by default

  const toggleSeason = (seasonId: string) => {
    setSelectedSeasons(prev => {
      if (prev.includes(seasonId)) {
        // Don't allow deselecting all - keep at least one
        if (prev.length === 1) return prev;
        return prev.filter(id => id !== seasonId);
      }
      return [...prev, seasonId];
    });
  };

  // Load data for all three seasons
  const loadData = useCallback(async () => {
    if (!selectedLocation) return;

    // Cancel any pending request
    if (abortController) {
      abortController.abort();
    }

    const controller = new AbortController();
    setAbortController(controller);
    setIsLoading(true);

    try {
      const results = await Promise.allSettled(
        SEASONS.map(async (season) => {
          const data = await fetchSeasonalData(season.table, selectedLocation, controller.signal);
          return { seasonId: season.id, data };
        })
      );

      if (!controller.signal.aborted) {
        const successfulResults = results
          .filter((r): r is PromiseFulfilledResult<SeasonData> => r.status === 'fulfilled')
          .map(r => r.value);
        
        setSeasonData(successfulResults);
        
        // Show warning if some seasons failed
        const failedCount = results.filter(r => r.status === 'rejected').length;
        if (failedCount > 0) {
          toast({
            title: "Partial Data",
            description: `${failedCount} season(s) failed to load. Some data may be missing.`,
            variant: "default",
          });
        }
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('[Seasonal] Error loading data:', error);
        toast({
          title: "Error",
          description: "Failed to load seasonal data. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [selectedLocation, toast, abortController]);

  // Auto-load when location is selected
  useEffect(() => {
    if (selectedLocation) {
      loadData();
    }
    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, [selectedLocation]);

  // Prepare chart data - normalize by day of year for comparison
  const prepareChartData = useCallback(() => {
    if (seasonData.length === 0) return [];

    // Create a map of day-of-year to values for each season
    const dayOfYearMap = new Map<number, any>();

    seasonData.forEach(({ seasonId, data }) => {
      data.forEach((point: any) => {
        const timestamp = new Date(point.timestamp);
        // For winter seasons, use day offset from Oct 1st (start of water year)
        const month = timestamp.getMonth();
        const day = timestamp.getDate();
        
        // Calculate day of water year (Oct 1 = day 1)
        let dayOfWaterYear: number;
        if (month >= 9) { // Oct-Dec
          dayOfWaterYear = (month - 9) * 30 + day;
        } else { // Jan-Sep
          dayOfWaterYear = (month + 3) * 30 + day;
        }

        if (!dayOfYearMap.has(dayOfWaterYear)) {
          dayOfYearMap.set(dayOfWaterYear, {
            dayOfWaterYear,
            displayDate: `${timestamp.toLocaleString('en-US', { month: 'short' })} ${day}`,
          });
        }

        const entry = dayOfYearMap.get(dayOfWaterYear);
        // Case-insensitive attribute lookup
        const value = point.snow_depth_cm ?? point.SNOW_DEPTH_CM ?? point.Snow_Depth_cm;
        if (value !== null && value !== undefined) {
          entry[seasonId] = value;
        }
      });
    });

    // Sort by day of water year
    const sortedData = Array.from(dayOfYearMap.values())
      .sort((a, b) => a.dayOfWaterYear - b.dayOfWaterYear);

    // Apply LTTB sampling if needed
    if (sortedData.length > MAX_DISPLAY_POINTS) {
      return lttbDownsample(sortedData, MAX_DISPLAY_POINTS, SEASONS[0].id);
    }

    return sortedData;
  }, [seasonData]);

  const chartData = prepareChartData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Snowflake className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Seasonal Snow Depth Comparison</h2>
          <p className="text-muted-foreground">
            Compare snow depth across three winter seasons (QAQC quality-controlled data)
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Season Selection
          </CardTitle>
          <CardDescription>
            Select a location to compare snow depth across all three seasons
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Location Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
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

          {/* Refresh Button */}
          {selectedLocation && (
            <Button 
              onClick={loadData} 
              variant="outline" 
              size="sm"
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          )}

          {/* Season Filter */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Seasons to Compare
            </Label>
            <div className="flex flex-wrap gap-4 p-3 bg-muted/50 rounded-lg border border-border">
              {SEASONS.map((season) => (
                <label
                  key={season.id}
                  className={`flex items-center gap-2 cursor-pointer p-2 rounded-md transition-colors ${
                    selectedSeasons.includes(season.id) 
                      ? 'bg-background shadow-sm' 
                      : 'opacity-60 hover:opacity-80'
                  }`}
                >
                  <Checkbox
                    checked={selectedSeasons.includes(season.id)}
                    onCheckedChange={() => toggleSeason(season.id)}
                    className="border-2"
                    style={{ 
                      borderColor: season.color,
                      backgroundColor: selectedSeasons.includes(season.id) ? season.color : 'transparent'
                    }}
                  />
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: season.color }}
                  />
                  <Badge 
                    variant={selectedSeasons.includes(season.id) ? "default" : "outline"} 
                    className="text-xs"
                    style={{ 
                      backgroundColor: selectedSeasons.includes(season.id) ? season.color : 'transparent',
                      color: selectedSeasons.includes(season.id) ? 'white' : undefined
                    }}
                  >
                    {season.label}
                  </Badge>
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Select which seasons to display in the comparison chart
            </p>
          </div>

          {/* Selected Info */}
          {selectedLocation && (
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm text-muted-foreground">
                Comparing <span className="font-semibold text-foreground">Snow Depth</span> for{' '}
                <span className="font-semibold text-foreground">
                  {locations.find(l => l.id === selectedLocation)?.name}
                </span>
                {' '}across {selectedSeasons.length} season{selectedSeasons.length !== 1 ? 's' : ''}
              </p>
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
              <p className="text-sm text-muted-foreground">Loading seasonal data...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chart Display */}
      {!isLoading && selectedLocation && chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Snowflake className="h-5 w-5 text-primary" />
              Snow Depth - Seasonal Comparison
            </CardTitle>
            <CardDescription>
              {locations.find(l => l.id === selectedLocation)?.name} | Water Year Alignment (Oct-Sep)
              {chartData.length >= MAX_DISPLAY_POINTS && (
                <span className="ml-2 text-xs text-muted-foreground">
                  (Sampled to {MAX_DISPLAY_POINTS} points)
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={500}>
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(var(--border))" 
                  opacity={0.3} 
                />
                <XAxis
                  dataKey="displayDate"
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
                    value: 'cm', 
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
                  formatter={(value: any, name: string) => [
                    `${typeof value === 'number' ? value.toFixed(2) : value} cm`,
                    SEASONS.find(s => s.id === name)?.label || name
                  ]}
                />
                <Legend 
                  formatter={(value) => SEASONS.find(s => s.id === value)?.label || value}
                  wrapperStyle={{ paddingTop: '20px' }}
                />
                {SEASONS.filter(season => selectedSeasons.includes(season.id)).map((season) => (
                  <Line
                    key={season.id}
                    type="monotone"
                    dataKey={season.id}
                    name={season.id}
                    stroke={season.color}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !selectedLocation && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Select a location to view seasonal snow depth comparison
            </p>
          </CardContent>
        </Card>
      )}

      {/* No Data State */}
      {!isLoading && selectedLocation && chartData.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <Snowflake className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No seasonal data available for the selected location
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SeasonalAnalyticsDashboard;
