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
const mockDatabases = [
  { id: 'clean_data', name: 'Clean Data', description: 'Processed and validated environmental data' },
  { id: 'final_clean_data', name: 'Final Clean Data', description: 'Quality-controlled final dataset' }
];

const mockTables = [
  { 
    id: 'table1', 
    name: 'Table 1', 
    description: 'Primary environmental measurements',
    recordCount: '2.1M',
    lastUpdated: '2024-01-15'
  },
  { 
    id: 'wind', 
    name: 'Wind Data', 
    description: 'Wind speed, direction, and meteorological data',
    recordCount: '890K',
    lastUpdated: '2024-01-15'
  },
  { 
    id: 'precipitation', 
    name: 'Precipitation Data', 
    description: 'Rainfall, snow, and precipitation measurements',
    recordCount: '1.5M',
    lastUpdated: '2024-01-15'
  },
  { 
    id: 'snowpktempprofile', 
    name: 'Snow Pack Temperature Profile', 
    description: 'Snow depth and temperature profile data',
    recordCount: '756K',
    lastUpdated: '2024-01-15'
  }
];

const mockLocations = [
  { id: 'LOC-001', name: 'Mount Mansfield Summit', elevation: 1163, lat: 44.5284, lng: -72.8147 },
  { id: 'LOC-002', name: 'Site Alpha', elevation: 1072, lat: 44.5232, lng: -72.8087 },
  { id: 'LOC-003', name: 'Site Beta', elevation: 911, lat: 44.5178, lng: -72.8104 },
  { id: 'LOC-004', name: 'Site Gamma', elevation: 795, lat: 44.5148, lng: -72.8091 },
  { id: 'LOC-005', name: 'Site Delta', elevation: 680, lat: 44.5120, lng: -72.8065 },
  { id: 'LOC-006', name: 'Site Epsilon', elevation: 590, lat: 44.5090, lng: -72.8040 },
  { id: 'LOC-007', name: 'Site Zeta', elevation: 520, lat: 44.5070, lng: -72.8020 },
  { id: 'LOC-008', name: 'Site Eta', elevation: 450, lat: 44.5050, lng: -72.7950 },
  { id: 'LOC-009', name: 'Site Theta', elevation: 412, lat: 44.5037, lng: -72.7836 },
  { id: 'LOC-010', name: 'Site Iota', elevation: 380, lat: 44.5055, lng: -72.7714 },
  { id: 'LOC-011', name: 'FEMC Station', elevation: 872, lat: 44.5189, lng: -72.7979 },
  { id: 'LOC-012', name: 'Proctor Maple Research', elevation: 422, lat: 44.5285, lng: -72.8667 },
  { id: 'LOC-013', name: 'Jericho Forested', elevation: 196, lat: 44.4478, lng: -73.0027 },
  { id: 'LOC-014', name: 'Jericho Clearing', elevation: 198, lat: 44.4477, lng: -73.0025 },
  { id: 'LOC-015', name: 'Spear Street', elevation: 86, lat: 44.4526, lng: -73.1919 },
  { id: 'LOC-016', name: 'Potash Brook', elevation: 47, lat: 44.4448, lng: -73.2143 },
  { id: 'LOC-017', name: 'Valley Station A', elevation: 320, lat: 44.4520, lng: -72.9200 },
  { id: 'LOC-018', name: 'Valley Station B', elevation: 280, lat: 44.4480, lng: -72.9150 },
  { id: 'LOC-019', name: 'Ridge Station', elevation: 950, lat: 44.5300, lng: -72.8200 },
  { id: 'LOC-020', name: 'Forest Edge', elevation: 650, lat: 44.5100, lng: -72.8300 },
  { id: 'LOC-021', name: 'Lake Monitoring', elevation: 125, lat: 44.4600, lng: -73.0800 },
  { id: 'LOC-022', name: 'Urban Interface', elevation: 90, lat: 44.4700, lng: -73.1500 }
];

