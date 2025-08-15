import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, Database, Filter, Clock, FileType, MapPin, Settings, AlertCircle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

// Mock data for demonstration - replace with your local database queries
const mockLocations = [
  { id: 'RB-13', name: 'Mount Mansfield Summit', type: 'ranch_brook', elevation: 1163, lat: 44.5284, lng: -72.8147 },
  { id: 'RB-01', name: 'Site #1', type: 'ranch_brook', elevation: 1072, lat: 44.5232, lng: -72.8087 },
  { id: 'RB-02', name: 'Site #2', type: 'ranch_brook', elevation: 911, lat: 44.5178, lng: -72.8104 },
  { id: 'RB-03', name: 'Site #3', type: 'ranch_brook', elevation: 795, lat: 44.5148, lng: -72.8091 },
  { id: 'RB-06', name: 'Site #6', type: 'ranch_brook', elevation: 412, lat: 44.5037, lng: -72.7836 },
  { id: 'RB-11', name: 'Site #11', type: 'ranch_brook', elevation: 380, lat: 44.5055, lng: -72.7714 },
  { id: 'FEMC', name: 'FEMC', type: 'distributed', elevation: 872, lat: 44.5189, lng: -72.7979 },
  { id: 'PROC', name: 'Proctor Maple', type: 'distributed', elevation: 422, lat: 44.5285, lng: -72.8667 },
  { id: 'JER-F', name: 'Jericho (Forested)', type: 'distributed', elevation: 196, lat: 44.4478, lng: -73.0027 },
  { id: 'JER-C', name: 'Jericho (Clearing)', type: 'distributed', elevation: 198, lat: 44.4477, lng: -73.0025 },
  { id: 'SPEAR', name: 'Spear St', type: 'distributed', elevation: 86, lat: 44.4526, lng: -73.1919 },
  { id: 'POTASH', name: 'Potash Brook', type: 'distributed', elevation: 47, lat: 44.4448, lng: -73.2143 },
];

const mockTables = [
  { 
    id: 'weather_data', 
    name: 'Weather Data', 
    description: 'Temperature, humidity, precipitation measurements',
    recordCount: '2.1M',
    lastUpdated: '2024-01-15'
  },
  { 
    id: 'snow_data', 
    name: 'Snow Data', 
    description: 'Snow depth, SWE, temperature profiles',
    recordCount: '890K',
    lastUpdated: '2024-01-15'
  },
  { 
    id: 'soil_data', 
    name: 'Soil Data', 
    description: 'Soil temperature and moisture at multiple depths',
    recordCount: '1.5M',
    lastUpdated: '2024-01-15'
  },
  { 
    id: 'radiation_data', 
    name: 'Radiation Data', 
    description: 'Solar radiation, albedo measurements',
    recordCount: '756K',
    lastUpdated: '2024-01-15'
  },
  { 
    id: 'wind_data', 
    name: 'Wind Data', 
    description: 'Wind speed, direction, and gusts',
    recordCount: '1.8M',
    lastUpdated: '2024-01-15'
  },
];

