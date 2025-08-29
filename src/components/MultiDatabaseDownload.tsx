import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { CalendarIcon, Download, Database, Table, FileText, MapPin, Clock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { API_BASE_URL } from '@/lib/apiConfig';

interface DatabaseInfo {
  key: string;
  name: string;
  displayName: string;
  description: string;
}

interface TableInfo {
  name: string;
  displayName: string;
  description: string;
  rowCount: number;
}

interface AttributeInfo {
  name: string;
  type: string;
  nullable: boolean;
  category: string;
  isPrimary: boolean;
  comment: string;
}

const MultiDatabaseDownload = () => {
  const { toast } = useToast();
  
  // Core state
  const [databases, setDatabases] = useState<DatabaseInfo[]>([]);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [attributes, setAttributes] = useState<AttributeInfo[]>([]);
  const [locationValues, setLocationValues] = useState<string[]>([]);
  
  // Selections
  const [selectedDatabase, setSelectedDatabase] = useState<string>('');
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  
  // Loading states
  const [isLoadingDatabases, setIsLoadingDatabases] = useState(false);
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [isLoadingAttributes, setIsLoadingAttributes] = useState(false);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Step 1: Fetch databases on component mount
  useEffect(() => {
    fetchDatabases();
  }, []);

  // Step 2: Fetch tables when database changes
  useEffect(() => {
    if (selectedDatabase) {
      fetchTables(selectedDatabase);
      resetTableSelection();
    }
  }, [selectedDatabase]);

  // Step 3: Fetch attributes when table changes
  useEffect(() => {
    if (selectedDatabase && selectedTable) {
      fetchAttributes(selectedDatabase, selectedTable);
      resetAttributeSelection();
    }
  }, [selectedDatabase, selectedTable]);

  // Step 4: Fetch location values when attributes are loaded
  useEffect(() => {
    if (selectedDatabase && selectedTable) {
      fetchLocationValues(selectedDatabase, selectedTable);
    }
  }, [selectedDatabase, selectedTable]);

  const fetchDatabases = async () => {
    setIsLoadingDatabases(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/databases`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      setDatabases(data.databases || []);
    } catch (error) {
      console.error('Error fetching databases:', error);
      toast({
        title: "Connection Error",
        description: "Failed to fetch available databases. Please check your connection.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingDatabases(false);
    }
  };

  const fetchTables = async (database: string) => {
    setIsLoadingTables(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/databases/${database}/tables`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      setTables(data.tables || []);
    } catch (error) {
      console.error('Error fetching tables:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tables for selected database.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingTables(false);
    }
  };

  const fetchAttributes = async (database: string, table: string) => {
    setIsLoadingAttributes(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/databases/${database}/tables/${table}/attributes`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      setAttributes(data.attributes || []);
    } catch (error) {
      console.error('Error fetching attributes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch table attributes.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingAttributes(false);
    }
  };

  const fetchLocationValues = async (database: string, table: string) => {
    setIsLoadingLocations(true);
    try {
    const response = await fetch(`${API_BASE_URL}/api/databases/${database}/tables/${table}/locations`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const raw = (data.values || data.distinct || data || []) as any[];
    const normalized = Array.isArray(raw)
      ? raw.map((v: any) => (typeof v === 'string' ? v : v?.name)).filter(Boolean)
      : [];
    setLocationValues(normalized);
    } catch (error) {
      console.error('Error fetching location values:', error);
      toast({
        title: "Error",
        description: "Failed to fetch location values.",
        variant: "destructive"
      });
      setLocationValues([]);
    } finally {
      setIsLoadingLocations(false);
    }
  };

  const resetTableSelection = () => {
    setSelectedTable('');
    setTables([]);
    resetAttributeSelection();
  };

  const resetAttributeSelection = () => {
    setAttributes([]);
    setSelectedAttributes([]);
    setLocationValues([]);
    setSelectedLocations([]);
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const handleDatabaseChange = (value: string) => {
    setSelectedDatabase(value);
  };

  const handleTableChange = (value: string) => {
    setSelectedTable(value);
  };

  const toggleAttribute = (attributeName: string) => {
    setSelectedAttributes(prev => 
      prev.includes(attributeName)
        ? prev.filter(attr => attr !== attributeName)
        : [...prev, attributeName]
    );
  };

  const toggleLocation = (location: string) => {
    setSelectedLocations(prev => 
      prev.includes(location)
        ? prev.filter(loc => loc !== location)
        : [...prev, location]
    );
  };

  const handleDownload = async () => {
    // Validation
    if (!selectedDatabase || !selectedTable) {
      toast({
        title: "Selection Required",
        description: "Please select both database and table.",
        variant: "destructive"
      });
      return;
    }

    if (!startDate && !endDate) {
      toast({
        title: "Date Range Required",
        description: "Please select at least a start or end date.",
        variant: "destructive"
      });
      return;
    }

    if (selectedLocations.length === 0) {
      toast({
        title: "Location Required",
        description: "Please select at least one location.",
        variant: "destructive"
      });
      return;
    }

    setIsDownloading(true);
    try {
      const params = new URLSearchParams();
      
      if (selectedLocations.length > 0) {
        params.append('location', selectedLocations.join(','));
      }
      if (startDate) {
        params.append('start_date', startDate.toISOString().split('T')[0]);
      }
      if (endDate) {
        params.append('end_date', endDate.toISOString().split('T')[0]);
      }
      if (selectedAttributes.length > 0) {
        params.append('attributes', selectedAttributes.join(','));
      }

      const url = `${API_BASE_URL}/api/databases/${selectedDatabase}/download/${selectedTable}?${params}`;
      
      // Create download link
      const todayStamp = new Date().toISOString().split('T')[0];
      const filename = `${selectedDatabase}_${selectedTable}_${todayStamp}.csv`;
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download Started",
        description: `Downloading ${filename}`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Failed to start download. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Group attributes by category for better organization
  const groupedAttributes = attributes.reduce((groups, attr) => {
    const category = attr.category || 'Other';
    if (!groups[category]) groups[category] = [];
    groups[category].push(attr);
    return groups;
  }, {} as Record<string, AttributeInfo[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6 xs:mb-8">
        <h2 className="text-xl xs:text-2xl md:text-3xl font-bold mb-2">Environmental Data Export</h2>
        <p className="text-sm xs:text-base text-muted-foreground">
          Select database, table, and filters to download environmental monitoring data
        </p>
      </div>

      {/* Step 1: Database Selection */}
      <Card className="mb-4 xs:mb-6">
        <CardHeader className="pb-3 xs:pb-4">
          <CardTitle className="flex items-center gap-2 text-base xs:text-lg">
            <Database className="h-4 w-4 xs:h-5 xs:w-5" />
            Step 1: Select Database
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedDatabase} onValueChange={handleDatabaseChange} disabled={isLoadingDatabases}>
            <SelectTrigger className="min-h-[44px]">
              <SelectValue placeholder={isLoadingDatabases ? "Loading databases..." : "Choose a database"} />
            </SelectTrigger>
            <SelectContent className="z-50">
              {databases.map((db) => (
                <SelectItem key={db.key} value={db.key} className="min-h-[44px]">
                  <div>
                    <div className="font-medium text-sm xs:text-base">{db.displayName}</div>
                    <div className="text-xs xs:text-sm text-muted-foreground">{db.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isLoadingDatabases && (
            <div className="flex items-center gap-2 mt-2 text-xs xs:text-sm text-muted-foreground">
              <Loader2 className="h-3 w-3 xs:h-4 xs:w-4 animate-spin" />
              Loading databases...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Table Selection */}
      {selectedDatabase && (
        <Card className="mb-4 xs:mb-6">
          <CardHeader className="pb-3 xs:pb-4">
            <CardTitle className="flex items-center gap-2 text-base xs:text-lg">
              <Table className="h-4 w-4 xs:h-5 xs:w-5" />
              Step 2: Select Table
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedTable} onValueChange={handleTableChange} disabled={isLoadingTables}>
              <SelectTrigger className="min-h-[44px]">
                <SelectValue placeholder={isLoadingTables ? "Loading tables..." : "Choose a table"} />
              </SelectTrigger>
              <SelectContent className="z-50">
                {tables.map((table) => (
                  <SelectItem key={table.name} value={table.name} className="min-h-[44px]">
                    <div>
                      <div className="font-medium text-sm xs:text-base">{table.displayName}</div>
                      <div className="text-xs xs:text-sm text-muted-foreground">
                        {table.description} ({table.rowCount.toLocaleString()} records)
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isLoadingTables && (
              <div className="flex items-center gap-2 mt-2 text-xs xs:text-sm text-muted-foreground">
                <Loader2 className="h-3 w-3 xs:h-4 xs:w-4 animate-spin" />
                Loading tables...
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Time & Location Filters */}
      {selectedDatabase && selectedTable && attributes.length > 0 && (
        <div className="grid gap-4 xs:gap-6 lg:grid-cols-2 mb-4 xs:mb-6">
          {/* Date Range Filter */}
          <Card>
            <CardHeader className="pb-3 xs:pb-4">
              <CardTitle className="flex items-center gap-2 text-base xs:text-lg">
                <Clock className="h-4 w-4 xs:h-5 xs:w-5" />
                Step 3a: Time Filter
                <Badge variant="outline" className="text-2xs xs:text-xs">Required</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 xs:space-y-4">
              <div className="grid grid-cols-1 gap-3 xs:gap-4">
                <div>
                  <Label className="text-xs xs:text-sm">Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal min-h-[44px]">
                        <CalendarIcon className="mr-2 h-3 w-3 xs:h-4 xs:w-4" />
                        <span className="text-xs xs:text-sm">
                          {startDate ? format(startDate, "PPP") : "Select start date"}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-50" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label className="text-xs xs:text-sm">End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal min-h-[44px]">
                        <CalendarIcon className="mr-2 h-3 w-3 xs:h-4 xs:w-4" />
                        <span className="text-xs xs:text-sm">
                          {endDate ? format(endDate, "PPP") : "Select end date"}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-50" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Filter */}
          <Card>
            <CardHeader className="pb-3 xs:pb-4">
              <CardTitle className="flex items-center gap-2 text-base xs:text-lg">
                <MapPin className="h-4 w-4 xs:h-5 xs:w-5" />
                Step 3b: Location Filter
                <Badge variant="outline" className="text-2xs xs:text-xs">Required</Badge>
              </CardTitle>
              <p className="text-xs xs:text-sm text-muted-foreground">
                {locationValues.length} monitoring locations available
              </p>
            </CardHeader>
            <CardContent>
              {isLoadingLocations ? (
                <div className="flex items-center gap-2 text-xs xs:text-sm text-muted-foreground">
                  <Loader2 className="h-3 w-3 xs:h-4 xs:w-4 animate-spin" />
                  Loading location values...
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {locationValues.map((location) => (
                    <div key={location} className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded min-h-[44px]">
                      <Checkbox
                        id={location}
                        checked={selectedLocations.includes(location)}
                        onCheckedChange={() => toggleLocation(location)}
                        className="min-h-[20px] min-w-[20px]"
                      />
                      <Label htmlFor={location} className="text-xs xs:text-sm font-medium flex-1 cursor-pointer">
                        {location}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
              {selectedLocations.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs xs:text-sm text-primary font-medium">
                    {selectedLocations.length} location{selectedLocations.length > 1 ? 's' : ''} selected
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 4: Optional Attribute Selection */}
      {selectedDatabase && selectedTable && attributes.length > 0 && (startDate || endDate) && selectedLocations.length > 0 && (
        <Card className="mb-6 xs:mb-8">
          <CardHeader className="pb-3 xs:pb-4">
            <CardTitle className="flex items-center gap-2 text-base xs:text-lg">
              <FileText className="h-4 w-4 xs:h-5 xs:w-5" />
              Step 4: Select Attributes (Optional)
            </CardTitle>
            <p className="text-xs xs:text-sm text-muted-foreground">
              Leave unselected to download all available attributes
            </p>
          </CardHeader>
          <CardContent>
            {isLoadingAttributes ? (
              <div className="flex items-center gap-2 text-xs xs:text-sm text-muted-foreground">
                <Loader2 className="h-3 w-3 xs:h-4 xs:w-4 animate-spin" />
                Loading attributes...
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedAttributes).map(([category, attrs]) => (
                  <div key={category}>
                    <h4 className="font-medium text-xs xs:text-sm text-foreground mb-2 px-2 py-1 bg-muted/50 rounded">
                      {category} ({attrs.length})
                    </h4>
                    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-2">
                      {attrs.map((attr) => (
                        <div key={attr.name} className="flex items-center space-x-2 p-2 hover:bg-muted/30 rounded min-h-[44px]">
                          <Checkbox
                            id={attr.name}
                            checked={selectedAttributes.includes(attr.name)}
                            onCheckedChange={() => toggleAttribute(attr.name)}
                            className="min-h-[20px] min-w-[20px]"
                          />
                          <Label htmlFor={attr.name} className="text-xs xs:text-sm font-medium flex-1 cursor-pointer">
                            {attr.name}
                            {attr.isPrimary && <Badge variant="secondary" className="ml-1 text-2xs">Primary</Badge>}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {selectedAttributes.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs xs:text-sm text-primary font-medium">
                      {selectedAttributes.length} attribute{selectedAttributes.length > 1 ? 's' : ''} selected
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Download Action */}
      {selectedDatabase && selectedTable && (startDate || endDate) && selectedLocations.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 xs:p-6">
            <div className="flex flex-col xs:flex-row items-center justify-between gap-4">
              <div className="text-center xs:text-left">
                <h3 className="font-semibold text-sm xs:text-base mb-1">Ready to Download</h3>
                <p className="text-xs xs:text-sm text-muted-foreground">
                  {selectedDatabase} → {selectedTable} → {selectedLocations.length} location(s)
                  {selectedAttributes.length > 0 && ` → ${selectedAttributes.length} attribute(s)`}
                </p>
              </div>
              <Button 
                onClick={handleDownload} 
                disabled={isDownloading}
                size="lg"
                className="w-full xs:w-auto min-h-[48px] px-6"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span className="text-sm xs:text-base">Downloading...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    <span className="text-sm xs:text-base">Download CSV</span>
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MultiDatabaseDownload;