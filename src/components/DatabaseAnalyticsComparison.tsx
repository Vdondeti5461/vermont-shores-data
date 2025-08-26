import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart
} from 'recharts';
import { TrendingUp, TrendingDown, Database, BarChart3, Activity, RefreshCw } from 'lucide-react';
import { LocalDatabaseService, AnalyticsData } from '@/services/localDatabaseService';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface ComparisonData {
  metric: string;
  raw_data: number | null;
  clean_data: number | null;
  processed_data: number | null;
  improvement_clean: string;
  improvement_processed: string;
}

const DatabaseAnalyticsComparison = () => {
  const { toast } = useToast();
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedSeason, setSelectedSeason] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [databases, setDatabases] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<Record<string, AnalyticsData>>({});
  
  useEffect(() => {
    loadDatabasesInfo();
  }, []);

  useEffect(() => {
    if (databases.length > 0) {
      loadLocations();
    }
  }, [databases]);

  useEffect(() => {
    if (selectedLocation && selectedSeason && databases.length > 0) {
      loadAnalyticsComparison();
    }
  }, [selectedLocation, selectedSeason, databases]);

  const loadDatabasesInfo = async () => {
    try {
      const info = await LocalDatabaseService.getDatabasesInfo();
      setDatabases(info.databases);
      setSeasons(info.seasons);
    } catch (error) {
      console.error('Error loading databases info:', error);
      toast({
        title: "Error",
        description: "Failed to load databases information",
        variant: "destructive"
      });
    }
  };

  const loadLocations = async () => {
    try {
      const locs = await LocalDatabaseService.getLocations('raw_data');
      setLocations(locs);
      if (locs.length > 0 && !selectedLocation) {
        setSelectedLocation(locs[0].name);
      }
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  const loadAnalyticsComparison = async () => {
    setIsLoading(true);
    try {
      const results: Record<string, AnalyticsData> = {};
      
      for (const db of databases) {
        const analytics = await LocalDatabaseService.getAnalyticsSummary(
          db.id,
          selectedLocation,
          undefined,
          undefined,
          selectedSeason
        );
        results[db.id] = analytics;
      }
      
      setAnalyticsData(results);
    } catch (error) {
      console.error('Error loading analytics comparison:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics comparison data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateComparisonData = (): ComparisonData[] => {
    const metrics = [
      { key: 'temperature.average', label: 'Avg Temperature (°C)', unit: '°C' },
      { key: 'temperature.min', label: 'Min Temperature (°C)', unit: '°C' },
      { key: 'temperature.max', label: 'Max Temperature (°C)', unit: '°C' },
      { key: 'wind.average_speed', label: 'Avg Wind Speed (m/s)', unit: 'm/s' },
      { key: 'wind.max_speed', label: 'Max Wind Speed (m/s)', unit: 'm/s' },
      { key: 'precipitation.total', label: 'Total Precipitation (mm)', unit: 'mm' },
      { key: 'snow.average_swe', label: 'Avg Snow Water Equivalent (mm)', unit: 'mm' },
      { key: 'humidity.average', label: 'Avg Humidity (%)', unit: '%' }
    ];

    return metrics.map(metric => {
      const getValue = (dbId: string) => {
        const data = analyticsData[dbId];
        if (!data) return null;
        
        const keys = metric.key.split('.');
        let value: any = data;
        for (const key of keys) {
          value = value?.[key];
        }
        return typeof value === 'number' ? value : null;
      };

      const rawValue = getValue('raw_data');
      const cleanValue = getValue('clean_data');
      const processedValue = getValue('processed_data');

      const calculateImprovement = (baseline: number | null, improved: number | null) => {
        if (!baseline || !improved) return 'N/A';
        const diff = ((improved - baseline) / baseline) * 100;
        return `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`;
      };

      return {
        metric: metric.label,
        raw_data: rawValue,
        clean_data: cleanValue,
        processed_data: processedValue,
        improvement_clean: calculateImprovement(rawValue, cleanValue),
        improvement_processed: calculateImprovement(rawValue, processedValue)
      };
    });
  };

  const comparisonData = generateComparisonData();

  if (isLoading && Object.keys(analyticsData).length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Database Analytics Comparison</h2>
          <p className="text-muted-foreground">Loading comparison data...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-8 w-8 mb-4" />
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <Badge variant="outline" className="mb-4">
          Data Quality Comparison
        </Badge>
        <h2 className="text-3xl font-bold mb-4">
          <span className="text-primary">Database</span> Analytics Comparison
        </h2>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          Compare environmental data quality and metrics across raw, clean, and processed databases 
          to understand data processing improvements and seasonal variations.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <div className="space-y-2">
          <label className="text-sm font-medium">Location</label>
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map(location => (
                <SelectItem key={location.id} value={location.name}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Season</label>
          <Select value={selectedSeason} onValueChange={setSelectedSeason}>
            <SelectTrigger className="w-48">
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
          <label className="text-sm font-medium opacity-0">Actions</label>
          <Button 
            onClick={loadAnalyticsComparison} 
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Database Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {databases.map((db, index) => {
          const analytics = analyticsData[db.id];
          const colors = ['border-blue-500', 'border-green-500', 'border-purple-500'];
          const bgColors = ['bg-blue-500/10', 'bg-green-500/10', 'bg-purple-500/10'];
          
          return (
            <Card key={db.id} className={`${colors[index]} border-2`}>
              <CardHeader className={`${bgColors[index]}`}>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  {db.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {analytics ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Temperature Range</p>
                      <p className="text-lg font-bold">
                        {analytics.temperature.min?.toFixed(1)}° to {analytics.temperature.max?.toFixed(1)}°C
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Records</p>
                      <p className="text-lg font-bold">
                        {analytics.temperature.count + analytics.wind.count + analytics.precipitation.count}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Data Quality</p>
                      <Badge variant={db.id === 'processed_data' ? 'default' : db.id === 'clean_data' ? 'secondary' : 'outline'}>
                        {db.id === 'processed_data' ? 'High' : db.id === 'clean_data' ? 'Good' : 'Raw'}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Comparison Analytics */}
      <Tabs defaultValue="comparison" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="comparison" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Comparison Table
          </TabsTrigger>
          <TabsTrigger value="charts" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Visual Charts
          </TabsTrigger>
          <TabsTrigger value="improvements" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Data Improvements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle>Metric Comparison Across Databases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Metric</th>
                      <th className="text-center p-3">Raw Data</th>
                      <th className="text-center p-3">Clean Data</th>
                      <th className="text-center p-3">Processed Data</th>
                      <th className="text-center p-3">Clean Improvement</th>
                      <th className="text-center p-3">Processed Improvement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.map((row, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="p-3 font-medium">{row.metric}</td>
                        <td className="p-3 text-center">{row.raw_data?.toFixed(2) || 'N/A'}</td>
                        <td className="p-3 text-center">{row.clean_data?.toFixed(2) || 'N/A'}</td>
                        <td className="p-3 text-center">{row.processed_data?.toFixed(2) || 'N/A'}</td>
                        <td className="p-3 text-center">
                          <Badge variant={row.improvement_clean.includes('+') ? 'default' : 'secondary'}>
                            {row.improvement_clean}
                          </Badge>
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant={row.improvement_processed.includes('+') ? 'default' : 'secondary'}>
                            {row.improvement_processed}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Temperature Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={comparisonData.slice(0, 3)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metric" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="raw_data" fill="#3b82f6" name="Raw Data" />
                    <Bar dataKey="clean_data" fill="#10b981" name="Clean Data" />
                    <Bar dataKey="processed_data" fill="#8b5cf6" name="Processed Data" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Wind Speed Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={comparisonData.slice(3, 5)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metric" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="raw_data" fill="#3b82f6" name="Raw Data" />
                    <Bar dataKey="clean_data" fill="#10b981" name="Clean Data" />
                    <Bar dataKey="processed_data" fill="#8b5cf6" name="Processed Data" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="improvements">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {comparisonData.map((item, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">{item.metric}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Clean vs Raw:</span>
                      <Badge variant={item.improvement_clean.includes('+') ? 'default' : 'secondary'}>
                        {item.improvement_clean}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Processed vs Raw:</span>
                      <Badge variant={item.improvement_processed.includes('+') ? 'default' : 'secondary'}>
                        {item.improvement_processed}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DatabaseAnalyticsComparison;