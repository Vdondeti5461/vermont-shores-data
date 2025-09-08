import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useOptimizedAnalytics } from '@/hooks/useOptimizedAnalytics';
import { Skeleton } from '@/components/ui/skeleton';

interface AnalyticsSnowDepthChartProps {
  className?: string;
  chartType?: 'line' | 'area';
  showRawData?: boolean;
}

const AnalyticsSnowDepthChart: React.FC<AnalyticsSnowDepthChartProps> = ({ 
  className = '', 
  chartType = 'line',
  showRawData = true 
}) => {
  const { analyticsData, isLoading, selectedLocation, selectedSeason, locations, seasons } = useOptimizedAnalytics();

  // Transform data for chart display
  const chartData = useMemo(() => {
    return analyticsData.map((item, index) => ({
      date: new Date(item.timestamp).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      }),
      timestamp: item.timestamp,
      cleanedDepth: item.snow_depth_clean,
      rawDepth: showRawData ? item.snow_depth_raw : undefined,
      temperature: item.temperature,
      precipitation: item.precipitation,
      windSpeed: item.wind_speed,
      humidity: item.humidity
    }));
  }, [analyticsData, showRawData]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!analyticsData.length) return { avgDepth: 0, maxDepth: 0, dataPoints: 0 };
    
    const depths = analyticsData.map(d => d.snow_depth_clean);
    const avgDepth = depths.reduce((sum, val) => sum + val, 0) / depths.length;
    const maxDepth = Math.max(...depths);
    
    return { 
      avgDepth: Math.round(avgDepth * 10) / 10, 
      maxDepth: Math.round(maxDepth * 10) / 10, 
      dataPoints: analyticsData.length 
    };
  }, [analyticsData]);

  const selectedLocationName = locations.find(l => l.id === selectedLocation)?.name || 'All Locations';
  const selectedSeasonName = seasons.find(s => s.id === selectedSeason)?.name || '';

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border">
          <p className="font-medium mb-2">{`Date: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.dataKey === 'rawDepth' ? 'Raw' : 'Clean'} Snow Depth: ${entry.value?.toFixed(2)}"`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">
            Snow Depth Analysis - {selectedLocationName}
          </h3>
          <p className="text-muted-foreground text-sm">
            {selectedSeasonName} • {stats.dataPoints} data points
          </p>
        </div>
        
        <div className="flex gap-2">
          <Badge variant="outline">
            Avg: {stats.avgDepth}"
          </Badge>
          <Badge variant="outline">
            Max: {stats.maxDepth}"
          </Badge>
        </div>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Snow Depth Time Series
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 md:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    label={{ value: 'Snow Depth (inches)', angle: -90, position: 'insideLeft' }}
                    className="text-xs"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="cleanedDepth" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Clean Snow Depth"
                    dot={{ r: 2 }}
                    activeDot={{ r: 4 }}
                  />
                  {showRawData && (
                    <Line 
                      type="monotone" 
                      dataKey="rawDepth" 
                      stroke="hsl(var(--muted-foreground))" 
                      strokeWidth={1}
                      strokeDasharray="3 3"
                      name="Raw Snow Depth"
                      dot={{ r: 1 }}
                      activeDot={{ r: 3 }}
                    />
                  )}
                </LineChart>
              ) : (
                <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    label={{ value: 'Snow Depth (inches)', angle: -90, position: 'insideLeft' }}
                    className="text-xs"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="cleanedDepth" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary) / 0.3)"
                    name="Clean Snow Depth"
                  />
                  {showRawData && (
                    <Area 
                      type="monotone" 
                      dataKey="rawDepth" 
                      stroke="hsl(var(--muted-foreground))" 
                      fill="hsl(var(--muted-foreground) / 0.1)"
                      name="Raw Snow Depth"
                    />
                  )}
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsSnowDepthChart;