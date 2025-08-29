import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarIcon, Download, Database, Table, FileText, MapPin, Clock, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import MetadataDisplay from './MetadataDisplay';
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
  primaryAttributes: string[];
}

interface AttributeInfo {
  name: string;
  type: string;
  nullable: boolean;
  category: string;
  isPrimary: boolean;
  comment: string;
}

interface LocationInfo {
  id: number;
  name: string;
  displayName: string;
  latitude: number;
  longitude: number;
  elevation: number;
}

const MultiDatabaseDownload = () => {
  const { toast } = useToast();
  
  // State management
  const [databases, setDatabases] = useState<DatabaseInfo[]>([]);
  const [selectedDatabase, setSelectedDatabase] = useState<string>('');
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [attributes, setAttributes] = useState<AttributeInfo[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [locations, setLocations] = useState<LocationInfo[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTables, setIsLoadingTables] = useState(false);

  // Fetch available databases
  useEffect(() => {
    fetchDatabases();
  }, []);

  // Fetch tables when database changes
  useEffect(() => {
    if (selectedDatabase) {
      fetchTables(selectedDatabase);
    } else {
      setTables([]);
      setLocations([]);
    }
    setSelectedTable('');
    setSelectedLocations([]);
  }, [selectedDatabase]);

  // Fetch locations when table changes (table-specific locations)
  useEffect(() => {
    if (selectedDatabase && selectedTable) {
      fetchLocations(selectedDatabase, selectedTable);
    } else {
      setLocations([]);
      setSelectedLocations([]);
    }
  }, [selectedDatabase, selectedTable]);

  // Fetch attributes when table changes
  useEffect(() => {
    if (selectedDatabase && selectedTable) {
      fetchAttributes(selectedDatabase, selectedTable);
    } else {
      setAttributes([]);
      setSelectedAttributes([]);
    }
  }, [selectedDatabase, selectedTable]);

  const fetchDatabases = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/databases`);
      const data = await response.json();
      setDatabases(data.databases);
    } catch (error) {
      console.error('Error fetching databases:', error);
      toast({
        title: "Connection Error",
        description: "Failed to fetch available databases",
        variant: "destructive"
      });
    }
  };

  const fetchTables = async (database: string) => {
    try {
      setIsLoadingTables(true);
      const response = await fetch(`${API_BASE_URL}/api/databases/${database}/tables`);
      const data = await response.json();
      setTables(data.tables || []);
    } catch (error) {
      console.error('Error fetching tables:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tables",
        variant: "destructive"
      });
    } finally {
      setIsLoadingTables(false);
    }
  };

  const fetchAttributes = async (database: string, table: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/databases/${database}/tables/${table}/attributes`);
      const data = await response.json();
      setAttributes(data.attributes || []);
      // Let the user pick after time & location selection
      setSelectedAttributes([]);
    } catch (error) {
      console.error('Error fetching attributes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch table attributes",
        variant: "destructive"
      });
    }
  };

  const fetchLocations = async (database: string, table?: string) => {
    try {
      // New API always returns all 22 locations regardless of database/table
      const url = `${API_BASE_URL}/api/databases/${database}/locations`;
      const response = await fetch(url);
      const data = await response.json();
      setLocations(data);
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch locations",
        variant: "destructive"
      });
    }
  };

  const handleDownload = async () => {
    if (!selectedDatabase || !selectedTable) {
      toast({
        title: "Selection Required",
        description: "Please select a database and table",
        variant: "destructive"
      });
      return;
    }

    // Require timestamp and location selection
    if (!startDate && !endDate) {
      toast({
        title: "Time Range Required",
        description: "Please select a start and/or end date",
        variant: "destructive"
      });
      return;
    }
    
    if (selectedLocations.length === 0) {
      toast({
        title: "Location Required",
        description: "Please select at least one location",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams();

      // Handle multiple locations (join with comma for new API)
      if (selectedLocations.length > 0) {
        params.append('location', selectedLocations.join(','));
      }

      if (startDate) params.append('start_date', startDate.toISOString().split('T')[0]);
      if (endDate) params.append('end_date', endDate.toISOString().split('T')[0]);
      if (selectedAttributes.length > 0) params.append('attributes', selectedAttributes.join(','));

      const url = `${API_BASE_URL}/api/databases/${selectedDatabase}/download/${selectedTable}?${params}`;

      // Build filename: database_table_YYYY-MM-DD.csv
      const todayStamp = new Date().toISOString().split('T')[0];
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedDatabase}_${selectedTable}_${todayStamp}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({ 
        title: "Download Started", 
        description: `Downloading data for ${selectedLocations.length} location(s)` 
      });
    } catch (error) {
      console.error('Error downloading data:', error);
      toast({ title: "Download Failed", description: "Failed to download data", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAttribute = (attributeName: string) => {
    setSelectedAttributes(prev => 
      prev.includes(attributeName)
        ? prev.filter(attr => attr !== attributeName)
        : [...prev, attributeName]
    );
  };

  const toggleLocation = (locationName: string) => {
    setSelectedLocations(prev => 
      prev.includes(locationName)
        ? prev.filter(loc => loc !== locationName)
        : [...prev, locationName]
    );
  };

  // Group attributes by category
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
        <h2 className="text-2xl font-bold mb-2">Multi-Database Data Export</h2>
        <p className="text-muted-foreground">
          Select database, tables, and filters to download environmental data
        </p>
      </div>

      {/* Step 1: Database & Table Selection */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Step 1: Select Database
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedDatabase} onValueChange={setSelectedDatabase}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a database" />
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Table className="h-5 w-5" />
              Step 2: Select Table
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedTable} onValueChange={setSelectedTable} disabled={!selectedDatabase || isLoadingTables}>
              <SelectTrigger>
                <SelectValue placeholder={isLoadingTables ? "Loading tables..." : selectedDatabase ? "Choose a table" : "Select database first"} />
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
          </CardContent>
        </Card>
      </div>

      {/* Step 2: Primary Filters - TIMESTAMP and Location */}
      {selectedDatabase && selectedTable && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
            <Badge variant="secondary">Step 3</Badge>
            Primary Filters: Time & Location
          </h3>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  TIMESTAMP Filter
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location Filter
                  <Badge variant="outline" className="text-xs">Required</Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  All {locations.length} Vermont monitoring locations available
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {locations.length > 0 ? (
                    locations.map((location) => (
                      <div key={location.name} className="flex items-center space-x-2">
                        <Checkbox
                          id={location.name}
                          checked={selectedLocations.includes(location.name)}
                          onCheckedChange={() => toggleLocation(location.name)}
                        />
                        <Label htmlFor={location.name} className="text-sm">
                          <span className="font-medium">{location.name}</span>
                          {location.displayName && location.displayName !== location.name && (
                            <span className="text-muted-foreground ml-1">
                              - {location.displayName}
                            </span>
                          )}
                        </Label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Loading locations for selected table...
                    </p>
                  )}
                </div>
                {selectedLocations.length > 0 && (
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-sm text-primary">
                      {selectedLocations.length} location{selectedLocations.length > 1 ? 's' : ''} selected
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Attributes Selection */}
      {attributes.length > 0 && selectedLocations.length > 0 && (startDate || endDate) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Select Attributes to Export
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(groupedAttributes).map(([category, attrs]) => (
                <div key={category} className="space-y-2">
                  <h4 className="font-medium text-sm text-primary">{category}</h4>
                  {attrs.map((attr) => (
                    <div key={attr.name} className="flex items-center space-x-2">
                      <Checkbox
                        id={attr.name}
                        checked={selectedAttributes.includes(attr.name)}
                        onCheckedChange={() => toggleAttribute(attr.name)}
                      />
                      <Label htmlFor={attr.name} className="text-sm">
                        {attr.name}
                        {attr.isPrimary && <Badge variant="secondary" className="ml-1 text-xs">Primary</Badge>}
                      </Label>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Download Summary and Action */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Download Summary</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Database: {selectedDatabase ? databases.find(db => db.key === selectedDatabase)?.displayName : 'None selected'}</p>
                <p>Table: {selectedTable ? tables.find(t => t.name === selectedTable)?.displayName : 'None selected'}</p>
                <p>Attributes: {selectedAttributes.length} selected</p>
                <p>Locations: {selectedLocations.length > 0 ? `${selectedLocations.join(', ')} (${selectedLocations.length} selected)` : 'None selected'}</p>
                <p>Date Range: {startDate && endDate ? `${format(startDate, 'PP')} - ${format(endDate, 'PP')}` : 'All dates'}</p>
              </div>
            </div>
            <Button 
              onClick={handleDownload} 
              disabled={!selectedDatabase || !selectedTable || isLoading}
              className="min-w-[120px]"
            >
              <Download className="h-4 w-4 mr-2" />
              {isLoading ? 'Preparing...' : 'Download CSV'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Metadata Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Project Metadata & Documentation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MetadataDisplay />
        </CardContent>
      </Card>
    </div>
  );
};

export default MultiDatabaseDownload;