const mockAttributes = {
  weather_data: [
    { name: 'timestamp', type: 'datetime', description: 'Measurement timestamp (UTC)' },
    { name: 'air_temperature', type: 'float', description: 'Air temperature (°C)' },
    { name: 'relative_humidity', type: 'float', description: 'Relative humidity (%)' },
    { name: 'precipitation', type: 'float', description: 'Precipitation amount (mm)' },
    { name: 'atmospheric_pressure', type: 'float', description: 'Atmospheric pressure (hPa)' },
    { name: 'dew_point', type: 'float', description: 'Dew point temperature (°C)' },
    { name: 'vapor_pressure', type: 'float', description: 'Vapor pressure (kPa)' }
  ],
  snow_data: [
    { name: 'timestamp', type: 'datetime', description: 'Measurement timestamp (UTC)' },
    { name: 'snow_depth', type: 'float', description: 'Snow depth (cm)' },
    { name: 'snow_water_equivalent', type: 'float', description: 'Snow water equivalent (mm)' },
    { name: 'snow_temperature_surface', type: 'float', description: 'Surface snow temperature (°C)' },
    { name: 'snow_temperature_10cm', type: 'float', description: 'Snow temperature at 10cm (°C)' },
    { name: 'snow_temperature_20cm', type: 'float', description: 'Snow temperature at 20cm (°C)' },
    { name: 'snow_density', type: 'float', description: 'Snow density (kg/m³)' }
  ],
  soil_data: [
    { name: 'timestamp', type: 'datetime', description: 'Measurement timestamp (UTC)' },
    { name: 'soil_temp_5cm', type: 'float', description: 'Soil temperature at 5cm depth (°C)' },
    { name: 'soil_temp_10cm', type: 'float', description: 'Soil temperature at 10cm depth (°C)' },
    { name: 'soil_temp_20cm', type: 'float', description: 'Soil temperature at 20cm depth (°C)' },
    { name: 'soil_moisture_5cm', type: 'float', description: 'Soil moisture at 5cm depth (%)' },
    { name: 'soil_moisture_10cm', type: 'float', description: 'Soil moisture at 10cm depth (%)' },
    { name: 'soil_moisture_20cm', type: 'float', description: 'Soil moisture at 20cm depth (%)' }
  ],
  radiation_data: [
    { name: 'timestamp', type: 'datetime', description: 'Measurement timestamp (UTC)' },
    { name: 'solar_radiation_incoming', type: 'float', description: 'Incoming solar radiation (W/m²)' },
    { name: 'solar_radiation_outgoing', type: 'float', description: 'Outgoing solar radiation (W/m²)' },
    { name: 'albedo', type: 'float', description: 'Surface albedo (dimensionless)' },
    { name: 'net_radiation', type: 'float', description: 'Net radiation (W/m²)' },
    { name: 'longwave_radiation', type: 'float', description: 'Longwave radiation (W/m²)' }
  ],
  wind_data: [
    { name: 'timestamp', type: 'datetime', description: 'Measurement timestamp (UTC)' },
    { name: 'wind_speed', type: 'float', description: 'Wind speed (m/s)' },
    { name: 'wind_direction', type: 'float', description: 'Wind direction (degrees)' },
    { name: 'wind_gust_speed', type: 'float', description: 'Wind gust speed (m/s)' },
    { name: 'wind_gust_direction', type: 'float', description: 'Wind gust direction (degrees)' },
    { name: 'wind_speed_std_dev', type: 'float', description: 'Wind speed standard deviation (m/s)' }
  ]
};

