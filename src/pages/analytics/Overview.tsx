import React from 'react';
import AnalyticsSnowDepthChart from '@/components/AnalyticsSnowDepthChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, TrendingUp, MapPin, Database, Calendar, Filter, Thermometer } from 'lucide-react';
import { useOptimizedAnalytics } from '@/hooks/useOptimizedAnalytics';

const Overview = () => {
  const { 
    computedMetrics, 
    locations, 
    seasons, 
    selectedSeason, 
    selectedLocation,
    setSelectedLocation,
    setSelectedSeason,
    isLoading 
  } = useOptimizedAnalytics();
  
  const selectedLocationName = locations.find(l => l.id === selectedLocation)?.name || 'All Locations';
  const selectedSeasonName = seasons.find(s => s.id === selectedSeason)?.name || selectedSeason;
  
  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Analysis Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
              </label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((location) => (
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
                  {seasons.map((season) => (
                    <SelectItem key={season.id} value={season.id}>
                      {season.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-4 flex gap-2">
            <Badge variant="outline">
              Location: {selectedLocationName}
            </Badge>
            <Badge variant="outline">
              Season: {selectedSeasonName}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Raw vs Cleaned Data Analysis */}
      <AnalyticsSnowDepthChart 
        className="w-full" 
        showRawData={true}
        chartType="line"
      />
      
      {/* Temperature Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5" />
            Temperature Analysis - {selectedLocationName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-4">
            {selectedSeasonName} • Average: {computedMetrics.avgTemperature.toFixed(1)}°F
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{computedMetrics.maxTemperature.toFixed(1)}°F</div>
              <div className="text-xs text-muted-foreground">Max Temp</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{computedMetrics.minTemperature.toFixed(1)}°F</div>
              <div className="text-xs text-muted-foreground">Min Temp</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">{computedMetrics.avgTemperature.toFixed(1)}°F</div>
              <div className="text-xs text-muted-foreground">Avg Temp</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">{computedMetrics.avgHumidity.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">Humidity</div>
            </div>
          </div>
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