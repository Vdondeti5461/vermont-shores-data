import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Download, Database, Table, MapPin, Calendar as CalendarIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/apiConfig';
import { LocalDatabaseService } from '@/services/localDatabaseService';

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

interface LocationInfo {
  id: number;
  name: string;
  displayName: string;
  latitude: number;
  longitude: number;
  elevation: number;
}

interface AttributeInfo {
  name: string;
  type: string;
  category: string;
  isPrimary: boolean;
  unit: string;
  measurementType: string;
  comment: string;
}

const DynamicDataBrowser = () => {
  const { toast } = useToast();
  
  // State management
  const [loading, setLoading] = useState(false);
  const [databases, setDatabases] = useState<DatabaseInfo[]>([]);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [locations, setLocations] = useState<LocationInfo[]>([]);
  const [attributes, setAttributes] = useState<AttributeInfo[]>([]);
  
  // Selection state
  const [selectedDatabase, setSelectedDatabase] = useState<string>('');
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  
  // Filter state
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  
  // API health state
  const [apiHealth, setApiHealth] = useState<'unknown' | 'healthy' | 'unhealthy'>('unknown');
  
  // Enhanced API call wrapper with better error handling
  const apiCall = async (endpoint: string, description: string) => {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`[API Call] ${description}: ${url}`);
    
    try {
      const response = await fetch(url);
      console.log(`[API Response] ${description}: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        throw new Error(`${description} failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`[API Data] ${description}:`, data);
      return data;
    } catch (error) {
      console.error(`[API Error] ${description}:`, error);
      toast({
        title: "API Error",
        description: `${description} failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Check API health
  const checkApiHealth = async () => {
    try {
      await apiCall('/api/health', 'Health check');
      setApiHealth('healthy');
    } catch (error) {
      setApiHealth('unhealthy');
    }
  };

  // Load databases
  const loadDatabases = async () => {
    setLoading(true);
    try {
      const data = await apiCall('/api/databases', 'Load databases');
      setDatabases(data.databases || []);
      
      if (data.databases && data.databases.length > 0) {
        toast({
          title: "Databases Loaded",
          description: `Found ${data.databases.length} databases`,
        });
      }
    } catch (error) {
      setDatabases([]);
    } finally {
      setLoading(false);
    }
  };

  // Load tables for selected database
  const loadTables = async (databaseKey: string) => {
    if (!databaseKey) return;
    
    setLoading(true);
    try {
      const data = await apiCall(`/api/databases/${databaseKey}/tables`, `Load tables for ${databaseKey}`);
      setTables(data.tables || []);
      
      if (data.tables && data.tables.length > 0) {
        toast({
          title: "Tables Loaded",
          description: `Found ${data.tables.length} tables in ${databaseKey}`,
        });
      }
    } catch (error) {
      setTables([]);
    } finally {
      setLoading(false);
    }
  };

  // Load locations for selected database
  const loadLocations = async (databaseKey: string) => {
    if (!databaseKey) return;

    try {
      // Request canonical list for raw_data to ensure all 22 locations
      const endpoint = `/api/databases/${databaseKey}/locations${databaseKey === 'raw_data' ? '?canonical=1' : ''}`;
      const data = await apiCall(endpoint, `Load locations for ${databaseKey}`);
      const raw = Array.isArray(data) ? data : data.locations || [];

      // Normalize to LocationInfo objects if API returns array of strings
      const normalized: LocationInfo[] = raw.map((item: any, idx: number) =>
        typeof item === 'string'
          ? { id: idx + 1, name: item, displayName: item, latitude: 0, longitude: 0, elevation: 0 }
          : item
      );

      // Fallback to canonical 22 sites for raw_data if backend returns fewer
      if (databaseKey === 'raw_data' && normalized.length < 22) {
        const canonical = await LocalDatabaseService.getLocations('raw_data');
        const mapped = canonical.map((l, idx) => ({
          id: l.id ?? idx + 1,
          name: l.name,
          displayName: l.name,
          latitude: l.latitude ?? 0,
          longitude: l.longitude ?? 0,
          elevation: l.elevation ?? 0,
        }));
        setLocations(mapped);
      } else {
        setLocations(normalized);
      }
    } catch (error) {
      // Last-resort fallback for raw_data
      if (databaseKey === 'raw_data') {
        const canonical = await LocalDatabaseService.getLocations('raw_data');
        const mapped = canonical.map((l, idx) => ({
          id: l.id ?? idx + 1,
          name: l.name,
          displayName: l.name,
          latitude: l.latitude ?? 0,
          longitude: l.longitude ?? 0,
          elevation: l.elevation ?? 0,
        }));
        setLocations(mapped);
      } else {
        setLocations([]);
      }
    }
  };
  // Load attributes for selected table
  const loadAttributes = async (databaseKey: string, tableName: string) => {
    if (!databaseKey || !tableName) return;
    
    try {
      const data = await apiCall(`/api/databases/${databaseKey}/tables/${tableName}/attributes`, `Load attributes for ${tableName}`);
      setAttributes(data.attributes || []);
      
      // Auto-select primary attributes
      const primaryAttrs = (data.attributes || [])
        .filter((attr: AttributeInfo) => attr.isPrimary)
        .map((attr: AttributeInfo) => attr.name);
      setSelectedAttributes(primaryAttrs);
      
    } catch (error) {
      setAttributes([]);
    }
  };

  // Handle database selection
  const handleDatabaseChange = (databaseKey: string) => {
    setSelectedDatabase(databaseKey);
    setSelectedTable('');
    setTables([]);
    setLocations([]);
    setAttributes([]);
    setSelectedLocations([]);
    setSelectedAttributes([]);
    
    if (databaseKey) {
      loadTables(databaseKey);
      loadLocations(databaseKey);
    }
  };

  // Handle table selection
  const handleTableChange = (tableName: string) => {
    setSelectedTable(tableName);
    setAttributes([]);
    setSelectedAttributes([]);
    
    if (tableName && selectedDatabase) {
      loadAttributes(selectedDatabase, tableName);
    }
  };

  // Handle location selection
  const handleLocationToggle = (locationName: string) => {
    setSelectedLocations(prev => 
      prev.includes(locationName) 
        ? prev.filter(loc => loc !== locationName)
        : [...prev, locationName]
    );
  };

  // Handle attribute selection
  const handleAttributeToggle = (attributeName: string) => {
    setSelectedAttributes(prev => 
      prev.includes(attributeName) 
        ? prev.filter(attr => attr !== attributeName)
        : [...prev, attributeName]
    );
  };

  // Time preset functions
  const setTimePreset = (preset: string) => {
    const now = new Date();
    let start: Date | undefined = undefined;
    let end: Date | undefined = undefined;

    switch (preset) {
      case 'last_7_days':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        end = now;
        break;
      case 'last_30_days':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        end = now;
        break;
      case 'last_month':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'this_month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = now;
        break;
      case 'last_year':
        start = new Date(now.getFullYear() - 1, 0, 1);
        end = new Date(now.getFullYear() - 1, 11, 31);
        break;
      case 'this_year':
        start = new Date(now.getFullYear(), 0, 1);
        end = now;
        break;
      case 'all_time':
        start = undefined;
        end = undefined;
        break;
    }

    setStartDate(start);
    setEndDate(end);
  };

  // Download data
  const handleDownload = async () => {
    if (!selectedDatabase || !selectedTable) {
      toast({
        title: "Selection Required",
        description: "Please select a database and table",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      
      // Handle multiple locations correctly
      if (selectedLocations.length > 0) {
        console.log('[Selected Locations]', selectedLocations);
        params.append('location', selectedLocations.join(','));
      }
      
      // Format dates with full timestamp range for better filtering
      if (startDate) {
        params.append('start_date', format(startDate, 'yyyy-MM-dd 00:00:00'));
      }
      if (endDate) {
        params.append('end_date', format(endDate, 'yyyy-MM-dd 23:59:59'));
      }
      
      if (selectedAttributes.length > 0) {
        params.append('attributes', selectedAttributes.join(','));
      }

      const downloadUrl = `${API_BASE_URL}/api/databases/${selectedDatabase}/download/${selectedTable}?${params.toString()}`;
      console.log('[Download URL]', downloadUrl);
      console.log('[Download Params]', {
        database: selectedDatabase,
        table: selectedTable,
        locations: selectedLocations,
        startDate: startDate ? format(startDate, 'yyyy-MM-dd 00:00:00') : null,
        endDate: endDate ? format(endDate, 'yyyy-MM-dd 23:59:59') : null,
        attributes: selectedAttributes
      });
      
      const response = await fetch(downloadUrl);
      
      // If backend returns 404 for multi-location, fall back to per-location aggregation
      let blob: Blob;
      if (!response.ok) {
        const status = response.status;
        const errorText = await response.text();
        console.error('[Download Error Response]', errorText);

        if (status === 404 && selectedLocations.length > 1) {
          console.warn('[Fallback] Aggregating CSV by fetching each location separately');

          // Helper to aggregate CSVs without heavy parsing (assumes same header)
          const aggregatePerLocation = async (): Promise<Blob> => {
            let header = '';
            const rows: string[] = [];
            let success = 0;

            for (const loc of selectedLocations) {
              const p = new URLSearchParams(params.toString());
              p.set('location', loc);
              const url = `${API_BASE_URL}/api/databases/${selectedDatabase}/download/${selectedTable}?${p.toString()}`;
              const res = await fetch(url);
              if (!res.ok) {
                console.warn(`[Fallback] Skipping location ${loc} due to status ${res.status}`);
                continue;
              }
              const text = await res.text();
              const lines = text.split(/\r?\n/);
              if (lines.length === 0) continue;
              if (!header && lines[0]) header = lines[0];
              const body = lines.slice(1).filter((l) => l.trim().length > 0);
              if (body.length > 0) {
                rows.push(...body);
                success++;
              }
            }

            if (!header || rows.length === 0 || success === 0) {
              throw new Error('No data found for the selected locations and date range');
            }
            const combined = [header, ...rows].join('\n');
            return new Blob([combined], { type: 'text/csv;charset=utf-8;' });
          };

          blob = await aggregatePerLocation();
        } else {
          throw new Error(`Download failed: ${status} ${response.statusText}`);
        }
      } else {
        // Normal success: read text so we can detect potential row caps and optionally chunk by month
        const initialText = await response.text();
        const initialLines = initialText.split(/\r?\n/);
        let header = initialLines[0] ?? '';
        const initialBody = initialLines.slice(1).filter((l) => l.trim().length > 0);

        const needsChunking = initialBody.length >= 1000 && startDate && endDate;
        if (needsChunking) {
          console.warn('[Chunking] ~1000 rows detected. Fetching monthly chunks per location.');

          const chunkRanges: { start: Date; end: Date }[] = [];
          if (startDate && endDate) {
            let cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
            while (cursor <= endDate) {
              const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
              const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
              const rangeStart = new Date(Math.max(monthStart.getTime(), startDate.getTime()));
              const rangeEnd = new Date(Math.min(monthEnd.getTime(), endDate.getTime()))
              chunkRanges.push({ start: rangeStart, end: rangeEnd });
              cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
            }
          }

          const rows: string[] = [];
          let success = 0;
          const locs = selectedLocations.length > 0 ? selectedLocations : [undefined];

          for (const loc of locs) {
            for (const chunk of chunkRanges) {
              const p = new URLSearchParams(params.toString());
              if (loc) p.set('location', loc);
              p.set('start_date', format(chunk.start, 'yyyy-MM-dd 00:00:00'));
              p.set('end_date', format(chunk.end, 'yyyy-MM-dd 23:59:59'));
              const url = `${API_BASE_URL}/api/databases/${selectedDatabase}/download/${selectedTable}?${p.toString()}`;
              const res = await fetch(url);
              if (!res.ok) {
                console.warn(`[Chunking] Skipping chunk ${format(chunk.start, 'yyyy-MM-dd')} to ${format(chunk.end, 'yyyy-MM-dd')} for ${loc ?? 'all locations'} - status ${res.status}`);
                continue;
              }
              const text = await res.text();
              const lines = text.split(/\r?\n/);
              if (!header && lines[0]) header = lines[0];
              const body = lines.slice(1).filter((l) => l.trim().length > 0);
              if (body.length > 0) {
                rows.push(...body);
                success++;
              }
            }
          }

          if (!header || rows.length === 0 || success === 0) {
            throw new Error('No data found for the selected criteria');
          }
          const combined = [header, ...rows].join('\n');
          blob = new Blob([combined], { type: 'text/csv;charset=utf-8;' });
        } else {
          blob = new Blob([initialText], { type: 'text/csv;charset=utf-8;' });
        }
      }
      console.log('[Downloaded Blob Size]', blob.size, 'bytes');
      
      if (blob.size === 0) {
        throw new Error('No data found for the selected criteria');
      }
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with better location handling
      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
      const locationStr = selectedLocations.length > 0 
        ? `_${selectedLocations.length > 3 ? selectedLocations.length + '-locations' : selectedLocations.join('-')}` 
        : '_all-locations';
      const dateStr = startDate && endDate 
        ? `_${format(startDate, 'yyyy-MM-dd')}_to_${format(endDate, 'yyyy-MM-dd')}` 
        : '';
      link.download = `${selectedDatabase}_${selectedTable}${locationStr}${dateStr}_${timestamp}.csv`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Download Started',
        description: `Downloaded ${selectedTable} data with original timestamps preserved`,
      });
      
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Initialize on component mount
  useEffect(() => {
    checkApiHealth();
    loadDatabases();
  }, []);

  // Group attributes by category
  const attributesByCategory = attributes.reduce((acc, attr) => {
    const category = attr.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(attr);
    return acc;
  }, {} as Record<string, AttributeInfo[]>);

  return (
    <div className="space-y-6">
      {/* API Health Status */}
      <Alert className={apiHealth === 'healthy' ? 'border-green-200 bg-green-50' : apiHealth === 'unhealthy' ? 'border-red-200 bg-red-50' : ''}>
        <div className="flex items-center gap-2">
          {apiHealth === 'healthy' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
          {apiHealth === 'unhealthy' && <AlertCircle className="h-4 w-4 text-red-600" />}
          {apiHealth === 'unknown' && <Loader2 className="h-4 w-4 animate-spin" />}
          <AlertDescription>
            API Status: {apiHealth === 'healthy' ? 'Connected' : apiHealth === 'unhealthy' ? 'Connection Failed' : 'Checking...'}
            {apiHealth === 'unhealthy' && ' - Please ensure the production server is running'}
          </AlertDescription>
        </div>
      </Alert>

      <Tabs defaultValue="select" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="select">Data Selection</TabsTrigger>
          <TabsTrigger value="filters">Filters & Attributes</TabsTrigger>
          <TabsTrigger value="download">Download</TabsTrigger>
        </TabsList>

        <TabsContent value="select" className="space-y-6">
          {/* Database Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Selection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedDatabase} onValueChange={handleDatabaseChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a database..." />
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

              {databases.length === 0 && !loading && (
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No databases found. Please check your API connection.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Table Selection */}
          {selectedDatabase && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Table className="h-5 w-5" />
                  Table Selection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedTable} onValueChange={handleTableChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a table..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tables.map((table) => (
                      <SelectItem key={table.name} value={table.name}>
                        <div>
                          <div className="font-medium">{table.displayName || table.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {table.description} • {table.rowCount?.toLocaleString()} rows
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Show available attributes immediately after table selection */}
                {selectedTable && attributes.length > 0 && (
                  <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      Available Attributes
                      <Badge variant="secondary">{attributes.length} total</Badge>
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                      {attributes.slice(0, 12).map((attr) => (
                        <div key={attr.name} className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-primary/60"></div>
                          <span className="truncate">{attr.name}</span>
                        </div>
                      ))}
                      {attributes.length > 12 && (
                        <div className="text-muted-foreground italic">
                          +{attributes.length - 12} more...
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Go to "Filters & Attributes" tab to select specific attributes for download
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="filters" className="space-y-6">
          {/* Location Selection */}
          {selectedDatabase && locations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location Selection
                  <Badge variant="secondary">{selectedLocations.length} selected</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-60 overflow-y-auto">
                  {locations.map((location) => (
                    <div key={location.name} className="flex items-center space-x-2">
                      <Checkbox
                        id={location.name}
                        checked={selectedLocations.includes(location.name)}
                        onCheckedChange={() => handleLocationToggle(location.name)}
                      />
                      <Label htmlFor={location.name} className="text-sm font-medium cursor-pointer">
                        {location.name}
                      </Label>
                    </div>
                  ))}
                </div>
                {locations.length > 8 && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Showing {locations.length} locations. Scroll to see all.
                  </p>
                )}
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedLocations(locations.map(l => l.name))}
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
              </CardContent>
            </Card>
          )}

          {/* Date Range Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Date Range Selection
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Select date range or use quick presets. Timestamps will be preserved in original format.
              </p>
            </CardHeader>
            <CardContent>
              {/* Time Presets */}
              <div className="mb-4">
                <Label className="text-sm font-medium">Quick Presets</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTimePreset('last_7_days')}
                    className="text-xs"
                  >
                    Last 7 Days
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTimePreset('last_30_days')}
                    className="text-xs"
                  >
                    Last 30 Days
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTimePreset('last_month')}
                    className="text-xs"
                  >
                    Last Month
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTimePreset('this_month')}
                    className="text-xs"
                  >
                    This Month
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTimePreset('last_year')}
                    className="text-xs"
                  >
                    Last Year
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTimePreset('this_year')}
                    className="text-xs"
                  >
                    This Year
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTimePreset('all_time')}
                    className="text-xs"
                  >
                    All Time
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setStartDate(undefined);
                      setEndDate(undefined);
                    }}
                    className="text-xs"
                  >
                    Clear
                  </Button>
                </div>
              </div>

              {/* Custom Date Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Start Date (Custom)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Select start date"}
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
                <div>
                  <Label>End Date (Custom)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "Select end date"}
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

              {/* Current Selection Display */}
              {(startDate || endDate) && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm">
                    <strong>Selected Range:</strong>{' '}
                    {startDate ? format(startDate, 'MMM d, yyyy') : 'Beginning'} -{' '}
                    {endDate ? format(endDate, 'MMM d, yyyy') : 'Now'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attribute Selection */}
          {selectedTable && attributes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Attribute Selection
                  <Badge variant="secondary" className="ml-2">{selectedAttributes.length} selected</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {Object.entries(attributesByCategory).map(([category, attrs]) => (
                    <div key={category}>
                      <h4 className="font-medium mb-2 text-sm text-muted-foreground uppercase tracking-wide">
                        {category}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                        {attrs.map((attr) => (
                          <div key={attr.name} className="flex items-center space-x-2 p-2 rounded border">
                            <Checkbox
                              id={attr.name}
                              checked={selectedAttributes.includes(attr.name)}
                              onCheckedChange={() => handleAttributeToggle(attr.name)}
                            />
                            <div className="flex-1 min-w-0">
                              <Label htmlFor={attr.name} className="text-sm font-medium cursor-pointer">
                                {attr.name}
                                {attr.isPrimary && <Badge variant="outline" className="ml-2 text-xs">Primary</Badge>}
                              </Label>
                              {attr.comment && (
                                <p className="text-xs text-muted-foreground truncate">{attr.comment}</p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                {attr.unit} • {attr.measurementType}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
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
                      const primaryAttrs = attributes.filter(attr => attr.isPrimary).map(attr => attr.name);
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
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="download" className="space-y-6">
          {/* Download Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Download Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Database:</strong> {selectedDatabase || 'Not selected'}
                  </div>
                  <div>
                    <strong>Table:</strong> {selectedTable || 'Not selected'}
                  </div>
                  <div>
                    <strong>Locations:</strong> {selectedLocations.length > 0 ? `${selectedLocations.length} selected` : 'All locations'}
                  </div>
                  <div>
                    <strong>Attributes:</strong> {selectedAttributes.length > 0 ? `${selectedAttributes.length} selected` : 'All attributes'}
                  </div>
                  <div>
                    <strong>Date Range:</strong> {startDate && endDate ? `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}` : 'All dates'}
                  </div>
                </div>

                <Button
                  onClick={handleDownload}
                  disabled={!selectedDatabase || !selectedTable || loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Preparing Download...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download CSV
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {loading && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading...</span>
        </div>
      )}
    </div>
  );
};

export default DynamicDataBrowser;