const DownloadInterface = () => {
  const { toast } = useToast();
  
  // Filter states
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [timePreset, setTimePreset] = useState<string>('');
  const [exportFormat, setExportFormat] = useState<string>('csv');
  const [isLoading, setIsLoading] = useState(false);

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

  const exportFormats = [
    { value: 'csv', label: 'CSV (Comma Separated)', description: 'Compatible with Excel, R, Python' },
    { value: 'xlsx', label: 'Excel (XLSX)', description: 'Microsoft Excel format' },
    { value: 'json', label: 'JSON', description: 'JavaScript Object Notation' },
    { value: 'netcdf', label: 'NetCDF', description: 'Scientific data format' }
  ];

  const handleLocationToggle = (locationId: string) => {
    setSelectedLocations(prev => 
      prev.includes(locationId) 
        ? prev.filter(id => id !== locationId)
        : [...prev, locationId]
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
    if (selectedLocations.length === mockLocations.length) {
      setSelectedLocations([]);
    } else {
      setSelectedLocations(mockLocations.map(loc => loc.id));
    }
  };

  const handleSelectAllAttributes = () => {
    if (!selectedTable) return;
    
    const availableAttributes = mockAttributes[selectedTable as keyof typeof mockAttributes] || [];
    if (selectedAttributes.length === availableAttributes.length) {
      setSelectedAttributes([]);
    } else {
      setSelectedAttributes(availableAttributes.map(attr => attr.name));
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
    setSelectedAttributes([]); // Reset attributes when table changes
  };

  const handleDownload = async () => {
    if (!selectedTable || selectedLocations.length === 0 || selectedAttributes.length === 0) {
      toast({
        title: "Selection Required",
        description: "Please select a data table, locations, and attributes before downloading.",
        variant: "destructive"
      });
      return;
    }

    if (!startDate || !endDate) {
      toast({
        title: "Date Range Required",
        description: "Please select a valid date range for your data export.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Replace with actual API call to your local database
      // Example API call structure:
      /*
      const response = await fetch('/api/download-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: selectedTable,
          locations: selectedLocations,
          attributes: selectedAttributes,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          format: exportFormat
        })
      });
      
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `s2s_data_${selectedTable}_${format(new Date(), 'yyyy-MM-dd')}.${exportFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      */

      // Mock download simulation
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Create mock data for demonstration
      const selectedTable_info = mockTables.find(t => t.id === selectedTable);
      const headers = ['timestamp', 'location_id', 'location_name', ...selectedAttributes.filter(attr => attr !== 'timestamp')];
      
      let fileContent = '';
      let fileName = '';
      
      if (exportFormat === 'csv') {
        fileContent = [
          headers.join(','),
          // Sample data rows
          ...selectedLocations.slice(0, 3).map(locId => {
            const location = mockLocations.find(l => l.id === locId);
            return `2024-01-15T12:00:00Z,${locId},"${location?.name}",${selectedAttributes.filter(attr => attr !== 'timestamp').map(() => (Math.random() * 100).toFixed(2)).join(',')}`;
          })
        ].join('\n');
        fileName = `s2s_${selectedTable}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      } else if (exportFormat === 'json') {
        const jsonData = selectedLocations.slice(0, 3).map(locId => {
          const location = mockLocations.find(l => l.id === locId);
          const record: any = {
            timestamp: '2024-01-15T12:00:00Z',
            location_id: locId,
            location_name: location?.name
          };
          selectedAttributes.filter(attr => attr !== 'timestamp').forEach(attr => {
            record[attr] = parseFloat((Math.random() * 100).toFixed(2));
          });
          return record;
        });
        fileContent = JSON.stringify(jsonData, null, 2);
        fileName = `s2s_${selectedTable}_${format(new Date(), 'yyyy-MM-dd')}.json`;
      }

      // Create and download file
      const blob = new Blob([fileContent], { 
        type: exportFormat === 'csv' ? 'text/csv' : 
             exportFormat === 'json' ? 'application/json' : 
             'application/vnd.ms-excel' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Download Complete",
        description: `Successfully exported ${selectedLocations.length} locations with ${selectedAttributes.length} attributes from ${selectedTable_info?.name}.`
      });

    } catch (error) {
      toast({
        title: "Download Failed",
        description: "There was an error processing your download request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const estimatedRecords = selectedLocations.length * (startDate && endDate ? 
    Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)) : 0); // Hourly data

  return (
    <div className="space-y-6">
      {/* Download Configuration Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Export Configuration</h3>
              <div className="flex flex-wrap gap-3">
                <Badge variant="outline" className="text-blue-700 border-blue-300">
                  {selectedLocations.length} Locations
                </Badge>
                <Badge variant="outline" className="text-green-700 border-green-300">
                  {selectedTable ? mockTables.find(t => t.id === selectedTable)?.name : 'No Table'} Selected
                </Badge>
                <Badge variant="outline" className="text-purple-700 border-purple-300">
                  {selectedAttributes.length} Attributes
                </Badge>
                {startDate && endDate && (
                  <Badge variant="outline" className="text-orange-700 border-orange-300">
                    {format(startDate, 'MMM dd')} - {format(endDate, 'MMM dd, yyyy')}
                  </Badge>
                )}
                {estimatedRecords > 0 && (
                  <Badge variant="outline" className="text-gray-700 border-gray-300">
                    ~{estimatedRecords.toLocaleString()} records
                  </Badge>
                )}
              </div>
            </div>
            <Button 
              onClick={handleDownload} 
              disabled={isLoading || !selectedTable || selectedLocations.length === 0 || selectedAttributes.length === 0}
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
                  Download Data
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Location Selection */}
        <Card className="data-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Monitoring Locations
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Select stations for data export
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium">Available Stations ({mockLocations.length})</Label>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSelectAllLocations}
                className="text-xs"
              >
                {selectedLocations.length === mockLocations.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            
            <div className="max-h-80 overflow-y-auto space-y-2">
              {mockLocations.map((location) => (
                <div 
                  key={location.id} 
                  className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleLocationToggle(location.id)}
                >
                  <Checkbox
                    id={location.id}
                    checked={selectedLocations.includes(location.id)}
                    onCheckedChange={() => handleLocationToggle(location.id)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={location.id} className="font-medium text-sm cursor-pointer">
                        {location.id === 'RB-13' ? '⭐ SUMMIT' : location.id}
                      </Label>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          location.type === 'ranch_brook' 
                            ? 'text-red-700 border-red-300 bg-red-50' 
                            : 'text-blue-700 border-blue-300 bg-blue-50'
                        }`}
                      >
                        {location.type === 'ranch_brook' ? 'RB' : 'DIST'}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500">{location.name}</div>
                    <div className="text-xs text-gray-400">{location.elevation}m • {location.lat.toFixed(3)}°N, {location.lng.toFixed(3)}°W</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Data Table Selection */}
        <Card className="data-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Data Tables
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Choose data type to export
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Available Tables</Label>
              <Select value={selectedTable} onValueChange={handleTableChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a data table" />
                </SelectTrigger>
                <SelectContent>
                  {mockTables.map((table) => (
                    <SelectItem key={table.id} value={table.id}>
                      <div className="flex flex-col">
                        <div className="font-medium">{table.name}</div>
                        <div className="text-xs text-gray-500">{table.description}</div>
                        <div className="text-xs text-blue-600">{table.recordCount} records • Updated {table.lastUpdated}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTable && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Table Information</h4>
                <div className="text-xs text-blue-700 space-y-1">
                  {(() => {
                    const table = mockTables.find(t => t.id === selectedTable);
                    const attributes = mockAttributes[selectedTable as keyof typeof mockAttributes] || [];
                    return (
                      <>
                        <div>• {table?.recordCount} total records</div>
                        <div>• {attributes.length} available attributes</div>
                        <div>• Last updated: {table?.lastUpdated}</div>
                        <div>• Data frequency: Hourly measurements</div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attribute Selection */}
        <Card className="data-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              Data Attributes
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Select specific measurements
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedTable ? (
              <div className="flex items-center justify-center h-32 text-center">
                <div className="text-sm text-gray-500">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  Select a data table first to view available attributes
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium">
                    Attributes ({selectedAttributes.length}/{(mockAttributes[selectedTable as keyof typeof mockAttributes] || []).length})
                  </Label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSelectAllAttributes}
                    className="text-xs"
                  >
                    {selectedAttributes.length === (mockAttributes[selectedTable as keyof typeof mockAttributes] || []).length ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
                
                <div className="max-h-80 overflow-y-auto space-y-2">
                  {(mockAttributes[selectedTable as keyof typeof mockAttributes] || []).map((attribute) => (
                    <div 
                      key={attribute.name} 
                      className="flex items-start space-x-2 p-2 rounded border hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleAttributeToggle(attribute.name)}
                    >
                      <Checkbox
                        id={attribute.name}
                        checked={selectedAttributes.includes(attribute.name)}
                        onCheckedChange={() => handleAttributeToggle(attribute.name)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label htmlFor={attribute.name} className="text-sm font-medium cursor-pointer">
                          {attribute.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Label>
                        <div className="text-xs text-gray-500">{attribute.description}</div>
                        <Badge variant="outline" className="text-xs mt-1">
                          {attribute.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Time Period & Export Settings */}
        <Card className="data-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Time Period & Export
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Configure time range and format
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Time Presets */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Time Period</Label>
              <Select value={timePreset} onValueChange={handleTimePresetChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time period" />
                </SelectTrigger>
                <SelectContent>
                  {timePresets.map((preset) => (
                    <SelectItem key={preset.value} value={preset.value}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Date Range */}
            {(timePreset === 'custom' || timePreset === '') && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm">Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, 'MMM dd, yyyy') : 'Select start date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm">End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, 'MMM dd, yyyy') : 'Select end date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
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
              </div>
            )}

            {/* Export Format */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Export Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {exportFormats.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <FileType className="h-4 w-4" />
                          {format.label}
                        </div>
                        <div className="text-xs text-gray-500">{format.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Export Preview */}
            {selectedTable && selectedLocations.length > 0 && selectedAttributes.length > 0 && startDate && endDate && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <h4 className="text-sm font-medium text-green-900 mb-2 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  Ready to Export
                </h4>
                <div className="text-xs text-green-700 space-y-1">
                  <div>• {selectedLocations.length} location(s)</div>
                  <div>• {selectedAttributes.length} attribute(s)</div>
                  <div>• {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} day(s) of data</div>
                  <div>• Format: {exportFormat.toUpperCase()}</div>
                  <div>• Estimated: ~{estimatedRecords.toLocaleString()} records</div>
                  <div>• File size: ~{Math.ceil(estimatedRecords * selectedAttributes.length / 1000)}KB</div>
                </div>
              </div>
            )}

            {/* Quick Download Options */}
            <div className="pt-4 border-t">
              <Label className="text-sm font-medium mb-2 block">Quick Downloads</Label>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  <Download className="h-3 w-3 mr-2" />
                  Last 24 Hours - All Sites
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  <Download className="h-3 w-3 mr-2" />
                  Weekly Summary Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Guidelines */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-medium mb-2 text-sm flex items-center text-blue-800">
            <CheckCircle2 className="h-4 w-4 mr-2 text-blue-600" />
            Data Usage Guidelines
          </h4>
          <div className="grid md:grid-cols-3 gap-4 text-xs text-blue-700">
            <div>
              <div className="font-semibold mb-1">Attribution</div>
              <ul className="space-y-1">
                <li>• Cite "University of Vermont Summit 2 Shore Observatory"</li>
                <li>• Include data access date in publications</li>
                <li>• Reference DOI when available</li>
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-1">Data Quality</div>
              <ul className="space-y-1">
                <li>• Check QC flags in downloaded data</li>
                <li>• Review metadata for sensor specifications</li>
                <li>• Contact PI for large-scale research use</li>
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-1">Technical Support</div>
              <ul className="space-y-1">
                <li>• API documentation available for developers</li>
                <li>• Bulk downloads &gt;1M records: contact team</li>
                <li>• Real-time data feeds available via API</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DownloadInterface;