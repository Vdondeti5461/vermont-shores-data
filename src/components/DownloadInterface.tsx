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
  
  // Wizard step state
  const [currentStep, setCurrentStep] = useState(1);
  
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

  const steps = [
    { id: 1, title: 'Choose Data Type', description: 'Select what kind of data you want', completed: !!selectedTable },
    { id: 2, title: 'Pick Locations', description: 'Choose monitoring stations', completed: selectedLocations.length > 0 },
    { id: 3, title: 'Select Variables', description: 'Pick specific measurements', completed: selectedAttributes.length > 0 },
    { id: 4, title: 'Set Time Period', description: 'Choose date range', completed: !!(startDate && endDate) },
    { id: 5, title: 'Download Format', description: 'Choose file format', completed: !!exportFormat }
  ];

  const canProceedToStep = (stepId: number) => {
    switch (stepId) {
      case 1: return true;
      case 2: return !!selectedTable;
      case 3: return selectedLocations.length > 0;
      case 4: return selectedAttributes.length > 0;
      case 5: return !!(startDate && endDate);
      default: return false;
    }
  };

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="space-y-6">
      {/* Step Progress Indicator */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Download Research Data</h2>
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step.completed 
                    ? 'bg-primary border-primary text-primary-foreground' 
                    : step.id === currentStep 
                      ? 'border-primary bg-primary/10 text-primary' 
                      : 'border-muted bg-muted text-muted-foreground'
                }`}>
                  {step.completed ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step.completed ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground">{steps[currentStep - 1].title}</h3>
            <p className="text-muted-foreground">{steps[currentStep - 1].description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <div className="min-h-[500px]">
        {/* Step 1: Data Type Selection */}
        {currentStep === 1 && (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-6 w-6 text-primary" />
                What type of data do you need?
              </CardTitle>
              <p className="text-muted-foreground">Choose from our available environmental datasets</p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {mockTables.map((table) => (
                  <Card 
                    key={table.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedTable === table.id 
                        ? 'border-primary bg-primary/5 shadow-lg' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => {
                      handleTableChange(table.id);
                      if (table.id && canProceedToStep(2)) {
                        setTimeout(() => nextStep(), 500);
                      }
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <div className={`w-3 h-3 rounded-full mt-2 ${
                          selectedTable === table.id ? 'bg-primary' : 'bg-muted'
                        }`} />
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{table.name}</h3>
                          <p className="text-muted-foreground mb-3">{table.description}</p>
                          <div className="flex justify-between text-sm">
                            <span className="text-primary font-medium">{table.recordCount} records</span>
                            <span className="text-muted-foreground">Updated {table.lastUpdated}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Location Selection */}
        {currentStep === 2 && (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-6 w-6 text-primary" />
                Which monitoring stations?
              </CardTitle>
              <p className="text-muted-foreground">Select the locations you want data from</p>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {selectedLocations.length} of {mockLocations.length} stations selected
                </span>
                <Button variant="outline" size="sm" onClick={handleSelectAllLocations}>
                  {selectedLocations.length === mockLocations.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {mockLocations.map((location) => (
                  <Card 
                    key={location.id}
                    className={`cursor-pointer transition-all ${
                      selectedLocations.includes(location.id)
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleLocationToggle(location.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox 
                          checked={selectedLocations.includes(location.id)}
                          onChange={() => {}}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{location.name}</h4>
                          <p className="text-xs text-muted-foreground">{location.id}</p>
                          <p className="text-xs text-muted-foreground">{location.elevation}m elevation</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Attribute Selection */}
        {currentStep === 3 && selectedTable && (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-6 w-6 text-primary" />
                Which measurements?
              </CardTitle>
              <p className="text-muted-foreground">
                Choose specific variables from {mockTables.find(t => t.id === selectedTable)?.name}
              </p>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {selectedAttributes.length} of {mockAttributes[selectedTable as keyof typeof mockAttributes]?.length || 0} variables selected
                </span>
                <Button variant="outline" size="sm" onClick={handleSelectAllAttributes}>
                  {selectedAttributes.length === (mockAttributes[selectedTable as keyof typeof mockAttributes]?.length || 0) ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {(mockAttributes[selectedTable as keyof typeof mockAttributes] || []).map((attribute) => (
                  <Card 
                    key={attribute.name}
                    className={`cursor-pointer transition-all ${
                      selectedAttributes.includes(attribute.name)
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleAttributeToggle(attribute.name)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox 
                          checked={selectedAttributes.includes(attribute.name)}
                          onChange={() => {}}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{attribute.name}</h4>
                            <Badge variant="secondary" className="text-xs">{attribute.type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{attribute.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Time Period Selection */}
        {currentStep === 4 && (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-6 w-6 text-primary" />
                What time period?
              </CardTitle>
              <p className="text-muted-foreground">Choose the date range for your data</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-medium mb-3 block">Quick Presets</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {timePresets.filter(p => p.value !== 'custom').map((preset) => (
                    <Button
                      key={preset.value}
                      variant={timePreset === preset.value ? "default" : "outline"}
                      onClick={() => handleTimePresetChange(preset.value)}
                      className="justify-start h-auto p-3"
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-base font-medium mb-3 block">Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Pick start date"}
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
                </div>

                <div>
                  <Label className="text-base font-medium mb-3 block">End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "Pick end date"}
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

              {startDate && endDate && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    <strong>Selected period:</strong> {format(startDate, "PPP")} to {format(endDate, "PPP")}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    <strong>Estimated records:</strong> ~{estimatedRecords.toLocaleString()} data points
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 5: Export Format */}
        {currentStep === 5 && (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileType className="h-6 w-6 text-primary" />
                Choose download format
              </CardTitle>
              <p className="text-muted-foreground">Select the file format that works best for you</p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {exportFormats.map((format) => (
                  <Card 
                    key={format.value}
                    className={`cursor-pointer transition-all ${
                      exportFormat === format.value
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setExportFormat(format.value)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <div className={`w-3 h-3 rounded-full mt-2 ${
                          exportFormat === format.value ? 'bg-primary' : 'bg-muted'
                        }`} />
                        <div>
                          <h3 className="font-semibold text-lg mb-2">{format.label}</h3>
                          <p className="text-muted-foreground">{format.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Download Summary and Action */}
              <div className="mt-8 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-6 border border-primary/20">
                <h3 className="text-lg font-semibold mb-4">Ready to Download</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Data Type</p>
                    <p className="font-medium">{mockTables.find(t => t.id === selectedTable)?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Locations</p>
                    <p className="font-medium">{selectedLocations.length} stations</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Variables</p>
                    <p className="font-medium">{selectedAttributes.length} measurements</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Time Period</p>
                    <p className="font-medium">
                      {startDate && endDate ? `${format(startDate, 'MMM dd')} - ${format(endDate, 'MMM dd, yyyy')}` : 'Not set'}
                    </p>
                  </div>
                </div>
                
                <Button 
                  onClick={handleDownload} 
                  disabled={isLoading || !selectedTable || selectedLocations.length === 0 || selectedAttributes.length === 0 || !startDate || !endDate}
                  className="w-full bg-primary hover:bg-primary/90 text-lg py-6"
                  size="lg"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Preparing your download...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Download className="h-6 w-6" />
                      Download {exportFormat.toUpperCase()} File (~{estimatedRecords.toLocaleString()} records)
                    </div>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center max-w-4xl mx-auto">
        <Button 
          variant="outline" 
          onClick={prevStep}
          disabled={currentStep === 1}
          className="flex items-center gap-2"
        >
          ← Previous Step
        </Button>
        
        <div className="text-sm text-muted-foreground">
          Step {currentStep} of 5
        </div>
        
        <Button 
          onClick={nextStep}
          disabled={currentStep === 5 || !canProceedToStep(currentStep + 1)}
          className="flex items-center gap-2"
        >
          Next Step →
        </Button>
      </div>
    </div>
  );
};

export default DownloadInterface;