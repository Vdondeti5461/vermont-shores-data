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
  Loader2, Download, Table, MapPin, Calendar as CalendarIcon, 
  Filter, CheckCircle2, Info, FileText, TrendingUp
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
        description: "Your data has been downloaded successfully with metadata headers",
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
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {[
          { num: 1, label: 'Select Season', icon: Table },
          { num: 2, label: 'Configure', icon: Filter },
          { num: 3, label: 'Download', icon: Download }
        ].map(({ num, label, icon: Icon }, idx) => (
          <React.Fragment key={num}>
            <div className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
              currentStep >= num 
                ? "bg-primary text-primary-foreground shadow-md" 
                : "bg-muted text-muted-foreground"
            )}>
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </div>
            {idx < 2 && <div className="h-0.5 w-8 bg-border" />}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Season Selection */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Table className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Select Seasonal Dataset</CardTitle>
              <CardDescription>Choose the monitoring season for your analysis</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && tables.length === 0 ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tables.map((table) => (
                <Card
                  key={table.id}
                  className={cn(
                    "cursor-pointer transition-all border-2 hover:shadow-xl hover:scale-105",
                    selectedTable === table.name 
                      ? "border-primary bg-primary/5 shadow-lg" 
                      : "border-border hover:border-primary/50"
                  )}
                  onClick={() => handleTableSelection(table.name)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{table.displayName}</CardTitle>
                      {selectedTable === table.name && (
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-muted-foreground line-clamp-2">{table.description}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {table.rowCount.toLocaleString()} records
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Filters */}
      {selectedTable && (
        <>
          {/* Location Selection */}
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Select Monitoring Locations</CardTitle>
                  <CardDescription>Choose stations from the monitoring network</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedLocations(locations.map(l => l.code))}
                  className="text-xs"
                >
                  Select All ({locations.length})
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedLocations([])}
                  className="text-xs"
                >
                  Clear All
                </Button>
                {selectedLocations.length > 0 && (
                  <Badge variant="default" className="ml-auto">
                    {selectedLocations.length} selected
                  </Badge>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto p-1">
                {locations.map((location) => (
                  <Card
                    key={location.code}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md border",
                      selectedLocations.includes(location.code) 
                        ? "border-primary bg-primary/5" 
                        : "border-border"
                    )}
                    onClick={() => {
                      setSelectedLocations(prev =>
                        prev.includes(location.code)
                          ? prev.filter(l => l !== location.code)
                          : [...prev, location.code]
                      );
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        <Checkbox 
                          checked={selectedLocations.includes(location.code)}
                          className="mt-1"
                        />
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{location.name}</div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {location.code}
                            </Badge>
                            {location.elevation && (
                              <span className="text-xs text-muted-foreground">
                                {location.elevation}m
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Date Range Selection */}
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Select Date Range</CardTitle>
                  <CardDescription>Filter data by time period</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Last 30 Days', value: 'last_30' },
                  { label: 'Last 90 Days', value: 'last_90' },
                  { label: 'This Year', value: 'this_year' },
                  { label: 'Last Year', value: 'last_year' },
                ].map(preset => (
                  <Button
                    key={preset.value}
                    variant="outline"
                    size="sm"
                    onClick={() => setQuickDateRange(preset.value)}
                    className="text-xs"
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, 'PP') : 'Pick start date'}
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
                  <Label className="text-sm font-medium">End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, 'PP') : 'Pick end date'}
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
              
              {startDate && endDate && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Selected range: {format(startDate, 'PP')} to {format(endDate, 'PP')}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Attribute Selection */}
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Filter className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Select Data Attributes</CardTitle>
                  <CardDescription>Choose which measurements to include</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedAttributes(attributes.map(a => a.name))}
                  className="text-xs"
                >
                  Select All
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const primaryAttrs = attributes
                      .filter(attr => attr.isPrimary)
                      .map(attr => attr.name);
                    setSelectedAttributes(primaryAttrs);
                  }}
                  className="text-xs"
                >
                  Primary Only
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedAttributes([])}
                  className="text-xs"
                >
                  Clear All
                </Button>
                {selectedAttributes.length > 0 && (
                  <Badge variant="default" className="ml-auto">
                    {selectedAttributes.length} selected
                  </Badge>
                )}
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto p-1">
                {Object.entries(groupedAttributes).map(([category, attrs]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center gap-2 sticky top-0 bg-background py-1">
                      <Badge className="text-xs">{category}</Badge>
                      <Separator className="flex-1" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {attrs.map((attr) => (
                        <Card
                          key={attr.name}
                          className={cn(
                            "cursor-pointer transition-all hover:shadow-md border",
                            selectedAttributes.includes(attr.name) 
                              ? "border-primary bg-primary/5" 
                              : "border-border",
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
                          <CardContent className="p-3">
                            <div className="flex items-start gap-2">
                              <Checkbox 
                                checked={selectedAttributes.includes(attr.name)}
                                className="mt-1"
                              />
                              <div className="flex-1 space-y-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-medium text-xs truncate">{attr.name}</span>
                                  {attr.isPrimary && (
                                    <Badge variant="outline" className="text-2xs">Key</Badge>
                                  )}
                                </div>
                                <p className="text-2xs text-muted-foreground line-clamp-1">
                                  {attr.description}
                                </p>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge variant="secondary" className="text-2xs">
                                    {attr.unit}
                                  </Badge>
                                  <span className="text-2xs text-muted-foreground">
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
            </CardContent>
          </Card>

          {/* Download Summary */}
          <Card className="border-2 border-primary shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Download Summary</CardTitle>
                  <CardDescription>Review your selections before downloading</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1 p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Season</p>
                  <p className="font-medium text-sm">{selectedTableInfo?.displayName}</p>
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Locations</p>
                  <p className="font-medium text-sm">
                    {selectedLocations.length > 0 ? `${selectedLocations.length} selected` : 'All locations'}
                  </p>
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Date Range</p>
                  <p className="font-medium text-sm">
                    {startDate && endDate 
                      ? `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`
                      : 'All data'}
                  </p>
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Attributes</p>
                  <p className="font-medium text-sm">
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
                    Download CSV with Metadata
                  </>
                )}
              </Button>
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Your download will include metadata headers with location names, date ranges, and dataset information.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

// Add Label component if not imported
const Label = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <label className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}>
    {children}
  </label>
);

export default SeasonalDataDownload;
