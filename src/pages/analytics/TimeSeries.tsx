import React, { useState } from 'react';
import AnalyticsSnowDepthChart from '@/components/AnalyticsSnowDepthChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { TrendingUp, Calendar, Download, Filter, BarChart3, MapPin } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { useOptimizedAnalytics } from '@/hooks/useOptimizedAnalytics';

const TimeSeries = () => {
  const { 
    computedMetrics, 
    analyticsData, 
    selectedLocation, 
    selectedSeason,
    locations, 
    seasons,
    setSelectedLocation,
    setSelectedSeason,
    isLoading 
  } = useOptimizedAnalytics();
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [chartType, setChartType] = useState<'line' | 'area'>('line');
  const [showRawData, setShowRawData] = useState(true);
  const [showFilters, setShowFilters] = useState(true);

  const selectedLocationName = locations.find(l => l.id === selectedLocation)?.name || 'All Locations';
  const selectedSeasonName = seasons.find(s => s.id === selectedSeason)?.name || selectedSeason;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            Time Series Analysis
          </h2>
          <p className="text-muted-foreground">
            Detailed temporal analysis of snow depth measurements with advanced filtering options
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Filters Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Analysis Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Chart Type</label>
              <Select value={chartType} onValueChange={(value) => setChartType(value as 'line' | 'area')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select chart type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="area">Area Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Options</label>
              <div className="flex gap-2">
                <Badge 
                  variant={showRawData ? "secondary" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setShowRawData(!showRawData)}
                >
                  {showRawData ? 'Hide' : 'Show'} Raw Data
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="outline">
              Location: {selectedLocationName}
            </Badge>
            <Badge variant="outline">
              Season: {selectedSeasonName}
            </Badge>
            <Badge variant="outline">
              Data Points: {computedMetrics.dataPoints.toLocaleString()}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Advanced Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range Override</label>
                <DatePickerWithRange
                  date={dateRange}
                  onDateChange={setDateRange}
                />
                <p className="text-xs text-muted-foreground">
                  Override season dates with custom range
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Data Quality</label>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Quality Score:</span>
                    <span className="font-medium text-green-600">96%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Valid Records:</span>
                    <span className="font-medium">{computedMetrics.dataPoints}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Temperature Range:</span>
                    <span className="font-medium">{computedMetrics.minTemperature}° - {computedMetrics.maxTemperature}°F</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Snow Depth Time Series - {selectedLocationName}
            </CardTitle>
            <Badge variant="outline">
              {dateRange?.from ? `${dateRange.from.toLocaleDateString()} - ${dateRange.to?.toLocaleDateString() || 'Present'}` : 'Full Season'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <AnalyticsSnowDepthChart 
            className="w-full" 
            chartType={chartType}
            showRawData={showRawData}
          />
        </CardContent>
      </Card>

      {/* Statistical Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Average Depth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{computedMetrics.avgSnowDepth.toFixed(1)}"</div>
            <p className="text-sm text-muted-foreground">Seasonal average</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Peak Depth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{computedMetrics.maxSnowDepth.toFixed(1)}"</div>
            <p className="text-sm text-muted-foreground">Maximum recorded</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Data Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{computedMetrics.dataPoints.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">Valid measurements</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Temperature Range</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{computedMetrics.minTemperature.toFixed(1)}° - {computedMetrics.maxTemperature.toFixed(1)}°F</div>
            <p className="text-sm text-muted-foreground">Min - Max temp</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TimeSeries;