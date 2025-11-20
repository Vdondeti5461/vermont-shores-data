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

  // Prepare chart data
  const chartData = timeSeriesData?.map((point) => ({
    timestamp: new Date(point.timestamp).toLocaleString(),
    ...selectedAttributes.reduce((acc, attr) => ({
      ...acc,
      [attr]: point[attr],
    }), {}),
  })) || [];

  const tables: TableType[] = [
    'raw_env_core_observations',
    'raw_env_wind_observations',
    'raw_env_snowpack_temperature_profile',
    'raw_env_precipitation_observations'
  ];

  return (
    <div className="space-y-6">
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
                  {databases?.map((db) => (
                    <SelectItem key={db.id} value={db.id}>
                      {DATABASE_LABELS[db.id]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Comparison Mode - Select Multiple Databases */}
          {comparisonMode && (
            <div className="space-y-2">
              <Label>Select Databases to Compare</Label>
              <div className="grid grid-cols-2 gap-3">
                {databases?.map((db) => (
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
                      {DATABASE_LABELS[db.id]}
                    </label>
                  </div>
                ))}
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
          {selectedAttributes.map((attribute) => (
            <Card key={attribute}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 capitalize">
                  <TrendingUp className="h-5 w-5" />
                  {attribute.replace(/_/g, ' ')}
                </CardTitle>
                <CardDescription>
                  Time series data for {selectedLocation} - {DATABASE_LABELS[selectedDatabase!]}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey={attribute}
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          ))}
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
