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
    if (selectedDatabase && selectedTable && attributes.length > 0) {
      fetchLocationValues(selectedDatabase, selectedTable);
    }
  }, [selectedDatabase, selectedTable, attributes]);

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
      // Find the Location attribute
      const locationAttribute = attributes.find(attr => 
        attr.name.toLowerCase() === 'location'
      );
      
      if (!locationAttribute) {
        console.warn('No Location attribute found');
        setLocationValues([]);
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/databases/${database}/tables/${table}/attributes/${locationAttribute.name}/distinct`
      );
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      const values = data.values || data.distinct || data || [];
      setLocationValues(Array.isArray(values) ? values : []);
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
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Environmental Data Export</h2>
        <p className="text-muted-foreground">
          Select database, table, and filters to download environmental monitoring data
        </p>
      </div>

      {/* Step 1: Database Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Step 1: Select Database
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedDatabase} onValueChange={handleDatabaseChange} disabled={isLoadingDatabases}>
            <SelectTrigger>
              <SelectValue placeholder={isLoadingDatabases ? "Loading databases..." : "Choose a database"} />
            </SelectTrigger>
            <SelectContent>
              {databases.map((db) => (
                <SelectItem key={db.key} value={db.key}>
                  <div>
                    <div className="font-medium">{db.displayName}</div>
                    <div className="text-sm text-muted-foreground">{db.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isLoadingDatabases && (
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading databases...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Table Selection */}
      {selectedDatabase && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Table className="h-5 w-5" />
              Step 2: Select Table
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedTable} onValueChange={handleTableChange} disabled={isLoadingTables}>
              <SelectTrigger>
                <SelectValue placeholder={isLoadingTables ? "Loading tables..." : "Choose a table"} />
              </SelectTrigger>
              <SelectContent>
                {tables.map((table) => (
                  <SelectItem key={table.name} value={table.name}>
                    <div>
                      <div className="font-medium">{table.displayName}</div>
                      <div className="text-sm text-muted-foreground">
                        {table.description} ({table.rowCount.toLocaleString()} records)
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isLoadingTables && (
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading tables...
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Time & Location Filters */}
      {selectedDatabase && selectedTable && attributes.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Date Range Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Step 3a: Time Filter
                <Badge variant="outline" className="text-xs">Required</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Select start date"}
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
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "Select end date"}
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

          {/* Location Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Step 3b: Location Filter
                <Badge variant="outline" className="text-xs">Required</Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {locationValues.length} monitoring locations available
              </p>
            </CardHeader>
            <CardContent>
              {isLoadingLocations ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading location values...
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {locationValues.map((location) => (
                    <div key={location} className="flex items-center space-x-2">
                      <Checkbox
                        id={location}
                        checked={selectedLocations.includes(location)}
                        onCheckedChange={() => toggleLocation(location)}
                      />
                      <Label htmlFor={location} className="text-sm font-medium">
                        {location}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
              {selectedLocations.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm text-primary font-medium">
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Step 4: Select Attributes (Optional)
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Leave unselected to download all available attributes
            </p>
          </CardHeader>
          <CardContent>
            {isLoadingAttributes ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading attributes...
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(groupedAttributes).map(([category, attrs]) => (
                  <div key={category} className="space-y-3">
                    <h4 className="font-semibold text-primary">{category}</h4>
                    <div className="space-y-2">
                      {attrs.map((attr) => (
                        <div key={attr.name} className="flex items-center space-x-2">
                          <Checkbox
                            id={attr.name}
                            checked={selectedAttributes.includes(attr.name)}
                            onCheckedChange={() => toggleAttribute(attr.name)}
                          />
                          <Label htmlFor={attr.name} className="text-sm">
                            {attr.name}
                            {attr.isPrimary && (
                              <Badge variant="secondary" className="ml-2 text-xs">Primary</Badge>
                            )}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Download Summary & Action */}
      {selectedDatabase && selectedTable && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-semibold">Download Summary</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Database:</strong> {databases.find(db => db.key === selectedDatabase)?.displayName || 'None'}</p>
                  <p><strong>Table:</strong> {tables.find(t => t.name === selectedTable)?.displayName || 'None'}</p>
                  <p><strong>Attributes:</strong> {selectedAttributes.length > 0 ? `${selectedAttributes.length} selected` : 'All attributes'}</p>
                  <p><strong>Locations:</strong> {selectedLocations.length > 0 ? `${selectedLocations.length} selected` : 'None selected'}</p>
                  <p><strong>Date Range:</strong> {
                    startDate && endDate 
                      ? `${format(startDate, 'PP')} - ${format(endDate, 'PP')}` 
                      : startDate 
                        ? `From ${format(startDate, 'PP')}` 
                        : endDate 
                          ? `Until ${format(endDate, 'PP')}` 
                          : 'No date filter'
                  }</p>
                </div>
              </div>
              <Button 
                onClick={handleDownload} 
                disabled={!selectedDatabase || !selectedTable || (!startDate && !endDate) || selectedLocations.length === 0 || isDownloading}
                className="min-w-[140px]"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Preparing...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download CSV
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