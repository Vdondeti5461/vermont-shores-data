import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Loader2, TrendingUp, Database as DatabaseIcon, MapPin, Calendar } from 'lucide-react';
import { useRealTimeAnalyticsState } from '@/hooks/useRealTimeAnalytics';
import { TimeSeriesComparison } from './TimeSeriesComparison';
import { API_BASE_URL } from '@/lib/apiConfig';
import { DatabaseType, TableType } from '@/services/realTimeAnalyticsService';

const TABLE_LABELS: Record<TableType, string> = {
  'raw_env_core_observations': 'Core Environmental Observations',
  'raw_env_wind_observations': 'Wind Observations',
  'raw_env_snowpack_temperature_profile': 'Snowpack Temperature Profile',
  'raw_env_precipitation_observations': 'Precipitation Observations',
};

const DATABASE_LABELS: Record<DatabaseType, string> = {
  'CRRELS2S_raw_data_ingestion': 'Raw Data',
  'CRRELS2S_stage_clean_data': 'Clean Data',
  'CRRELS2S_stage_qaqc_data': 'QAQC Data',
  'CRRELS2S_seasonal_qaqc_data': 'Seasonal QAQC Data',
};

export const Analytics = () => {
  const {
    databases,
    locations,
    attributes,
    timeSeriesData,
    comparisonData,
    selectedDatabase,
    selectedTable,
    selectedLocation,
    selectedAttributes,
    comparisonMode,
    comparisonDatabases,
    setSelectedDatabase,
    setSelectedTable,
    setSelectedLocation,
    setSelectedAttributes,
    setComparisonMode,
    setComparisonDatabases,
    isLoading,
  } = useRealTimeAnalyticsState();

  const handleAttributeToggle = (attribute: string) => {
    setSelectedAttributes((prev) =>
      prev.includes(attribute)
        ? prev.filter((a) => a !== attribute)
        : [...prev, attribute]
    );
  };

  const handleDatabaseToggle = (database: DatabaseType) => {
    setComparisonDatabases((prev) =>
      prev.includes(database)
        ? prev.filter((d) => d !== database)
        : [...prev, database]
    );
  };

  // Prepare chart data with better formatting
  const chartData = timeSeriesData?.map((point) => {
    const date = new Date(point.timestamp);
    return {
      timestamp: point.timestamp,
      displayTime: date.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      fullTimestamp: date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      ...selectedAttributes.reduce((acc, attr) => ({
        ...acc,
        [attr]: point[attr],
      }), {}),
    };
  }) || [];

  const tables: TableType[] = [
    'raw_env_core_observations',
    'raw_env_wind_observations',
    'raw_env_snowpack_temperature_profile',
    'raw_env_precipitation_observations'
  ];

  // Debug logging
  console.log('Analytics component render - databases:', databases);
  console.log('Analytics component render - isLoading:', isLoading);
  console.log('Analytics component render - API_BASE_URL:', API_BASE_URL);

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {!isLoading && (!databases || databases.length === 0) && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Database Connection Issue</CardTitle>
            <CardDescription>
              Unable to fetch databases from the API server. Please check:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• Backend API server is running on <code className="bg-muted px-2 py-1 rounded">{API_BASE_URL}</code></p>
            <p>• CORS is properly configured</p>
            <p>• Network connection is stable</p>
            <p className="mt-4 text-muted-foreground">Check browser console (F12) for detailed error messages.</p>
          </CardContent>
        </Card>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Time Series Analytics</h2>
          <p className="text-muted-foreground">
            Analyze environmental data across multiple quality levels
          </p>
        </div>
        <Button
          variant={comparisonMode ? "default" : "outline"}
          onClick={() => setComparisonMode(!comparisonMode)}
        >
          {comparisonMode ? "Single View" : "Compare Quality Levels"}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DatabaseIcon className="h-5 w-5" />
            Data Selection
          </CardTitle>
          <CardDescription>
            Select database, table, location, and attributes to analyze
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Database Selection */}
          {!comparisonMode && (
            <div className="space-y-2">
              <Label>Database</Label>
              <Select
                value={selectedDatabase}
                onValueChange={(value) => setSelectedDatabase(value as DatabaseType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select database" />
                </SelectTrigger>
                <SelectContent>
                  {databases && databases.length > 0 ? (
                    databases.map((db) => (
                      <SelectItem key={db.id} value={db.id}>
                        {DATABASE_LABELS[db.id] || db.displayName || db.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-databases" disabled>
                      No databases available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Comparison Mode - Select Multiple Databases */}
          {comparisonMode && (
            <div className="space-y-2">
              <Label>Select Databases to Compare</Label>
              <div className="grid grid-cols-2 gap-3">
                {databases && databases.length > 0 ? (
                  databases.map((db) => (
                    <div key={db.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={db.id}
                        checked={comparisonDatabases.includes(db.id)}
                        onCheckedChange={() => handleDatabaseToggle(db.id)}
                      />
                      <label
                        htmlFor={db.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {DATABASE_LABELS[db.id] || db.displayName || db.name}
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground col-span-2">
                    No databases available
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Table Selection */}
          <div className="space-y-2">
            <Label>Observation Table</Label>
            <Select
              value={selectedTable}
              onValueChange={(value) => setSelectedTable(value as TableType)}
              disabled={!selectedDatabase && !comparisonMode}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select table" />
              </SelectTrigger>
              <SelectContent>
                {tables.map((table) => (
                  <SelectItem key={table} value={table}>
                    {TABLE_LABELS[table]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </Label>
            <Select
              value={selectedLocation}
              onValueChange={setSelectedLocation}
              disabled={!selectedTable}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locations?.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Attribute Selection */}
          <div className="space-y-2">
            <Label>Attributes to Plot</Label>
            <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto p-2 border rounded-md">
              {attributes?.map((attr) => (
                <div key={attr.name} className="flex items-center space-x-2">
                  <Checkbox
                    id={attr.name}
                    checked={selectedAttributes.includes(attr.name)}
                    onCheckedChange={() => handleAttributeToggle(attr.name)}
                  />
                  <label
                    htmlFor={attr.name}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {attr.name.replace(/_/g, ' ')}
                    {attr.unit && <span className="text-xs text-muted-foreground ml-1">({attr.unit})</span>}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      )}

      {/* Comparison Mode */}
      {comparisonMode && !isLoading && (
        <TimeSeriesComparison
          comparisonData={comparisonData || []}
          selectedAttributes={selectedAttributes}
          isLoading={isLoading}
        />
      )}

      {/* Single View Mode */}
      {!comparisonMode && !isLoading && selectedAttributes.length > 0 && chartData.length > 0 && (
        <div className="space-y-6">
          {selectedAttributes.map((attribute) => {
            const attributeInfo = attributes?.find(a => a.name === attribute);
            return (
              <Card key={attribute}>
                <CardHeader>
                  <div className="space-y-1">
                    <CardTitle className="text-2xl font-bold">
                      {selectedLocation} {selectedTable && `(${TABLE_LABELS[selectedTable]})`}
                    </CardTitle>
                    <CardDescription className="text-base">
                      <span className="capitalize">{attribute.replace(/_/g, ' ')}</span>
                      {attributeInfo?.unit && <span> ({attributeInfo.unit})</span>}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={500}>
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke="hsl(var(--border))" 
                        opacity={0.3} 
                      />
                      <XAxis
                        dataKey="displayTime"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        label={{ 
                          value: attributeInfo?.unit || '', 
                          angle: -90, 
                          position: 'insideLeft',
                          style: { fill: 'hsl(var(--muted-foreground))' }
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          padding: '12px'
                        }}
                        labelFormatter={(value) => {
                          const point = chartData.find(d => d.displayTime === value);
                          return point?.fullTimestamp || value;
                        }}
                        formatter={(value: any) => [
                          `${typeof value === 'number' ? value.toFixed(2) : value} ${attributeInfo?.unit || ''}`,
                          attribute.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey={attribute}
                        stroke="hsl(var(--primary))"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: 'hsl(var(--primary))' }}
                        activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                        connectNulls
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && selectedAttributes.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Select attributes above to visualize time series data
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