const mockAttributes = {
  table1: [
    { name: 'timestamp', type: 'datetime', description: 'Measurement timestamp (UTC)' },
    { name: 'air_temperature', type: 'float', description: 'Air temperature (°C)' },
    { name: 'relative_humidity', type: 'float', description: 'Relative humidity (%)' },
    { name: 'atmospheric_pressure', type: 'float', description: 'Atmospheric pressure (hPa)' },
    { name: 'solar_radiation', type: 'float', description: 'Solar radiation (W/m²)' },
    { name: 'soil_temperature', type: 'float', description: 'Soil temperature (°C)' }
  ],
  wind: [
    { name: 'timestamp', type: 'datetime', description: 'Measurement timestamp (UTC)' },
    { name: 'wind_speed', type: 'float', description: 'Wind speed (m/s)' },
    { name: 'wind_direction', type: 'float', description: 'Wind direction (degrees)' },
    { name: 'wind_gust_speed', type: 'float', description: 'Wind gust speed (m/s)' },
    { name: 'wind_gust_direction', type: 'float', description: 'Wind gust direction (degrees)' },
    { name: 'wind_speed_std_dev', type: 'float', description: 'Wind speed standard deviation (m/s)' }
  ],
  precipitation: [
    { name: 'timestamp', type: 'datetime', description: 'Measurement timestamp (UTC)' },
    { name: 'precipitation_amount', type: 'float', description: 'Precipitation amount (mm)' },
    { name: 'precipitation_intensity', type: 'float', description: 'Precipitation intensity (mm/hr)' },
    { name: 'precipitation_type', type: 'string', description: 'Type of precipitation (rain/snow/mixed)' },
    { name: 'cumulative_precipitation', type: 'float', description: 'Cumulative precipitation (mm)' }
  ],
  snowpktempprofile: [
    { name: 'timestamp', type: 'datetime', description: 'Measurement timestamp (UTC)' },
    { name: 'snow_depth', type: 'float', description: 'Snow depth (cm)' },
    { name: 'snow_temperature_surface', type: 'float', description: 'Surface snow temperature (°C)' },
    { name: 'snow_temperature_10cm', type: 'float', description: 'Snow temperature at 10cm (°C)' },
    { name: 'snow_temperature_20cm', type: 'float', description: 'Snow temperature at 20cm (°C)' },
    { name: 'snow_temperature_50cm', type: 'float', description: 'Snow temperature at 50cm (°C)' },
    { name: 'snow_density', type: 'float', description: 'Snow density (kg/m³)' },
    { name: 'snow_water_equivalent', type: 'float', description: 'Snow water equivalent (mm)' }
  ]
};

