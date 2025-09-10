import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, MapPin, TrendingUp, Download, Database } from 'lucide-react';
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
  const [selectedYear, setSelectedYear] = useState<string>('2023');
  const [selectedSeason, setSelectedSeason] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<'line' | 'area'>('line');

  // Available years and seasons
  const availableYears = ['2022', '2023', '2024'];
  const seasons = [
    { value: 'all', label: 'All Seasons' },
    { value: 'winter', label: 'Winter (Dec-Feb)' },
    { value: 'spring', label: 'Spring (Mar-May)' },
    { value: 'summer', label: 'Summer (Jun-Aug)' },
    { value: 'fall', label: 'Fall (Sep-Nov)' }
  ];

  // Load initial locations with optimized caching
  useEffect(() => {
    let isMounted = true;
    
    const loadLocations = async () => {
      try {
        const locationsData = await LocalDatabaseService.getLocations('rawdata');
        if (isMounted) {
          setLocations(locationsData);
          if (locationsData.length > 0) {
            setSelectedLocation(locationsData[0].name);
          }
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };
    
    loadLocations();
    return () => { isMounted = false; };
  }, []);

  // Optimized data loading with debouncing and request deduplication
  useEffect(() => {
    if (!selectedLocation) return;
    
    const timeoutId = setTimeout(() => {
      loadSnowDepthData();
    }, 100); // Reduced debounce time for better responsiveness
    
    return () => clearTimeout(timeoutId);
  }, [selectedLocation, selectedDatabase, selectedYear, selectedSeason]);

  const loadSnowDepthData = async () => {
    try {
      setLoading(true);
      
      // Set date range based on year and season
      const startDate = `${selectedYear}-01-01`;
      const endDate = `${selectedYear}-12-31`;
      const seasonParam = selectedSeason && selectedSeason !== 'all' ? selectedSeason : undefined;
      
      // Optimize: Use direct database names and parallel requests when comparing both
      const databaseName = selectedDatabase === 'raw' ? 'rawdata' : 'finalcleandata';
      
      if (selectedDatabase === 'both') {
        // Load both raw and clean data in parallel for comparison - optimized
        const [rawData, cleanData] = await Promise.all([
          LocalDatabaseService.getSnowDepthTimeSeries('rawdata', selectedLocation, startDate, endDate, seasonParam, selectedYear, 'both'),
          LocalDatabaseService.getSnowDepthTimeSeries('finalcleandata', selectedLocation, startDate, endDate, seasonParam, selectedYear, 'both')
        ]);
        
        // Efficient data merging with Map for O(n) performance
        const dataMap = new Map();
        
        // Process raw data first
        rawData.forEach(item => {
          const dateKey = new Date(item.timestamp).toDateString();
          dataMap.set(dateKey, { 
            ...item, 
            rawDepth: item.dbtcdt || item.raw_depth,
            timestamp: item.timestamp,
            date: new Date(item.timestamp).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: selectedSeason && selectedSeason !== 'all' ? undefined : '2-digit'
            })
          });
        });
        
        // Add clean data
        cleanData.forEach(item => {
          const dateKey = new Date(item.timestamp).toDateString();
          const existing = dataMap.get(dateKey) || { 
            timestamp: item.timestamp,
            date: new Date(item.timestamp).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: selectedSeason && selectedSeason !== 'all' ? undefined : '2-digit'
            })
          };
          dataMap.set(dateKey, {
            ...existing,
            cleanedDepth: item.dbtcdt || item.cleaned_depth
          });
        });
        
        const chartData = Array.from(dataMap.values())
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        
        setData(chartData);
      } else {
        // Single database request - optimized
        const snowData = await LocalDatabaseService.getSnowDepthTimeSeries(
          databaseName,
          selectedLocation,
          startDate,
          endDate,
          seasonParam,
          selectedYear,
          'both'
        );
        
        // Transform data for chart with minimal processing
        const chartData = snowData.map(item => ({
          ...item,
          date: new Date(item.timestamp).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: selectedSeason && selectedSeason !== 'all' ? undefined : '2-digit'
          }),
          rawDepth: selectedDatabase === 'raw' ? (item.dbtcdt || item.raw_depth) : undefined,
          cleanedDepth: selectedDatabase === 'cleaned' ? (item.dbtcdt || item.cleaned_depth) : undefined
        }));
        
        setData(chartData);
      }
    } catch (error) {
      console.error('Failed to load snow depth data:', error);
      setData([]); // Set empty data on error
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const stats = React.useMemo(() => {
    if (!data.length) return { avgRaw: 0, avgCleaned: 0, maxRaw: 0, maxCleaned: 0, improvement: 0 };
    
    const rawDepths = data.map(d => d.rawDepth || 0).filter(Boolean);
    const cleanedDepths = data.map(d => d.cleanedDepth || 0).filter(Boolean);
    
    const avgRaw = rawDepths.length > 0 ? rawDepths.reduce((sum, val) => sum + val, 0) / rawDepths.length : 0;
    const avgCleaned = cleanedDepths.length > 0 ? cleanedDepths.reduce((sum, val) => sum + val, 0) / cleanedDepths.length : 0;
    const maxRaw = rawDepths.length > 0 ? Math.max(...rawDepths) : 0;
    const maxCleaned = cleanedDepths.length > 0 ? Math.max(...cleanedDepths) : 0;
    
    // Calculate variance reduction as data quality improvement
    const rawVariance = rawDepths.length > 0 ? rawDepths.reduce((sum, val) => sum + Math.pow(val - avgRaw, 2), 0) / rawDepths.length : 0;
    const cleanedVariance = cleanedDepths.length > 0 ? cleanedDepths.reduce((sum, val) => sum + Math.pow(val - avgCleaned, 2), 0) / cleanedDepths.length : 0;
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
            DBTCDT measurements from <strong>{selectedDatabase === 'raw' ? 'rawdata' : 'finalcleandata'}</strong> database
          </p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 w-full lg:w-auto">
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="min-w-36">
              <MapPin className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Location" />
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
            <SelectTrigger className="min-w-32">
              <Database className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="raw">Raw Data</SelectItem>
              <SelectItem value="cleaned">Final Clean</SelectItem>
              <SelectItem value="both">Compare Both</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="min-w-24">
              <CalendarDays className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedSeason} onValueChange={setSelectedSeason}>
            <SelectTrigger className="min-w-32">
              <SelectValue placeholder="Season" />
            </SelectTrigger>
            <SelectContent>
              {seasons.map((season) => (
                <SelectItem key={season.value} value={season.value}>
                  {season.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setSelectedYear('2023');
              setSelectedSeason('');
              setSelectedDatabase('raw');
            }}
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Database Info Badge */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary" className="flex items-center gap-1">
          <Database className="h-3 w-3" />
          Database: {selectedDatabase === 'raw' ? 'rawdata' : 'finalcleandata'}
        </Badge>
        <Badge variant="outline">
          Year: {selectedYear}
        </Badge>
        {selectedSeason && (
          <Badge variant="outline">
            Season: {seasons.find(s => s.value === selectedSeason)?.label}
          </Badge>
        )}
        <Badge variant="outline">
          Data Points: {data.length}
        </Badge>
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
            <CardTitle className="text-lg">
              Snow Depth Time Series - {selectedYear} {selectedSeason ? `(${seasons.find(s => s.value === selectedSeason)?.label})` : ''}
            </CardTitle>
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
                    stroke="hsl(220 70% 50%)" 
                    strokeWidth={2}
                    name="Raw Data"
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cleanedDepth" 
                    stroke="hsl(142 76% 36%)" 
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
                    stroke="hsl(220 70% 50%)" 
                    fill="hsl(220 70% 50% / 0.3)"
                    name="Raw Data"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="cleanedDepth" 
                    stackId="2"
                    stroke="hsl(142 76% 36%)" 
                    fill="hsl(142 76% 36% / 0.3)"
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
          <CardTitle className="text-lg">Data Quality Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Database Information</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Source Database:</span>
                  <span className="font-medium">{selectedDatabase === 'raw' ? 'rawdata' : 'finalcleandata'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Time Period:</span>
                  <span className="font-medium">{selectedYear} {selectedSeason && selectedSeason !== 'all' ? `(${seasons.find(s => s.value === selectedSeason)?.label})` : '(Full Year)'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Location:</span>
                  <span className="font-medium">{selectedLocation}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Data Points:</span>
                  <span className="font-medium">{data.length}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Quality Metrics</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">{stats.avgRaw.toFixed(1)} cm</div>
                  <p className="text-xs text-muted-foreground">Raw Average</p>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="text-lg font-bold text-green-600">{stats.avgCleaned.toFixed(1)} cm</div>
                  <p className="text-xs text-muted-foreground">Cleaned Average</p>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Variance Improvement:</span>
                  <Badge variant={stats.improvement > 0 ? "default" : "secondary"}>
                    {stats.improvement > 0 ? '+' : ''}{stats.improvement.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SnowDepthChart;