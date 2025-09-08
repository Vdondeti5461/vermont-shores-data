import React from 'react';
import RealTimeConditions from '@/components/RealTimeConditions';
import TemperatureProfile from '@/components/TemperatureProfile';
import WindGauge from '@/components/WindGauge';
import SnowDepthChart from '@/components/SnowDepthChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingUp, MapPin } from 'lucide-react';

const Overview = () => {
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
              Live Data
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <SnowDepthChart className="w-full" />
        </CardContent>
      </Card>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Active Stations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">22</div>
            <p className="text-sm text-muted-foreground">Monitoring locations</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Data Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">96.2%</div>
            <p className="text-sm text-muted-foreground">Valid measurements</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Coverage Period</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">3</div>
            <p className="text-sm text-muted-foreground">Years of data</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Overview;