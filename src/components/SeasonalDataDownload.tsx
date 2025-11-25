import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, Download, Database, Table, MapPin, Calendar as CalendarIcon, 
  Filter, CheckCircle2, Info, FileText, Layers
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/apiConfig';
import { cn } from '@/lib/utils';

interface SeasonalTable {
  id: string;
  name: string;
  displayName: string;
  rowCount: number;
  description: string;
}

interface Location {
  code: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  elevation: number | null;
}

interface Attribute {
  name: string;
  type: string;
  unit: string;
  description: string;
  category: string;
  measurementType: string;
  isPrimary: boolean;
}

const SeasonalDataDownload = () => {
  const { toast } = useToast();
  
  // State management
  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState<SeasonalTable[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  
  // Selection state
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  
  // Date range state
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  
  // Step tracking
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Load seasonal tables on mount
  useEffect(() => {
    loadSeasonalTables();
  }, []);

  const loadSeasonalTables = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/seasonal/tables`);
      if (!response.ok) throw new Error('Failed to load seasonal tables');
      const data = await response.json();
      setTables(data);
    } catch (error) {
      toast({
        title: "Error Loading Tables",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadLocations = async (tableName: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/seasonal/tables/${tableName}/locations`);
      if (!response.ok) throw new Error('Failed to load locations');
      const data = await response.json();
      setLocations(data);
    } catch (error) {
      toast({
        title: "Error Loading Locations",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAttributes = async (tableName: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/seasonal/tables/${tableName}/attributes`);
      if (!response.ok) throw new Error('Failed to load attributes');
      const data = await response.json();
      setAttributes(data.attributes || []);
      
      // Auto-select primary attributes
      const primaryAttrs = (data.attributes || [])
        .filter((attr: Attribute) => attr.isPrimary)
        .map((attr: Attribute) => attr.name);
      setSelectedAttributes(primaryAttrs);
    } catch (error) {
      toast({
        title: "Error Loading Attributes",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTableSelection = (tableName: string) => {
    setSelectedTable(tableName);
    setLocations([]);
    setAttributes([]);
    setSelectedLocations([]);
    setSelectedAttributes([]);
    setStartDate(undefined);
    setEndDate(undefined);
    
    loadLocations(tableName);
    loadAttributes(tableName);
    setCurrentStep(2);
  };

  const handleDownload = async () => {
    if (!selectedTable) {
      toast({
        title: "Selection Required",
        description: "Please select a seasonal table",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedLocations.length > 0) params.append('locations', selectedLocations.join(','));
      if (startDate) params.append('start_date', format(startDate, 'yyyy-MM-dd HH:mm:ss'));
      if (endDate) params.append('end_date', format(endDate, 'yyyy-MM-dd HH:mm:ss'));
      if (selectedAttributes.length > 0) params.append('attributes', selectedAttributes.join(','));

      const url = `${API_BASE_URL}/api/seasonal/download/${selectedTable}?${params.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `seasonal_qaqc_${selectedTable}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      toast({
        title: "Download Complete",
        description: "Your data has been downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setQuickDateRange = (range: string) => {
    const now = new Date();
    switch (range) {
      case 'last_30':
        setStartDate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000));
        setEndDate(now);
        break;
      case 'last_90':
        setStartDate(new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000));
        setEndDate(now);
        break;
      case 'this_year':
        setStartDate(new Date(now.getFullYear(), 0, 1));
        setEndDate(now);
        break;
      case 'last_year':
        setStartDate(new Date(now.getFullYear() - 1, 0, 1));
        setEndDate(new Date(now.getFullYear() - 1, 11, 31));
        break;
    }
  };

  const selectedTableInfo = tables.find(t => t.name === selectedTable);

  // Group attributes by category
  const groupedAttributes = attributes.reduce((acc, attr) => {
    if (!acc[attr.category]) acc[attr.category] = [];
    acc[attr.category].push(attr);
    return acc;
  }, {} as Record<string, Attribute[]>);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <Badge variant="outline" className="mb-2">
          <Database className="w-4 h-4 mr-2" />
          Seasonal QAQC Data Access
        </Badge>
        <h2 className="text-3xl font-bold tracking-tight">
          Download Environmental Data
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Access quality-controlled seasonal environmental datasets with advanced filtering options
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-4">
        <div className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
          currentStep >= 1 ? "bg-primary text-primary-foreground" : "bg-muted"
        )}>
          <Database className="w-4 h-4" />
          <span className="font-medium">Select Season</span>
        </div>
        <div className="h-0.5 w-12 bg-border" />
        <div className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
          currentStep >= 2 ? "bg-primary text-primary-foreground" : "bg-muted"
        )}>
          <Filter className="w-4 h-4" />
          <span className="font-medium">Configure Filters</span>
        </div>
        <div className="h-0.5 w-12 bg-border" />
        <div className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
          currentStep >= 3 ? "bg-primary text-primary-foreground" : "bg-muted"
        )}>
          <Download className="w-4 h-4" />
          <span className="font-medium">Download</span>
        </div>
      </div>

      {/* Step 1: Table Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Table className="w-5 h-5" />
            Step 1: Select Seasonal Dataset
          </CardTitle>
          <CardDescription>
            Choose the seasonal period for your environmental data download
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && tables.length === 0 ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tables.map((table) => (
                <Card
                  key={table.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-lg hover:border-primary",
                    selectedTable === table.name && "border-primary bg-primary/5"
                  )}
                  onClick={() => handleTableSelection(table.name)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{table.displayName}</CardTitle>
                      {selectedTable === table.name && (
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <CardDescription className="line-clamp-2">
                      {table.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="secondary">
                      {table.rowCount.toLocaleString()} records
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Location & Date Selection */}
      {selectedTable && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Step 2: Select Monitoring Locations
              </CardTitle>
              <CardDescription>
                Choose one or more monitoring stations for your data download
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 mb-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedLocations(locations.map(l => l.code))}
                >
                  Select All
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedLocations([])}
                >
                  Clear All
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {locations.map((location) => (
                  <Card
                    key={location.code}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      selectedLocations.includes(location.code) && "border-primary bg-primary/5"
                    )}
                    onClick={() => {
                      setSelectedLocations(prev =>
                        prev.includes(location.code)
                          ? prev.filter(l => l !== location.code)
                          : [...prev, location.code]
                      );
                    }}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Checkbox 
                              checked={selectedLocations.includes(location.code)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedLocations(prev => [...prev, location.code]);
                                } else {
                                  setSelectedLocations(prev => prev.filter(l => l !== location.code));
                                }
                              }}
                            />
                            <span className="font-medium text-sm">{location.name}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {location.code}
                          </Badge>
                          {location.elevation && (
                            <p className="text-xs text-muted-foreground">
                              Elevation: {location.elevation}m
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {selectedLocations.length > 0 && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    {selectedLocations.length} location(s) selected
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Step 3: Select Date Range
              </CardTitle>
              <CardDescription>
                Filter data by specifying a date range or use quick presets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => setQuickDateRange('last_30')}>
                  Last 30 Days
                </Button>
                <Button variant="outline" size="sm" onClick={() => setQuickDateRange('last_90')}>
                  Last 90 Days
                </Button>
                <Button variant="outline" size="sm" onClick={() => setQuickDateRange('this_year')}>
                  This Year
                </Button>
                <Button variant="outline" size="sm" onClick={() => setQuickDateRange('last_year')}>
                  Last Year
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setStartDate(undefined); setEndDate(undefined); }}>
                  All Time
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, 'PPP') : 'Pick start date'}
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
                <div className="space-y-2">
                  <label className="text-sm font-medium">End Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, 'PPP') : 'Pick end date'}
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Step 4: Select Data Attributes
              </CardTitle>
              <CardDescription>
                Choose specific environmental measurements to include in your download
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 mb-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedAttributes(attributes.map(a => a.name))}
                >
                  Select All
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const primaryAttrs = attributes.filter(a => a.isPrimary).map(a => a.name);
                    setSelectedAttributes(primaryAttrs);
                  }}
                >
                  Primary Only
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedAttributes([])}
                >
                  Clear All
                </Button>
              </div>
              
              <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                {Object.entries(groupedAttributes).map(([category, attrs]) => (
                  <div key={category} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{category}</Badge>
                      <Separator className="flex-1" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {attrs.map((attr) => (
                        <Card
                          key={attr.name}
                          className={cn(
                            "cursor-pointer transition-all hover:shadow-md",
                            selectedAttributes.includes(attr.name) && "border-primary bg-primary/5",
                            attr.isPrimary && "border-l-4 border-l-primary"
                          )}
                          onClick={() => {
                            setSelectedAttributes(prev =>
                              prev.includes(attr.name)
                                ? prev.filter(a => a !== attr.name)
                                : [...prev, attr.name]
                            );
                          }}
                        >
                          <CardContent className="pt-4">
                            <div className="flex items-start gap-2">
                              <Checkbox 
                                checked={selectedAttributes.includes(attr.name)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedAttributes(prev => [...prev, attr.name]);
                                  } else {
                                    setSelectedAttributes(prev => prev.filter(a => a !== attr.name));
                                  }
                                }}
                              />
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-medium text-sm">{attr.name}</span>
                                  {attr.isPrimary && (
                                    <Badge variant="outline" className="text-xs">Primary</Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {attr.description}
                                </p>
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {attr.unit}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {attr.measurementType}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              {selectedAttributes.length > 0 && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    {selectedAttributes.length} attribute(s) selected
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Download Summary & Action */}
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Download Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Season</p>
                  <p className="font-medium">{selectedTableInfo?.displayName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Locations</p>
                  <p className="font-medium">
                    {selectedLocations.length > 0 ? `${selectedLocations.length} selected` : 'All locations'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Date Range</p>
                  <p className="font-medium">
                    {startDate && endDate 
                      ? `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`
                      : 'All available data'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Attributes</p>
                  <p className="font-medium">
                    {selectedAttributes.length > 0 ? `${selectedAttributes.length} selected` : 'All attributes'}
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <Button 
                onClick={handleDownload} 
                disabled={loading || !selectedTable}
                size="lg"
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Preparing Download...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-5 w-5" />
                    Download Data (CSV Format)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default SeasonalDataDownload;
