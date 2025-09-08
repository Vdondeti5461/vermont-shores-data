import React from 'react';
import RealTimeConditions from '@/components/RealTimeConditions';
import TemperatureProfile from '@/components/TemperatureProfile';
import WindGauge from '@/components/WindGauge';
import AnalyticsSnowDepthChart from '@/components/AnalyticsSnowDepthChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingUp, MapPin, Database } from 'lucide-react';
import { useOptimizedAnalytics } from '@/hooks/useOptimizedAnalytics';

const Overview = () => {
  const { computedMetrics, locations, seasons, selectedSeason } = useOptimizedAnalytics();
  
  return (
    <div className="space-y-6">
      {/* Current Conditions */}
      <RealTimeConditions />
      
      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TemperatureProfile />
        <WindGauge />
      </div>
      
      {/* Time Series Analysis */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Snow Depth Time Series
            </CardTitle>
            <Badge variant="outline">
              <Activity className="h-3 w-3 mr-1" />
              Real Data
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <AnalyticsSnowDepthChart className="w-full" />
        </CardContent>
      </Card>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{locations.length}</div>
            <p className="text-sm text-muted-foreground">Monitoring sites</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="h-4 w-4" />
              Data Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{computedMetrics.dataPoints.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">Total measurements</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Season Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{seasons.length}</div>
            <p className="text-sm text-muted-foreground">Available seasons</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Avg Snow Depth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-cyan-600">{computedMetrics.avgSnowDepth.toFixed(1)}"</div>
            <p className="text-sm text-muted-foreground">Current season</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Overview;