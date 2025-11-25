import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Download, MapPin, Filter, Loader2, Info, CheckCircle2, Database, Table2, Clock, FileText, ChevronRight, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { API_BASE_URL } from '@/lib/apiConfig';
import { cn } from '@/lib/utils';

interface AttributeInfo {
  name: string;
  type: string;
  nullable: boolean;
  category: string;
  isPrimary: boolean;
  description: string;
  unit: string;
  measurementType: string;
}

interface LocationInfo {
  code: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  elevation: number | null;
}

interface TableInfo {
  name: string;
  rowCount?: number;
}

interface MetadataInfo {
  table: string;
  locations: string[];
  dateRange: { start: string; end: string };
  attributeCount: number;
  estimatedRows: number;
}

const SeasonalDataDownload = () => {
  const { toast } = useToast();
  
  // State
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [attributes, setAttributes] = useState<AttributeInfo[]>([]);
  const [locations, setLocations] = useState<LocationInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  
  // Selections
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [metadata, setMetadata] = useState<MetadataInfo | null>(null);

  // Initialize - fetch seasonal tables
  useEffect(() => {
    initializeData();
  }, []);

  // Fetch table attributes and locations when table changes
  useEffect(() => {
    if (selectedTable) {
      fetchTableDetails(selectedTable);
    }
  }, [selectedTable]);

  // Update metadata when selections change
  useEffect(() => {
    updateMetadata();
  }, [selectedTable, selectedLocations, startDate, endDate, selectedAttributes]);

  const initializeData = async () => {
    setIsLoading(true);
    try {
      const tablesUrl = `${API_BASE_URL}/api/seasonal/tables`;
      const tablesResponse = await fetch(tablesUrl);
      
      if (!tablesResponse.ok) {
        throw new Error('Failed to fetch tables');
      }
      
      const tablesData = await tablesResponse.json();
      setTables(tablesData);
      
      // Auto-select first table if available
      if (tablesData.length > 0) {
        setSelectedTable(tablesData[0].name);
      }
    } catch (error) {
      console.error('❌ Initialization error:', error);
      toast({
        title: "Initialization Error",
        description: "Failed to load seasonal data tables. Please refresh the page.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTableDetails = async (tableName: string) => {
    setIsLoading(true);
    try {
      const attributesUrl = `${API_BASE_URL}/api/seasonal/tables/${tableName}/attributes`;
      const locationsUrl = `${API_BASE_URL}/api/seasonal/tables/${tableName}/locations`;
      
      const [attributesResponse, locationsResponse] = await Promise.all([
        fetch(attributesUrl),
        fetch(locationsUrl)
      ]);
      
      if (attributesResponse.ok) {
        const attributesData = await attributesResponse.json();
        setAttributes(attributesData.attributes || []);
      }
      
      if (locationsResponse.ok) {
        const locationsData = await locationsResponse.json();
        setLocations(Array.isArray(locationsData) ? locationsData : []);
      }
    } catch (error) {
      console.error('❌ Failed to fetch table details:', error);
      toast({
        title: "Error",
        description: "Failed to load table details",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateMetadata = () => {
    if (!selectedTable || selectedLocations.length === 0 || !startDate || !endDate) {
      setMetadata(null);
      return;
    }

    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const dataPointsPerDay = 144; // 10-minute intervals
    const estimatedRows = daysDiff * dataPointsPerDay * selectedLocations.length;

    setMetadata({
      table: selectedTable,
      locations: selectedLocations,
      dateRange: {
        start: format(startDate, 'PPP'),
        end: format(endDate, 'PPP')
      },
      attributeCount: selectedAttributes.length > 0 ? selectedAttributes.length : attributes.length,
      estimatedRows
    });
  };

  const handleDownload = async () => {
    if (!startDate || !endDate || selectedLocations.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select date range and at least one location",
        variant: "destructive"
      });
      return;
    }

    setIsDownloading(true);
    try {
      const params = new URLSearchParams({
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        locations: selectedLocations.join(','),
        ...(selectedAttributes.length > 0 && { attributes: selectedAttributes.join(',') })
      });

      const url = `${API_BASE_URL}/api/seasonal/download/${selectedTable}?${params.toString()}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `seasonal_qaqc_${selectedTable}_${format(startDate, 'yyyy-MM-dd')}_to_${format(endDate, 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast({
        title: "Download Complete",
        description: `Downloaded ${selectedLocations.length} location(s) for ${selectedTable}`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Unable to download data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const groupedAttributes = attributes.reduce((groups, attr) => {
    if (attr.isPrimary) return groups; // Skip TIMESTAMP and Location
    const category = attr.category || 'Other';
    if (!groups[category]) groups[category] = [];
    groups[category].push(attr);
    return groups;
  }, {} as Record<string, AttributeInfo[]>);

  const canDownload = selectedLocations.length > 0 && !!startDate && !!endDate && !!selectedTable;

  if (isLoading && tables.length === 0) {
    return (
      <Card className="border-2 shadow-lg">
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-base text-muted-foreground">Loading seasonal data options...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <Database className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Seasonal QAQC Data Download</h2>
            <p className="text-muted-foreground mt-1">
              Quality-controlled environmental data from Vermont's monitoring network
            </p>
          </div>
        </div>
        
        <Alert className="border-primary/30 bg-primary/5">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            This interface provides access to quality-controlled seasonal environmental datasets. 
            Select your parameters below to customize and download your data in CSV format.
          </AlertDescription>
        </Alert>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Configuration Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Table Selection */}
          <Card className="border-2 shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/3 to-transparent border-b">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <Table2 className="h-5 w-5 text-primary" />
                    </div>
                    Data Table Selection
                  </CardTitle>
                  <CardDescription className="text-sm">Choose the environmental data table</CardDescription>
                </div>
                {selectedTable && (
                  <Badge variant="secondary" className="gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Selected
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <Select value={selectedTable} onValueChange={setSelectedTable}>
                <SelectTrigger className="w-full h-14 text-base border-2 hover:border-primary/50 transition-colors">
                  <SelectValue placeholder="Select a seasonal table..." />
                </SelectTrigger>
                <SelectContent>
                  {tables.map((table) => (
                    <SelectItem key={table.name} value={table.name} className="text-base py-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <div className="font-medium">{table.name}</div>
                          {table.rowCount && (
                            <div className="text-xs text-muted-foreground">
                              {table.rowCount.toLocaleString()} records available
                            </div>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Date Range Selection */}
          <Card className="border-2 shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/3 to-transparent border-b">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    Date Range
                  </CardTitle>
                  <CardDescription className="text-sm">Select the time period for your dataset</CardDescription>
                </div>
                {startDate && endDate && (
                  <Badge variant="secondary" className="gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-base font-medium">Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        className={cn(
                          "w-full justify-start h-12 text-left font-normal border-2 hover:border-primary/50",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, 'PPP') : 'Select start date'}
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
                  <Label className="text-base font-medium">End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        className={cn(
                          "w-full justify-start h-12 text-left font-normal border-2 hover:border-primary/50",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, 'PPP') : 'Select end date'}
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
              
              <div>
                <Label className="text-sm font-medium mb-3 block">Quick Presets</Label>
                <div className="flex gap-2 flex-wrap">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-2"
                    onClick={() => {
                      const today = new Date();
                      const lastWeek = new Date(today);
                      lastWeek.setDate(today.getDate() - 7);
                      setStartDate(lastWeek);
                      setEndDate(today);
                    }}
                  >
                    Last 7 Days
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-2"
                    onClick={() => {
                      const today = new Date();
                      const lastMonth = new Date(today);
                      lastMonth.setMonth(today.getMonth() - 1);
                      setStartDate(lastMonth);
                      setEndDate(today);
                    }}
                  >
                    Last Month
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-2"
                    onClick={() => {
                      const today = new Date();
                      const lastSeason = new Date(today);
                      lastSeason.setMonth(today.getMonth() - 6);
                      setStartDate(lastSeason);
                      setEndDate(today);
                    }}
                  >
                    Last 6 Months
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-2"
                    onClick={() => {
                      const today = new Date();
                      const lastYear = new Date(today);
                      lastYear.setFullYear(today.getFullYear() - 1);
                      setStartDate(lastYear);
                      setEndDate(today);
                    }}
                  >
                    Last Year
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Selection */}
          <Card className="border-2 shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/3 to-transparent border-b">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    Monitoring Locations
                  </CardTitle>
                  <CardDescription className="text-sm">Select one or more locations (required)</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedLocations(locations.map(loc => loc.code))}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedLocations([])}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {locations.map((location) => (
                  <div 
                    key={location.code} 
                    className={cn(
                      "flex items-start space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-sm",
                      selectedLocations.includes(location.code) 
                        ? "border-primary bg-primary/5 shadow-sm" 
                        : "border-border hover:border-primary/30"
                    )}
                    onClick={() => {
                      setSelectedLocations(prev => 
                        prev.includes(location.code)
                          ? prev.filter(loc => loc !== location.code)
                          : [...prev, location.code]
                      );
                    }}
                  >
                    <Checkbox
                      id={`location-${location.code}`}
                      checked={selectedLocations.includes(location.code)}
                      onCheckedChange={() => {}}
                      className="pointer-events-none mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <Label 
                        htmlFor={`location-${location.code}`}
                        className="text-sm font-semibold cursor-pointer block"
                      >
                        {location.code}
                      </Label>
                      <div className="text-xs text-muted-foreground mt-1">
                        {location.name}
                      </div>
                      {location.elevation && (
                        <div className="text-xs text-muted-foreground/70 mt-0.5">
                          {location.elevation}m elevation
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {selectedLocations.length > 0 && (
                <div className="mt-6 pt-4 border-t">
                  <Badge variant="secondary" className="text-sm px-4 py-2">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {selectedLocations.length} location{selectedLocations.length !== 1 ? 's' : ''} selected
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attribute Selection */}
          <Card className="border-2 shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/3 to-transparent border-b">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <Filter className="h-5 w-5 text-primary" />
                    </div>
                    Data Attributes
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Optional: Select specific attributes (default: all)
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedAttributes(
                      attributes.filter(a => !a.isPrimary).map(a => a.name)
                    )}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedAttributes([])}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {Object.entries(groupedAttributes).map(([category, attrs]) => (
                <div key={category} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-semibold">
                      {category}
                    </Badge>
                    <Separator className="flex-1" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {attrs.map((attr) => (
                      <div
                        key={attr.name}
                        className={cn(
                          "flex items-start space-x-3 p-3 rounded-lg border-2 transition-all cursor-pointer",
                          selectedAttributes.includes(attr.name)
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/30"
                        )}
                        onClick={() => {
                          setSelectedAttributes(prev =>
                            prev.includes(attr.name)
                              ? prev.filter(a => a !== attr.name)
                              : [...prev, attr.name]
                          );
                        }}
                      >
                        <Checkbox
                          id={`attr-${attr.name}`}
                          checked={selectedAttributes.includes(attr.name)}
                          onCheckedChange={() => {}}
                          className="pointer-events-none mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <Label
                            htmlFor={`attr-${attr.name}`}
                            className="text-sm font-medium cursor-pointer block leading-tight"
                          >
                            {attr.name}
                          </Label>
                          {attr.unit && attr.unit !== 'No Unit' && (
                            <div className="text-xs text-primary font-medium mt-1">
                              Unit: {attr.unit}
                            </div>
                          )}
                          {attr.description && (
                            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {attr.description}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {selectedAttributes.length > 0 && (
                <div className="pt-4 border-t">
                  <Badge variant="secondary" className="text-sm px-4 py-2">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {selectedAttributes.length} attribute{selectedAttributes.length !== 1 ? 's' : ''} selected
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary & Download Column */}
        <div className="space-y-6">
          {/* Download Summary */}
          <Card className="border-2 shadow-sm sticky top-6">
            <CardHeader className="bg-gradient-to-br from-primary/10 to-primary/5 border-b">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Download Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {metadata ? (
                <>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between text-sm">
                      <span className="text-muted-foreground">Table:</span>
                      <span className="font-medium text-right flex-1 ml-2">{metadata.table}</span>
                    </div>
                    <Separator />
                    <div className="flex items-start justify-between text-sm">
                      <span className="text-muted-foreground">Date Range:</span>
                      <span className="font-medium text-right flex-1 ml-2">
                        {metadata.dateRange.start}
                        <ChevronRight className="inline h-3 w-3 mx-1" />
                        {metadata.dateRange.end}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Locations:</span>
                      <span className="font-semibold">{metadata.locations.length}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Attributes:</span>
                      <span className="font-semibold">{metadata.attributeCount}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Est. Rows:</span>
                      <span className="font-semibold text-primary">
                        ~{metadata.estimatedRows.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button
                      onClick={handleDownload}
                      disabled={!canDownload || isDownloading}
                      className="w-full h-12 text-base gap-2 shadow-md hover:shadow-lg transition-all"
                      size="lg"
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Preparing Download...
                        </>
                      ) : (
                        <>
                          <Download className="h-5 w-5" />
                          Download CSV
                        </>
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  <Info className="h-8 w-8 mx-auto mb-3 opacity-50" />
                  <p>Complete your selections to see download summary</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Help Card */}
          <Card className="border-2 shadow-sm">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="flex items-center gap-2 text-base">
                <Info className="h-4 w-4" />
                Download Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ol className="space-y-3 text-sm">
                <li className="flex gap-2">
                  <Badge variant="outline" className="h-6 w-6 flex items-center justify-center p-0 flex-shrink-0">1</Badge>
                  <span className="text-muted-foreground">Select a data table</span>
                </li>
                <li className="flex gap-2">
                  <Badge variant="outline" className="h-6 w-6 flex items-center justify-center p-0 flex-shrink-0">2</Badge>
                  <span className="text-muted-foreground">Choose date range</span>
                </li>
                <li className="flex gap-2">
                  <Badge variant="outline" className="h-6 w-6 flex items-center justify-center p-0 flex-shrink-0">3</Badge>
                  <span className="text-muted-foreground">Pick monitoring locations</span>
                </li>
                <li className="flex gap-2">
                  <Badge variant="outline" className="h-6 w-6 flex items-center justify-center p-0 flex-shrink-0">4</Badge>
                  <span className="text-muted-foreground">Optionally filter attributes</span>
                </li>
                <li className="flex gap-2">
                  <Badge variant="outline" className="h-6 w-6 flex items-center justify-center p-0 flex-shrink-0">5</Badge>
                  <span className="text-muted-foreground">Download your custom dataset</span>
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SeasonalDataDownload;
