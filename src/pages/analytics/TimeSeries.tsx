import React, { useState } from 'react';
import AnalyticsSnowDepthChart from '@/components/AnalyticsSnowDepthChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { TrendingUp, Calendar, Download, Filter, BarChart3 } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { useOptimizedAnalytics } from '@/hooks/useOptimizedAnalytics';

const TimeSeries = () => {
  const { computedMetrics, analyticsData, selectedLocation, locations } = useOptimizedAnalytics();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [chartType, setChartType] = useState<'line' | 'area'>('line');
  const [showRawData, setShowRawData] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const selectedLocationName = locations.find(l => l.id === selectedLocation)?.name || 'All Locations';

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

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Analysis Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <DatePickerWithRange
                  date={dateRange}
                  onDateChange={setDateRange}
                />
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
                <label className="text-sm font-medium">Data Display</label>
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