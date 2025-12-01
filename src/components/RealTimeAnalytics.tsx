import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Loader2, MapPin, TrendingUp } from 'lucide-react';
import { DatabaseType, TableType, TimeSeriesDataPoint, fetchLocations, fetchMultiQualityComparison } from '@/services/realTimeAnalyticsService';
import { useToast } from '@/hooks/use-toast';

// Mapping of attributes to display names and units
const ATTRIBUTES = [
  { value: 'snow_depth_cm', label: 'Snow Depth', unit: 'cm' },
  { value: 'air_temperature_avg_c', label: 'Air Temperature Average', unit: '°C' },
  { value: 'relative_humidity_percent', label: 'Relative Humidity', unit: '%' },
] as const;

// Three databases for comparison - always fetch from all three for analytics
const COMPARISON_DATABASES: DatabaseType[] = [
  'CRRELS2S_raw_data_ingestion',
  'CRRELS2S_stage_clean_data',
  'CRRELS2S_stage_qaqc_data',
];

const DATABASE_COLORS = {
  'CRRELS2S_raw_data_ingestion': 'hsl(0, 84%, 60%)',    // Red
  'CRRELS2S_stage_clean_data': 'hsl(217, 91%, 60%)',   // Blue
  'CRRELS2S_stage_qaqc_data': 'hsl(142, 71%, 45%)',    // Green
};

const DATABASE_LABELS = {
  'CRRELS2S_raw_data_ingestion': 'Raw Data',
  'CRRELS2S_stage_clean_data': 'Clean Data',
  'CRRELS2S_stage_qaqc_data': 'QAQC Data',
};

export const RealTimeAnalytics = () => {
  const { toast } = useToast();
  const [locations, setLocations] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedAttribute, setSelectedAttribute] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [comparisonData, setComparisonData] = useState<{ database: DatabaseType; data: TimeSeriesDataPoint[] }[]>([]);

  // Fixed table - using core observations which has all three attributes
  const TABLE: TableType = 'raw_env_core_observations';

  // Fetch locations on mount
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const locs = await fetchLocations('CRRELS2S_raw_data_ingestion', TABLE);
        setLocations(locs);
      } catch (error) {
        console.error('Error loading locations:', error);
        toast({
          title: "Error",
          description: "Failed to load locations. Please check API connection.",
          variant: "destructive",
        });
      }
    };
    loadLocations();
  }, [toast]);

  // Fetch comparison data when location and attribute are selected
  useEffect(() => {
    if (!selectedLocation || !selectedAttribute) return;

    const loadComparisonData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchMultiQualityComparison(
          COMPARISON_DATABASES,
          TABLE,
          selectedLocation,
          [selectedAttribute]
        );
        setComparisonData(data);
      } catch (error) {
        console.error('Error loading comparison data:', error);
        toast({
          title: "Error",
          description: "Failed to load time series data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadComparisonData();
  }, [selectedLocation, selectedAttribute, toast]);

  // Prepare chart data
  const prepareChartData = () => {
    if (!comparisonData || comparisonData.length === 0) return [];

    const allTimestamps = new Set<string>();
    comparisonData.forEach(({ data }) => {
      data.forEach((point) => allTimestamps.add(point.timestamp));
    });

    const sortedTimestamps = Array.from(allTimestamps).sort();
    
    return sortedTimestamps.map((timestamp) => {
      const point: any = { 
        timestamp,
        displayTime: new Date(timestamp).toLocaleString('en-US', { 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
        })
      };
      
      comparisonData.forEach(({ database, data }) => {
        const dataPoint = data.find((d) => d.timestamp === timestamp);
        point[database] = dataPoint ? dataPoint[selectedAttribute] : null;
      });
      
      return point;
    });
  };

  const chartData = prepareChartData();
  const selectedAttributeInfo = ATTRIBUTES.find(a => a.value === selectedAttribute);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <TrendingUp className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Time Series Analytics</h2>
          <p className="text-muted-foreground">
            Compare environmental measurements across three data processing stages: raw sensor data, cleaned data, and quality-controlled data
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Options</CardTitle>
          <CardDescription>
            Select a location and measurement attribute to compare data across all processing stages
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

          {/* Info Display */}
          {selectedLocation && selectedAttribute && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-3">
                Displaying <span className="font-semibold text-foreground">{selectedAttributeInfo?.label}</span> time series for{' '}
                <span className="font-semibold text-foreground">{locations.find(l => l.id === selectedLocation)?.name}</span>
              </p>
              <div className="flex flex-wrap gap-4">
                {COMPARISON_DATABASES.map((db) => (
                  <div key={db} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: DATABASE_COLORS[db] }}
                    />
                    <span className="text-xs font-medium">{DATABASE_LABELS[db]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      )}

      {/* Chart Display */}
      {!isLoading && selectedLocation && selectedAttribute && chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {selectedAttributeInfo?.label} Time Series Comparison
            </CardTitle>
            <CardDescription>
              {locations.find(l => l.id === selectedLocation)?.name} | Three-stage data processing comparison
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
                  formatter={(value: any, name: string) => [
                    `${typeof value === 'number' ? value.toFixed(2) : value} ${selectedAttributeInfo?.unit || ''}`,
                    DATABASE_LABELS[name as DatabaseType]
                  ]}
                />
                <Legend 
                  formatter={(value) => DATABASE_LABELS[value as DatabaseType]}
                  wrapperStyle={{ paddingTop: '20px' }}
                />
                {COMPARISON_DATABASES.map((database) => (
                  <Line
                    key={database}
                    type="monotone"
                    dataKey={database}
                    name={database}
                    stroke={DATABASE_COLORS[database]}
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: DATABASE_COLORS[database] }}
                    activeDot={{ r: 5, fill: DATABASE_COLORS[database] }}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && (!selectedLocation || !selectedAttribute) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Select a location and attribute to view time series comparison
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
