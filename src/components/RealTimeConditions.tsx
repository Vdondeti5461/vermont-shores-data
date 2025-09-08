import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Thermometer, Wind, Droplets, Mountain, Activity } from 'lucide-react';
import { useOptimizedAnalytics } from '@/hooks/useOptimizedAnalytics';

const RealTimeConditions = () => {
  const { analyticsData, computedMetrics, selectedLocation, locations } = useOptimizedAnalytics();
  
  // Get the latest data point for current conditions
  const latestData = analyticsData[analyticsData.length - 1];
  const selectedLocationName = locations.find(l => l.id === selectedLocation)?.name || 'All Locations';
  
  const getConditionBadge = (value: number, type: 'temperature' | 'wind' | 'humidity' | 'precipitation') => {
    switch (type) {
      case 'temperature':
        if (value < -5) return { variant: 'destructive' as const, label: 'Very Cold' };
        if (value < 15) return { variant: 'outline' as const, label: 'Cold' };
        if (value < 32) return { variant: 'secondary' as const, label: 'Cool' };
        return { variant: 'default' as const, label: 'Mild' };
      case 'wind':
        if (value > 30) return { variant: 'destructive' as const, label: 'High' };
        if (value > 15) return { variant: 'outline' as const, label: 'Moderate' };
        return { variant: 'secondary' as const, label: 'Light' };
      case 'humidity':
        if (value > 80) return { variant: 'secondary' as const, label: 'High' };
        if (value > 60) return { variant: 'outline' as const, label: 'Moderate' };
        return { variant: 'default' as const, label: 'Low' };
      case 'precipitation':
        if (value > 1) return { variant: 'default' as const, label: 'Heavy' };
        if (value > 0.1) return { variant: 'secondary' as const, label: 'Light' };
        return { variant: 'outline' as const, label: 'Trace' };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Current Conditions - {selectedLocationName}</h3>
        {latestData && (
          <Badge variant="outline" className="text-xs">
            Last updated: {new Date(latestData.timestamp).toLocaleDateString()}
          </Badge>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Mountain className="h-4 w-4" />
              Snow Depth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestData ? `${latestData.snow_depth_clean.toFixed(1)}"` : `${computedMetrics.avgSnowDepth.toFixed(1)}"`}
            </div>
            <Badge variant="secondary" className="text-xs">
              {latestData ? 'Current' : 'Average'}
            </Badge>
            {latestData && (
              <p className="text-xs text-muted-foreground mt-1">
                Raw: {latestData.snow_depth_raw.toFixed(1)}"
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Thermometer className="h-4 w-4" />
              Temperature
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestData ? `${latestData.temperature.toFixed(1)}°F` : `${computedMetrics.avgTemperature.toFixed(1)}°F`}
            </div>
            <Badge 
              variant={getConditionBadge(latestData?.temperature || computedMetrics.avgTemperature, 'temperature').variant} 
              className="text-xs"
            >
              {getConditionBadge(latestData?.temperature || computedMetrics.avgTemperature, 'temperature').label}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">
              {latestData ? 'Current' : 'Season avg'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Droplets className="h-4 w-4" />
              Precipitation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestData ? `${latestData.precipitation.toFixed(1)}"` : `${computedMetrics.avgPrecipitation.toFixed(1)}"`}
            </div>
            <Badge 
              variant={getConditionBadge(latestData?.precipitation || computedMetrics.avgPrecipitation, 'precipitation').variant} 
              className="text-xs"
            >
              {getConditionBadge(latestData?.precipitation || computedMetrics.avgPrecipitation, 'precipitation').label}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">
              {latestData ? 'Daily total' : 'Daily avg'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wind className="h-4 w-4" />
              Wind Speed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestData ? `${latestData.wind_speed.toFixed(1)} mph` : `${computedMetrics.avgWindSpeed.toFixed(1)} mph`}
            </div>
            <Badge 
              variant={getConditionBadge(latestData?.wind_speed || computedMetrics.avgWindSpeed, 'wind').variant} 
              className="text-xs"
            >
              {getConditionBadge(latestData?.wind_speed || computedMetrics.avgWindSpeed, 'wind').label}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">
              {latestData ? 'Current' : 'Average'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Humidity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestData ? `${latestData.humidity.toFixed(0)}%` : `${computedMetrics.avgHumidity?.toFixed(0) || 'N/A'}%`}
            </div>
            <Badge 
              variant={getConditionBadge(latestData?.humidity || computedMetrics.avgHumidity || 0, 'humidity').variant} 
              className="text-xs"
            >
              {getConditionBadge(latestData?.humidity || computedMetrics.avgHumidity || 0, 'humidity').label}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">
              Relative humidity
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RealTimeConditions;