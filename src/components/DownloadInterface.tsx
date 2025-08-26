import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, Database, Filter, Clock, FileType, MapPin, Settings, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useLocalLocations, useLocalTableMetadata, useLocalHealthCheck } from '@/hooks/useLocalDatabase';
import { LocalDatabaseService } from '@/services/localDatabaseService';

const DownloadInterface = () => {
  const { toast } = useToast();
  
  // Hooks
  const { data: locations, isLoading: locationsLoading } = useLocalLocations();
  const { data: isHealthy } = useLocalHealthCheck();
  
  // Filter states
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [timePreset, setTimePreset] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Get table metadata when table is selected
  const { data: tableMetadata } = useLocalTableMetadata(selectedTable);

  // Available tables from your database
  const availableTables = [
    { 
      id: 'table1', 
      name: 'Primary Environmental Data', 
      description: 'Air temperature, humidity, soil conditions, radiation, snow measurements',
      recordCount: 'Variable',
      lastUpdated: 'Real-time'
    },
    { 
      id: 'Wind', 
      name: 'Wind Data', 
      description: 'Wind speed, direction, gusts, and meteorological data',
      recordCount: 'Variable',
      lastUpdated: 'Real-time'
    },
    { 
      id: 'Precipitation', 
      name: 'Precipitation Data', 
      description: 'Rainfall intensity, accumulation, and precipitation measurements',
      recordCount: 'Variable',
      lastUpdated: 'Real-time'
    },
    { 
      id: 'SnowpkTempProfile', 
      name: 'Snow Pack Temperature Profile', 
      description: 'Snow temperature profiles at various depths (0-290cm)',
      recordCount: 'Variable',
      lastUpdated: 'Real-time'
    }
  ];

  // Time presets
  const timePresets = [
    { value: 'last_24h', label: 'Last 24 Hours' },
    { value: 'last_week', label: 'Last Week' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'last_3months', label: 'Last 3 Months' },
    { value: 'last_year', label: 'Last Year' },
    { value: 'current_year', label: 'Current Year (2024)' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const handleLocationToggle = (locationName: string) => {
    setSelectedLocations(prev => 
      prev.includes(locationName) 
        ? prev.filter(name => name !== locationName)
        : [...prev, locationName]
    );
  };

  const handleAttributeToggle = (attribute: string) => {
    setSelectedAttributes(prev => 
      prev.includes(attribute) 
        ? prev.filter(attr => attr !== attribute)
        : [...prev, attribute]
    );
  };

  const handleSelectAllLocations = () => {
    if (!locations) return;
    if (selectedLocations.length === locations.length) {
      setSelectedLocations([]);
    } else {
      setSelectedLocations(locations.map(loc => loc.name));
    }
  };

  const handleSelectAllAttributes = () => {
    if (!tableMetadata?.columns) return;
    
    const availableAttributes = tableMetadata.columns.map(col => col.name);
    if (selectedAttributes.length === availableAttributes.length) {
      setSelectedAttributes([]);
    } else {
      setSelectedAttributes(availableAttributes);
    }
  };

  const handleTimePresetChange = (preset: string) => {
    setTimePreset(preset);
    const now = new Date();
    
    switch (preset) {
      case 'last_24h':
        setStartDate(new Date(now.getTime() - 24 * 60 * 60 * 1000));
        setEndDate(now);
        break;
      case 'last_week':
        setStartDate(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
        setEndDate(now);
        break;
      case 'last_month':
        setStartDate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000));
        setEndDate(now);
        break;
      case 'last_3months':
        setStartDate(new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000));
        setEndDate(now);
        break;
      case 'last_year':
        setStartDate(new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000));
        setEndDate(now);
        break;
      case 'current_year':
        setStartDate(new Date(2024, 0, 1));
        setEndDate(now);
        break;
      case 'custom':
        // Allow manual date selection
        break;
    }
  };

  const handleTableChange = (tableId: string) => {
    setSelectedTable(tableId);
    setSelectedAttributes(['TIMESTAMP']); // Always include timestamp by default
  };

  const handleDownload = async () => {
    if (!selectedTable || selectedLocations.length === 0) {
      toast({
        title: "Selection Required",
        description: "Please select a table and at least one location before downloading.",
        variant: "destructive"
      });
      return;
    }

    if (startDate && endDate && startDate > endDate) {
      toast({
        title: "Invalid Date Range",
        description: "Start date must be before end date.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Use the first selected location for now (could be enhanced to handle multiple)
      const location = selectedLocations[0];
      const startDateStr = startDate?.toISOString();
      const endDateStr = endDate?.toISOString();
      const columns = selectedAttributes.length > 0 ? selectedAttributes : undefined;

      await LocalDatabaseService.downloadTableData(
        selectedTable,
        location,
        startDateStr,
        endDateStr,
        columns
      );

      toast({
        title: "Download Complete",
        description: `Successfully downloaded ${selectedTable} data for ${selectedLocations.length} location(s) from ${startDate ? format(startDate, 'MMM dd, yyyy') : 'beginning'} to ${endDate ? format(endDate, 'MMM dd, yyyy') : 'now'}.`
      });

    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "There was an error processing your download request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const estimatedRecords = selectedLocations.length * (startDate && endDate ? 
    Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)) : 0); // Hourly data estimate

  return (
    <div className="space-y-6">
      {/* Header with Database Status */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 border border-primary/20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Download Environmental Data</h2>
            <p className="text-muted-foreground">Select table, locations, and time period to export research data</p>
            <div className="flex items-center gap-2 mt-2">
              <div className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-sm text-muted-foreground">
                Database: {isHealthy ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedTable('');
                setSelectedLocations([]);
                setSelectedAttributes([]);
                setStartDate(undefined);
                setEndDate(undefined);
                setTimePreset('');
              }}
            >
              Clear All
            </Button>
            <Button 
              onClick={handleDownload} 
              disabled={isLoading || !selectedTable || selectedLocations.length === 0 || !startDate || !endDate}
              className="bg-primary hover:bg-primary/90"
              size="lg"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Preparing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Download CSV
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Table Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Select Table
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {availableTables.map((table) => (
                <Card 
                  key={table.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedTable === table.id 
                      ? 'ring-2 ring-primary bg-primary/5' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handleTableChange(table.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-3 h-3 rounded-full ${
                            selectedTable === table.id ? 'bg-primary' : 'bg-muted'
                          }`}></div>
                          <h4 className="font-medium text-sm">{table.name}</h4>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {table.description}
                        </p>
                        <div className="flex gap-4 text-xs">
                          <div>
                            <span className="text-muted-foreground">Records: </span>
                            <span className="font-medium">{table.recordCount}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Updated: </span>
                            <span className="font-medium">{table.lastUpdated}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Location Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Select Locations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Available Locations</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAllLocations}
                disabled={locationsLoading || !locations}
              >
                {selectedLocations.length === locations?.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            
            <div className="max-h-64 overflow-y-auto space-y-2">
              {locationsLoading ? (
                <div className="text-center py-4">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Loading locations...</p>
                </div>
              ) : locations && locations.length > 0 ? (
                locations.map((location) => (
                  <div key={location.id} className="flex items-center space-x-2 p-2 rounded hover:bg-muted/50">
                    <Checkbox
                      id={`location-${location.id}`}
                      checked={selectedLocations.includes(location.name)}
                      onCheckedChange={() => handleLocationToggle(location.name)}
                    />
                    <Label 
                      htmlFor={`location-${location.id}`} 
                      className="flex-1 text-sm cursor-pointer"
                    >
                      <div>
                        <div className="font-medium">{location.name}</div>
                        {location.elevation && (
                          <div className="text-xs text-muted-foreground">
                            Elevation: {location.elevation}m
                          </div>
                        )}
                      </div>
                    </Label>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <AlertCircle className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No locations available</p>
                </div>
              )}
            </div>
            
            {selectedLocations.length > 0 && (
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground">
                  {selectedLocations.length} location(s) selected
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Time Range & Attributes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Time Range & Attributes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Time Range Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Time Range</Label>
              
              <Select value={timePreset} onValueChange={handleTimePresetChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time range..." />
                </SelectTrigger>
                <SelectContent>
                  {timePresets.map((preset) => (
                    <SelectItem key={preset.value} value={preset.value}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {timePreset === 'custom' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left font-normal ${
                            !startDate && "text-muted-foreground"
                          }`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : "Pick start"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div>
                    <Label className="text-xs">End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left font-normal ${
                            !endDate && "text-muted-foreground"
                          }`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP") : "Pick end"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}
            </div>

            {/* Attributes Selection */}
            {selectedTable && tableMetadata && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Select Attributes</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAllAttributes}
                  >
                    {selectedAttributes.length === tableMetadata.columns.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
                
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {tableMetadata.columns.map((column) => (
                    <div key={column.name} className="flex items-center space-x-2 p-2 rounded hover:bg-muted/50">
                      <Checkbox
                        id={`attr-${column.name}`}
                        checked={selectedAttributes.includes(column.name)}
                        onCheckedChange={() => handleAttributeToggle(column.name)}
                      />
                      <Label 
                        htmlFor={`attr-${column.name}`} 
                        className="flex-1 text-sm cursor-pointer"
                      >
                        <div>
                          <div className="font-medium">{column.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {column.type} {!column.nullable && '(required)'}
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
                
                {selectedAttributes.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">
                      {selectedAttributes.length} attribute(s) selected
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      {selectedTable && selectedLocations.length > 0 && startDate && endDate && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Download Summary</h4>
                <p className="text-sm text-muted-foreground">
                  Table: <span className="font-medium">{selectedTable}</span> • 
                  Locations: <span className="font-medium">{selectedLocations.length}</span> • 
                  Attributes: <span className="font-medium">{selectedAttributes.length}</span> • 
                  Period: <span className="font-medium">{format(startDate, "MMM d")} - {format(endDate, "MMM d, yyyy")}</span>
                </p>
              </div>
              <Badge variant="outline">
                Est. {estimatedRecords.toLocaleString()} records
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DownloadInterface;