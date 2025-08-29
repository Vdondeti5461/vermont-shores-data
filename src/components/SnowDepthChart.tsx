import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, MapPin, TrendingUp, Download } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { LocalDatabaseService } from '@/services/localDatabaseService';
import { Skeleton } from '@/components/ui/skeleton';

interface SnowDepthData {
  timestamp: string;
  location: string;
  raw_depth?: number;
  cleaned_depth?: number;
  dbtcdt?: number;
  date?: string;
  rawDepth?: number;
  cleanedDepth?: number;
}

interface SnowDepthChartProps {
  className?: string;
}

const SnowDepthChart: React.FC<SnowDepthChartProps> = ({ className = '' }) => {
  const [data, setData] = useState<SnowDepthData[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedDatabase, setSelectedDatabase] = useState<string>('raw');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<'line' | 'area'>('line');

  // Load locations and initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        // Load locations
        const locationsData = await LocalDatabaseService.getLocations('CRRELS2S_VTClimateRepository');
        setLocations(locationsData);
        
        if (locationsData.length > 0) {
          setSelectedLocation(locationsData[0].name);
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Load snow depth data when filters change
  useEffect(() => {
    if (!selectedLocation) return;

    const loadSnowDepthData = async () => {
      try {
        setLoading(true);
        const snowData = await LocalDatabaseService.getSnowDepthTimeSeries(
          selectedDatabase === 'raw' ? 'CRRELS2S_VTClimateRepository' : 'CRRELS2S_VTClimateRepository_Processed',
          selectedLocation,
          dateRange.start,
          dateRange.end,
          'both'
        );
        
        // Transform data for chart
        const chartData = snowData.map(item => ({
          ...item,
          date: new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          rawDepth: item.raw_depth || item.dbtcdt || 0,
          cleanedDepth: item.cleaned_depth || item.dbtcdt || 0
        }));
        
        setData(chartData);
      } catch (error) {
        console.error('Failed to load snow depth data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSnowDepthData();
  }, [selectedLocation, selectedDatabase, dateRange]);

  // Calculate statistics
  const stats = React.useMemo(() => {
    if (!data.length) return { avgRaw: 0, avgCleaned: 0, maxRaw: 0, maxCleaned: 0, improvement: 0 };
    
    const rawDepths = data.map(d => d.rawDepth || 0).filter(Boolean);
    const cleanedDepths = data.map(d => d.cleanedDepth || 0).filter(Boolean);
    
    const avgRaw = rawDepths.reduce((sum, val) => sum + val, 0) / rawDepths.length;
    const avgCleaned = cleanedDepths.reduce((sum, val) => sum + val, 0) / cleanedDepths.length;
    const maxRaw = Math.max(...rawDepths);
    const maxCleaned = Math.max(...cleanedDepths);
    
    // Calculate variance reduction as data quality improvement
    const rawVariance = rawDepths.reduce((sum, val) => sum + Math.pow(val - avgRaw, 2), 0) / rawDepths.length;
    const cleanedVariance = cleanedDepths.reduce((sum, val) => sum + Math.pow(val - avgCleaned, 2), 0) / cleanedDepths.length;
    const improvement = rawVariance > 0 ? ((rawVariance - cleanedVariance) / rawVariance) * 100 : 0;
    
    return { avgRaw, avgCleaned, maxRaw, maxCleaned, improvement };
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border">
          <p className="font-medium mb-2">{`Date: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.dataKey === 'rawDepth' ? 'Raw' : 'Cleaned'} Snow Depth: ${entry.value?.toFixed(2)} cm`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading && !data.length) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h2 className="scientific-heading text-2xl md:text-3xl mb-2">
            Snow Depth <span className="text-primary">Analysis</span>
          </h2>
          <p className="text-muted-foreground">
            Time series comparison between raw and processed DBTCDT measurements
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-full sm:w-48">
              <MapPin className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.name}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedDatabase} onValueChange={setSelectedDatabase}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="raw">Raw Database</SelectItem>
              <SelectItem value="processed">Processed DB</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Avg Raw</span>
          </div>
          <div className="text-2xl font-bold">{stats.avgRaw.toFixed(1)}</div>
          <div className="text-xs text-muted-foreground">cm</div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Avg Clean</span>
          </div>
          <div className="text-2xl font-bold">{stats.avgCleaned.toFixed(1)}</div>
          <div className="text-xs text-muted-foreground">cm</div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <CalendarDays className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium">Max Depth</span>
          </div>
          <div className="text-2xl font-bold">{Math.max(stats.maxRaw, stats.maxCleaned).toFixed(1)}</div>
          <div className="text-xs text-muted-foreground">cm</div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Download className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-medium">Quality</span>
          </div>
          <div className="text-2xl font-bold text-green-600">+{stats.improvement.toFixed(1)}%</div>
          <div className="text-xs text-muted-foreground">improvement</div>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg">Snow Depth Time Series</CardTitle>
            <Tabs value={chartType} onValueChange={(value) => setChartType(value as 'line' | 'area')} className="w-fit">
              <TabsList className="grid w-fit grid-cols-2">
                <TabsTrigger value="line">Line Chart</TabsTrigger>
                <TabsTrigger value="area">Area Chart</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 md:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    label={{ value: 'Snow Depth (cm)', angle: -90, position: 'insideLeft' }}
                    className="text-xs"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="rawDepth" 
                    stroke="hsl(var(--chart-1))" 
                    strokeWidth={2}
                    name="Raw Data"
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cleanedDepth" 
                    stroke="hsl(var(--chart-2))" 
                    strokeWidth={2}
                    name="Cleaned Data"
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              ) : (
                <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    label={{ value: 'Snow Depth (cm)', angle: -90, position: 'insideLeft' }}
                    className="text-xs"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="rawDepth" 
                    stackId="1"
                    stroke="hsl(var(--chart-1))" 
                    fill="hsl(var(--chart-1) / 0.3)"
                    name="Raw Data"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="cleanedDepth" 
                    stackId="2"
                    stroke="hsl(var(--chart-2))" 
                    fill="hsl(var(--chart-2) / 0.3)"
                    name="Cleaned Data"
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Data Quality Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Data Quality Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-chart-1"></div>
              <div>
                <p className="font-medium text-sm">Raw Data</p>
                <p className="text-xs text-muted-foreground">Direct sensor measurements</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-chart-2"></div>
              <div>
                <p className="font-medium text-sm">Cleaned Data</p>
                <p className="text-xs text-muted-foreground">Quality controlled & validated</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="px-2 py-1">
                {stats.improvement > 0 ? 'Improved' : 'Similar'} Quality
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SnowDepthChart;