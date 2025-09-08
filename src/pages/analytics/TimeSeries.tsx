import React, { useState } from 'react';
import SnowDepthChart from '@/components/SnowDepthChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { TrendingUp, Calendar, Download, Filter } from 'lucide-react';
import { DateRange } from 'react-day-picker';

const TimeSeries = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [timeResolution, setTimeResolution] = useState('daily');
  const [showFilters, setShowFilters] = useState(false);

  const timeResolutions = [
    { value: 'hourly', label: 'Hourly' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

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
                <label className="text-sm font-medium">Time Resolution</label>
                <Select value={timeResolution} onValueChange={setTimeResolution}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select resolution" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeResolutions.map((resolution) => (
                      <SelectItem key={resolution.value} value={resolution.value}>
                        {resolution.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Data Type</label>
                <div className="flex gap-2">
                  <Badge variant="secondary">Raw</Badge>
                  <Badge variant="secondary">Cleaned</Badge>
                  <Badge variant="outline">Both</Badge>
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
              <Calendar className="h-5 w-5" />
              Snow Depth Time Series - {timeResolution.charAt(0).toUpperCase() + timeResolution.slice(1)} Resolution
            </CardTitle>
            <Badge variant="outline">
              {dateRange?.from ? `${dateRange.from.toLocaleDateString()} - ${dateRange.to?.toLocaleDateString() || 'Present'}` : 'All Time'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <SnowDepthChart className="w-full" />
        </CardContent>
      </Card>

      {/* Statistical Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Average Depth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">24.7"</div>
            <p className="text-sm text-muted-foreground">Seasonal average</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Peak Depth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">78.3"</div>
            <p className="text-sm text-muted-foreground">Maximum recorded</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Data Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">15,432</div>
            <p className="text-sm text-muted-foreground">Valid measurements</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">98.7%</div>
            <p className="text-sm text-muted-foreground">Data completeness</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TimeSeries;