const DownloadInterface = () => {
  const { toast } = useToast();
  
  // Filter states
  const [selectedDatabase, setSelectedDatabase] = useState<string>('');
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
    setSelectedAttributes(['timestamp']); // Always include timestamp by default
  };

  const handleDownload = async () => {
    if (!selectedDatabase || !selectedTable || selectedLocations.length === 0 || selectedAttributes.length === 0) {
      toast({
        title: "Selection Required",
        description: "Please select a database, table, locations, and attributes before downloading.",
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
      {/* Header with Quick Actions */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 border border-primary/20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Download Environmental Data</h2>
            <p className="text-muted-foreground">Select database, locations, and time period to export research data</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedDatabase('');
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
              disabled={isLoading || !selectedDatabase || !selectedTable || selectedLocations.length === 0 || selectedAttributes.length === 0 || !startDate || !endDate}
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
                  Download ({estimatedRecords.toLocaleString()} records)
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Database & Table Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Database & Table
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Database Selection */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Select Database</Label>
              <Select value={selectedDatabase} onValueChange={setSelectedDatabase}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose database..." />
                </SelectTrigger>
                <SelectContent>
                  {mockDatabases.map((db) => (
                    <SelectItem key={db.id} value={db.id}>
                      <div>
                        <div className="font-medium">{db.name}</div>
                        <div className="text-xs text-muted-foreground">{db.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Table Selection */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Select Table</Label>
              <div className="space-y-2">
                {mockTables.map((table) => (
                  <Card 
                    key={table.id}
                    className={`cursor-pointer transition-all p-3 ${
                      selectedTable === table.id
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleTableChange(table.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-3 h-3 rounded-full mt-1 ${
                        selectedTable === table.id ? 'bg-primary' : 'bg-muted'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">{table.name}</h4>
                        <p className="text-xs text-muted-foreground">{table.description}</p>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>{table.recordCount} records</span>
                          <span>Updated {table.lastUpdated}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location & Attributes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Locations & Variables
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Location Selection */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label className="text-sm font-medium">Monitoring Locations ({selectedLocations.length}/22)</Label>
                <Button variant="ghost" size="sm" onClick={handleSelectAllLocations}>
                  {selectedLocations.length === mockLocations.length ? 'Clear' : 'All'}
                </Button>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1 border rounded p-2">
                {mockLocations.map((location) => (
                  <div 
                    key={location.id}
                    className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded cursor-pointer"
                    onClick={() => handleLocationToggle(location.id)}
                  >
                    <Checkbox 
                      checked={selectedLocations.includes(location.id)}
                      onChange={() => {}}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{location.name}</p>
                      <p className="text-xs text-muted-foreground">{location.id} • {location.elevation}m</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Attributes Selection */}
            {selectedTable && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-sm font-medium">
                    Variables ({selectedAttributes.length}/{mockAttributes[selectedTable as keyof typeof mockAttributes]?.length || 0})
                  </Label>
                  <Button variant="ghost" size="sm" onClick={handleSelectAllAttributes}>
                    {selectedAttributes.length === (mockAttributes[selectedTable as keyof typeof mockAttributes]?.length || 0) ? 'Clear' : 'All'}
                  </Button>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1 border rounded p-2">
                  {(mockAttributes[selectedTable as keyof typeof mockAttributes] || []).map((attribute) => (
                    <div 
                      key={attribute.name}
                      className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded cursor-pointer"
                      onClick={() => handleAttributeToggle(attribute.name)}
                    >
                      <Checkbox 
                        checked={selectedAttributes.includes(attribute.name)}
                        onChange={() => {}}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-medium">{attribute.name}</p>
                          <Badge variant="secondary" className="text-xs h-4">{attribute.type}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{attribute.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Time Period & Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Time Period & Export
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Time Presets */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Quick Time Periods</Label>
              <div className="grid grid-cols-2 gap-2">
                {timePresets.filter(p => p.value !== 'custom').map((preset) => (
                  <Button
                    key={preset.value}
                    variant={timePreset === preset.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTimePresetChange(preset.value)}
                    className="text-xs h-8"
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Date Range */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Custom Date Range</Label>
              <div className="space-y-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal text-xs h-9">
                      <CalendarIcon className="mr-2 h-3 w-3" />
                      {startDate ? format(startDate, "MMM dd, yyyy") : "Start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal text-xs h-9">
                      <CalendarIcon className="mr-2 h-3 w-3" />
                      {endDate ? format(endDate, "MMM dd, yyyy") : "End date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Export Format */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Export Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {exportFormats.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      <div>
                        <div className="font-medium">{format.label}</div>
                        <div className="text-xs text-muted-foreground">{format.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Summary */}
            {selectedDatabase && selectedTable && selectedLocations.length > 0 && selectedAttributes.length > 0 && startDate && endDate && (
              <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
                <h4 className="text-sm font-medium mb-2">Export Summary</h4>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p><strong>Database:</strong> {mockDatabases.find(db => db.id === selectedDatabase)?.name}</p>
                  <p><strong>Table:</strong> {mockTables.find(t => t.id === selectedTable)?.name}</p>
                  <p><strong>Locations:</strong> {selectedLocations.length} stations</p>
                  <p><strong>Variables:</strong> {selectedAttributes.length} attributes</p>
                  <p><strong>Period:</strong> {format(startDate, 'MMM dd')} - {format(endDate, 'MMM dd, yyyy')}</p>
                  <p><strong>Estimated:</strong> ~{estimatedRecords.toLocaleString()} records</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DownloadInterface;