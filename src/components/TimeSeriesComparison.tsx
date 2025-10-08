import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LocalDatabaseService, EnvironmentalData } from '@/services/localDatabaseService';
import { format, parseISO } from 'date-fns';
import { TrendingUp, Database, Calendar } from 'lucide-react';

interface ChartDataPoint {
  timestamp: string;
  date: string;
  rawValue: number | null;
  cleanValue: number | null;
}

const ATTRIBUTE_OPTIONS = [
  { value: 'Soil_Temperature_C', label: 'Soil Temperature (°C)', unit: '°C' },
  { value: 'AirTC_Avg', label: 'Air Temperature (°C)', unit: '°C' },
  { value: 'DBTCDT', label: 'Snow Depth (cm)', unit: 'cm' },
  { value: 'WS_ms_Avg', label: 'Wind Speed (m/s)', unit: 'm/s' },
  { value: 'Precipitation_Tot', label: 'Precipitation (mm)', unit: 'mm' },
  { value: 'RH', label: 'Relative Humidity (%)', unit: '%' },
  { value: 'BP_mbar_Avg', label: 'Barometric Pressure (mbar)', unit: 'mbar' },
];

export default function TimeSeriesComparison() {
  const [locations, setLocations] = useState<Array<{ id: string; name: string }>>([]);
  const [seasons, setSeasons] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedSeason, setSelectedSeason] = useState<string>('');
  const [selectedAttribute, setSelectedAttribute] = useState<string>('AirTC_Avg');
  const [rawData, setRawData] = useState<EnvironmentalData[]>([]);
  const [cleanData, setCleanData] = useState<EnvironmentalData[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Load locations and seasons on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setInitialLoading(true);
        
        // Get databases info
        const dbInfo = await LocalDatabaseService.getDatabasesInfo();
        
        // Extract seasons from available databases
        const seasonList = Object.entries(dbInfo)
          .filter(([_, info]) => info.seasons && info.seasons.length > 0)
          .flatMap(([_, info]) => info.seasons.map(s => ({ id: s, name: s })))
          .filter((season, index, self) => 
            index === self.findIndex(s => s.id === season.id)
          );
        
        setSeasons(seasonList);
        
        // Set default season if available
        if (seasonList.length > 0) {
          const defaultSeason = seasonList[0].id;
          setSelectedSeason(defaultSeason);
          
          // Load locations for the default season
          const locationData = await LocalDatabaseService.getLocations('raw_data');
          const locationList = locationData.map(loc => ({
            id: String(loc.id),
            name: loc.name
          }));
          setLocations(locationList);
          
          // Set default location
          if (locationList.length > 0) {
            setSelectedLocation(String(locationList[0].id));
          }
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Load data when selections change
  useEffect(() => {
    const loadComparisonData = async () => {
      if (!selectedLocation || !selectedSeason || !selectedAttribute) return;

      try {
        setLoading(true);

        // Fetch raw data
        const rawTableData = await LocalDatabaseService.getTableData(
          selectedSeason,
          'raw_data',
          selectedLocation,
          undefined,
          undefined,
          undefined,
          1000
        );

        // Fetch clean data
        const cleanTableData = await LocalDatabaseService.getTableData(
          selectedSeason,
          'clean_data',
          selectedLocation,
          undefined,
          undefined,
          undefined,
          1000
        );

        setRawData(rawTableData);
        setCleanData(cleanTableData);
      } catch (error) {
        console.error('Error loading comparison data:', error);
        setRawData([]);
        setCleanData([]);
      } finally {
        setLoading(false);
      }
    };

    loadComparisonData();
  }, [selectedLocation, selectedSeason, selectedAttribute]);

  // Process data for chart
  const chartData = useMemo(() => {
    if (rawData.length === 0 && cleanData.length === 0) return [];

    // Create a map of timestamps
    const dataMap = new Map<string, ChartDataPoint>();

    // Add raw data
    rawData.forEach(point => {
      if (point.TIMESTAMP) {
        const timestamp = point.TIMESTAMP;
        const value = point[selectedAttribute as keyof EnvironmentalData];
        
        dataMap.set(timestamp, {
          timestamp,
          date: format(parseISO(timestamp), 'MMM dd, yyyy HH:mm'),
          rawValue: typeof value === 'number' ? value : null,
          cleanValue: null,
        });
      }
    });

    // Add clean data
    cleanData.forEach(point => {
      if (point.TIMESTAMP) {
        const timestamp = point.TIMESTAMP;
        const value = point[selectedAttribute as keyof EnvironmentalData];
        
        const existing = dataMap.get(timestamp);
        if (existing) {
          existing.cleanValue = typeof value === 'number' ? value : null;
        } else {
          dataMap.set(timestamp, {
            timestamp,
            date: format(parseISO(timestamp), 'MMM dd, yyyy HH:mm'),
            rawValue: null,
            cleanValue: typeof value === 'number' ? value : null,
          });
        }
      }
    });

    // Convert to array and sort by timestamp
    return Array.from(dataMap.values())
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .slice(0, 500); // Limit to 500 points for performance
  }, [rawData, cleanData, selectedAttribute]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const rawValues = chartData.map(d => d.rawValue).filter((v): v is number => v !== null);
    const cleanValues = chartData.map(d => d.cleanValue).filter((v): v is number => v !== null);

    const calcStats = (values: number[]) => {
      if (values.length === 0) return { min: 0, max: 0, avg: 0 };
      return {
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((sum, v) => sum + v, 0) / values.length,
      };
    };

    return {
      raw: calcStats(rawValues),
      clean: calcStats(cleanValues),
    };
  }, [chartData]);

  const selectedAttrInfo = ATTRIBUTE_OPTIONS.find(opt => opt.value === selectedAttribute);

  if (initialLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Raw vs Clean Data Comparison
        </CardTitle>
        <CardDescription>
          Compare time series data between raw measurements and cleaned datasets across different environmental attributes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Selection Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4" />
              Location
            </label>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map(location => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Season
            </label>
            <Select value={selectedSeason} onValueChange={setSelectedSeason}>
              <SelectTrigger>
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

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Attribute
            </label>
            <Select value={selectedAttribute} onValueChange={setSelectedAttribute}>
              <SelectTrigger>
                <SelectValue placeholder="Select attribute" />
              </SelectTrigger>
              <SelectContent>
                {ATTRIBUTE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Raw Data Points</p>
            <p className="text-2xl font-bold">{rawData.length}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Clean Data Points</p>
            <p className="text-2xl font-bold">{cleanData.length}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Raw Avg</p>
            <p className="text-2xl font-bold">
              {statistics.raw.avg.toFixed(2)} {selectedAttrInfo?.unit}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Clean Avg</p>
            <p className="text-2xl font-bold">
              {statistics.clean.avg.toFixed(2)} {selectedAttrInfo?.unit}
            </p>
          </div>
        </div>

        {/* Chart */}
        {loading ? (
          <Skeleton className="h-[400px] w-full" />
        ) : chartData.length > 0 ? (
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  label={{ 
                    value: selectedAttrInfo?.label || '', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { fontSize: 12 }
                  }}
                  className="text-xs"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                  formatter={(value: number) => `${value.toFixed(2)} ${selectedAttrInfo?.unit}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="rawValue" 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={2}
                  name="Raw Data"
                  dot={false}
                  connectNulls
                />
                <Line 
                  type="monotone" 
                  dataKey="cleanValue" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Clean Data"
                  dot={false}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[400px] flex items-center justify-center border border-dashed rounded-lg">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">No data available for the selected filters</p>
              <Badge variant="outline">Try selecting different parameters</Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
