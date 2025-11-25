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
import { CalendarIcon, Download, MapPin, Filter, Loader2, Info, CheckCircle2, Database, Table2, Clock, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { API_BASE_URL, DOWNLOADABLE_DATABASE } from '@/lib/apiConfig';
import { cn } from '@/lib/utils';

interface AttributeInfo {
  name: string;
  type: string;
  nullable: boolean;
  category: string;
  isPrimary: boolean;
  comment: string;
}

interface TableInfo {
  name: string;
  rowCount?: number;
}

// Location name mapping from Network page
const LOCATION_NAMES: Record<string, string> = {
  'SUMM': 'Mansfield Summit',
  'RB01': 'Ranch Brook #1',
  'RB02': 'Ranch Brook #2',
  'RB12': 'Ranch Brook #12',
  'RB09': 'Ranch Brook #9',
  'RB03': 'Ranch Brook #3',
  'UNDR': 'Mansfield West SCAN',
  'RB04': 'Ranch Brook #4',
  'RB10': 'Ranch Brook #10',
  'RB07': 'Ranch Brook #7',
  'SR01': 'Sleepers R3/Main',
  'RB05': 'Ranch Brook #5',
  'RB08': 'Ranch Brook #8',
  'PROC': 'Mansfield West Proctor',
  'RB06': 'Ranch Brook #6',
  'RB11': 'Ranch Brook #11',
  'SR25': 'Sleepers R25',
  'SI11': 'Sleepers W1/R11',
  'JRCL': 'Jericho Clearing',
  'JRFO': 'Jericho Forest',
  'SPST': 'Spear St',
  'PTSH': 'Potash Brook'
};

const SeasonalDataDownload = () => {
  const { toast } = useToast();
  
  // State
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [attributes, setAttributes] = useState<AttributeInfo[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  
  // Selections
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Initialize - fetch tables
  useEffect(() => {
    initializeData();
  }, []);

  // Fetch table attributes and locations when table changes
  useEffect(() => {
    if (selectedTable) {
      fetchTableDetails(selectedTable);
    }
  }, [selectedTable]);

  const initializeData = async () => {
    setIsLoading(true);
    try {
      const tablesUrl = `${API_BASE_URL}/api/databases/${DOWNLOADABLE_DATABASE}/tables`;
      const tablesResponse = await fetch(tablesUrl);
      
      if (!tablesResponse.ok) {
        throw new Error('Failed to fetch tables');
      }
      
      const tablesData = await tablesResponse.json();
      const tablesList = tablesData.tables || [];
      setTables(tablesList);
      
      // Auto-select first table if available
      if (tablesList.length > 0) {
        setSelectedTable(tablesList[0].name);
      }
    } catch (error) {
      console.error('❌ Initialization error:', error);
      toast({
        title: "Initialization Error",
        description: "Failed to load data options. Please refresh the page.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTableDetails = async (tableName: string) => {
    setIsLoading(true);
    try {
      const attributesUrl = `${API_BASE_URL}/api/databases/${DOWNLOADABLE_DATABASE}/tables/${tableName}/attributes`;
      const locationsUrl = `${API_BASE_URL}/api/databases/${DOWNLOADABLE_DATABASE}/tables/${tableName}/locations`;
      
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
        const locationsList = Array.isArray(locationsData) ? locationsData : (locationsData.locations || []);
        setLocations(locationsList);
      }
    } catch (error) {
      console.error('❌ Failed to fetch table details:', error);
    } finally {
      setIsLoading(false);
    }
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
        format: 'csv',
        ...(selectedAttributes.length > 0 && { attributes: selectedAttributes.join(',') })
      });

      const url = `${API_BASE_URL}/api/databases/${DOWNLOADABLE_DATABASE}/download/${selectedTable}?${params.toString()}`;
      const link = document.createElement('a');
      link.href = url;
      link.download = `seasonal_qaqc_${selectedTable}_${format(startDate, 'yyyy-MM-dd')}_to_${format(endDate, 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download Started",
        description: "Your CSV export has begun",
      });
    } catch (error) {
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
    const category = attr.category || 'Other';
    if (!groups[category]) groups[category] = [];
    groups[category].push(attr);
    return groups;
  }, {} as Record<string, AttributeInfo[]>);

  const canDownload = selectedLocations.length > 0 && !!startDate && !!endDate && !!selectedTable;
  
  const getLocationDisplayName = (code: string) => {
    return LOCATION_NAMES[code] || code;
  };

  if (isLoading && tables.length === 0) {
    return (
      <Card className="border-2">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">Loading data options...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Database Info Alert */}
      <Alert className="border-primary/50 bg-primary/5">
        <Database className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <div className="font-semibold">Seasonal QAQC Database</div>
            <p className="text-sm">
              Download quality-controlled seasonal environmental data from Vermont's monitoring network. 
              Select your table, date range, locations, and attributes to customize your dataset.
            </p>
          </div>
        </AlertDescription>
      </Alert>

      {/* Table Selection */}
      <Card className="border-2 hover:border-primary/50 transition-colors">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Table2 className="h-5 w-5 text-primary" />
                Select Data Table
              </CardTitle>
              <CardDescription>Choose the environmental data table to download</CardDescription>
            </div>
            {selectedTable && (
              <Badge variant="secondary" className="ml-2">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Selected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Select value={selectedTable} onValueChange={setSelectedTable}>
              <SelectTrigger className="w-full h-12 text-base">
                <SelectValue placeholder="Select a table..." />
              </SelectTrigger>
              <SelectContent>
                {tables.map((table) => (
                  <SelectItem key={table.name} value={table.name} className="text-base py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>{table.name}</span>
                      {table.rowCount && (
                        <Badge variant="outline" className="ml-auto text-xs">
                          {table.rowCount.toLocaleString()} rows
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Date Range Selection */}
      <Card className="border-2 hover:border-primary/50 transition-colors">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Date Range
              </CardTitle>
              <CardDescription>Select the time period for your data</CardDescription>
            </div>
            {startDate && endDate && (
              <Badge variant="secondary" className="ml-2">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Selected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-base font-medium">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className={cn(
                      "w-full justify-start h-12 text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : 'Pick a date'}
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
            <div className="space-y-2">
              <Label className="text-base font-medium">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className={cn(
                      "w-full justify-start h-12 text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PPP') : 'Pick a date'}
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
          
          <div className="pt-2">
            <Label className="text-sm font-medium mb-2 block">Quick Presets</Label>
            <div className="flex gap-2 flex-wrap">
              <Button 
                variant="outline" 
                size="sm"
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
      <Card className="border-2 hover:border-primary/50 transition-colors">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Monitoring Locations
              </CardTitle>
              <CardDescription>Select one or more locations (Required)</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedLocations(locations)}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {locations.map((location) => (
              <div 
                key={location} 
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg border-2 transition-all cursor-pointer hover:bg-accent/50",
                  selectedLocations.includes(location) ? "border-primary bg-primary/5" : "border-border"
                )}
                onClick={() => {
                  setSelectedLocations(prev => 
                    prev.includes(location)
                      ? prev.filter(loc => loc !== location)
                      : [...prev, location]
                  );
                }}
              >
                <Checkbox
                  id={`location-${location}`}
                  checked={selectedLocations.includes(location)}
                  onCheckedChange={() => {}}
                  className="pointer-events-none"
                />
                <Label 
                  htmlFor={`location-${location}`}
                  className="text-sm font-medium cursor-pointer flex-1"
                >
                  <div className="font-semibold">{location}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {getLocationDisplayName(location)}
                  </div>
                </Label>
              </div>
            ))}
          </div>
          {selectedLocations.length > 0 && (
            <div className="mt-6 pt-4 border-t">
              <Badge variant="secondary" className="text-sm px-3 py-1">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {selectedLocations.length} location{selectedLocations.length !== 1 ? 's' : ''} selected
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attribute Selection */}
      <Card className="border-2 hover:border-primary/50 transition-colors">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                Data Attributes
              </CardTitle>
              <CardDescription>Select specific attributes (Optional - defaults to all)</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedAttributes(attributes.map(a => a.name))}
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
                <div className="h-px flex-1 bg-border" />
                <h4 className="text-sm font-semibold text-primary px-2">{category}</h4>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {attrs.map((attr) => (
                  <div 
                    key={attr.name} 
                    className={cn(
                      "flex items-start space-x-3 p-3 rounded-lg border-2 transition-all cursor-pointer hover:bg-accent/50",
                      selectedAttributes.includes(attr.name) ? "border-primary bg-primary/5" : "border-border"
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
                      className="pointer-events-none mt-0.5"
                    />
                    <div className="grid gap-1.5 leading-none flex-1">
                      <Label 
                        htmlFor={`attr-${attr.name}`}
                        className="text-sm font-medium cursor-pointer flex items-center gap-2"
                      >
                        {attr.name}
                        {attr.isPrimary && (
                          <Badge variant="outline" className="text-xs">Primary</Badge>
                        )}
                      </Label>
                      {attr.comment && (
                        <p className="text-xs text-muted-foreground">{attr.comment}</p>
                      )}
                      <div className="flex gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">{attr.type}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {selectedAttributes.length > 0 && (
            <div className="pt-4 border-t">
              <Badge variant="secondary" className="text-sm px-3 py-1">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {selectedAttributes.length} attribute{selectedAttributes.length !== 1 ? 's' : ''} selected
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Download Summary & Button */}
      <Card className={cn(
        "border-2 transition-all",
        canDownload ? "border-primary bg-gradient-to-br from-primary/10 to-transparent shadow-lg" : "border-muted"
      )}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                {canDownload ? (
                  <>
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                    Ready to Download
                  </>
                ) : (
                  <>
                    <Info className="h-6 w-6 text-muted-foreground" />
                    Complete Required Fields
                  </>
                )}
              </h3>
              {canDownload && (
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p><strong>Table:</strong> {selectedTable}</p>
                  <p><strong>Period:</strong> {startDate ? format(startDate, 'MMM d, yyyy') : ''} to {endDate ? format(endDate, 'MMM d, yyyy') : ''}</p>
                  <p><strong>Locations:</strong> {selectedLocations.length} selected</p>
                  <p><strong>Attributes:</strong> {selectedAttributes.length > 0 ? `${selectedAttributes.length} selected` : 'All attributes'}</p>
                </div>
              )}
            </div>
            <Button 
              onClick={handleDownload}
              disabled={!canDownload || isDownloading}
              size="lg"
              className="min-w-[200px] h-12 text-base"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-5 w-5" />
                  Download CSV
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SeasonalDataDownload;
