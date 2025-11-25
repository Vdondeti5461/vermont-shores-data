import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Download, Database, Table, MapPin, Calendar as CalendarIcon, AlertCircle, CheckCircle2, Info, Filter } from 'lucide-react';
import InteractiveMetadata from '@/components/InteractiveMetadata';
import { EnhancedMetadataDisplay } from '@/components/EnhancedMetadataDisplay';
import { MultiSelect, MultiSelectOption } from '@/components/ui/multi-select';
import { DateRangePicker } from '@/components/ui/date-picker-with-range';
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
      // Handle both array response and object with databases array
      const dbList = Array.isArray(data) ? data : (data.databases || []);
      setDatabases(dbList);
      
      // Auto-select if only one database (seasonal_qaqc_data)
      if (dbList.length === 1) {
        const db = dbList[0];
        setSelectedDatabase(db.key);
        loadTables(db.key);
        loadLocations(db.key);
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
      
      // Handle both array of location objects and array of strings
      let normalized: LocationInfo[] = [];
      
      if (Array.isArray(data)) {
        normalized = data.map((item: any, idx: number) => {
          if (typeof item === 'string') {
            return { 
              id: idx + 1, 
              name: item, 
              displayName: item, 
              latitude: 0, 
              longitude: 0, 
              elevation: 0 
            };
          } else if (item.code) {
            // New format with code, name, displayName
            return {
              id: idx + 1,
              name: item.code,
              displayName: item.displayName || item.name,
              latitude: item.latitude || 0,
              longitude: item.longitude || 0,
              elevation: item.elevation || 0
            };
          } else {
            // Existing format
            return {
              id: item.id ?? idx + 1,
              name: item.name,
              displayName: item.displayName || item.name,
              latitude: item.latitude ?? 0,
              longitude: item.longitude ?? 0,
              elevation: item.elevation ?? 0
            };
          }
        });
      } else if (data.locations) {
        normalized = data.locations.map((item: any, idx: number) => ({
          id: item.id ?? idx + 1,
          name: item.name,
          displayName: item.displayName || item.name,
          latitude: item.latitude ?? 0,
          longitude: item.longitude ?? 0,
          elevation: item.elevation ?? 0
        }));
      }

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
      // Build base query parameters (without location so we can override per call)
      const baseParams = new URLSearchParams();

      if (startDate) baseParams.append('start_date', format(startDate, 'yyyy-MM-dd 00:00:00'));
      if (endDate) baseParams.append('end_date', format(endDate, 'yyyy-MM-dd 23:59:59'));
      if (selectedAttributes.length > 0) baseParams.append('attributes', selectedAttributes.join(','));

      // Helper: safe CSV split/join for a single line (minimal but robust for quotes)
      const splitCsvLine = (line: string): string[] => {
        const out: string[] = [];
        let cur = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const ch = line[i];
          if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
            else { inQuotes = !inQuotes; }
          } else if (ch === ',' && !inQuotes) {
            out.push(cur); cur = '';
          } else {
            cur += ch;
          }
        }
        out.push(cur);
        return out;
      };
      const joinCsvLine = (cols: string[]): string =>
        cols.map((v) => (v.includes(',') || v.includes('"') ? '"' + v.replace(/"/g, '""') + '"' : v)).join(',');

      // Helper: normalize TIMESTAMP column to "YYYY-MM-DD HH:mm:ss" and filter to selected attributes
      const normalizeAndFilter = (csv: string): string => {
        const lines = csv.split(/\r?\n/);
        if (lines.length === 0) return csv;
        const header = lines[0];
        const rows = lines.slice(1);
        const headerCols = splitCsvLine(header).map((h) => h.replace(/^"|"$/g, ''));
        
        // Filter columns to only selected attributes (if any selected)
        let colIndices: number[] = [];
        if (selectedAttributes.length > 0) {
          colIndices = selectedAttributes.map(attr => headerCols.findIndex(h => h.trim().toLowerCase() === attr.trim().toLowerCase())).filter(idx => idx !== -1);
        } else {
          colIndices = headerCols.map((_, idx) => idx);
        }
        
        // Filter header
        const filteredHeader = joinCsvLine(colIndices.map(idx => headerCols[idx]));
        
        // Find timestamp index in filtered columns
        const filteredHeaderCols = colIndices.map(idx => headerCols[idx]);
        const tsIdx = filteredHeaderCols.findIndex((h) => h.trim().toUpperCase() === 'TIMESTAMP');
        
        const outRows: string[] = [];
        for (const r of rows) {
          const trimmed = r.trim();
          if (!trimmed) continue;
          const cols = splitCsvLine(r);
          
          // Filter columns first - preserve NULL values
          const filteredCols = colIndices.map(idx => cols[idx] !== undefined ? cols[idx] : '');
          
          // Normalize timestamp if exists
          if (tsIdx !== -1 && filteredCols[tsIdx] !== undefined) {
            const raw = filteredCols[tsIdx].replace(/^"|"$/g, '');
            const isoLike = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:\.\d+Z)?$/;
            const dbLike = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
            let out = raw;
            if (!dbLike.test(raw)) {
              const d = new Date(raw);
              if (!isNaN(d.getTime())) {
                out = format(d, 'yyyy-MM-dd HH:mm:ss');
              } else if (isoLike.test(raw)) {
                const d2 = new Date(raw);
                if (!isNaN(d2.getTime())) out = format(d2, 'yyyy-MM-dd HH:mm:ss');
              }
            }
            filteredCols[tsIdx] = out;
          }
          outRows.push(joinCsvLine(filteredCols));
        }
        return [filteredHeader, ...outRows].join('\n');
      };

      // Recursive fetch that splits time ranges until server cap (~1000 rows) is avoided
      const fetchRange = async (
        p: URLSearchParams,
        loc: string | undefined,
        rangeStart?: Date,
        rangeEnd?: Date
      ): Promise<{ header: string; rows: string[] }> => {
        const q = new URLSearchParams(p.toString());
        if (loc) q.set('location', loc);
        if (rangeStart) q.set('start_date', format(rangeStart, 'yyyy-MM-dd HH:mm:ss'));
        if (rangeEnd) q.set('end_date', format(rangeEnd, 'yyyy-MM-dd HH:mm:ss'));

        const url = `${API_BASE_URL}/api/databases/${selectedDatabase}/download/${selectedTable}?${q.toString()}`;
        const res = await fetch(url);
        if (!res.ok) {
          console.warn('[FetchRange] Non-OK response', res.status, res.statusText, 'for', loc, rangeStart, rangeEnd);
          return { header: '', rows: [] };
        }
        const text = await res.text();
        const lines = text.split(/\r?\n/);
        const header = lines[0] ?? '';
        const body = lines.slice(1).filter((l) => l.trim().length > 0);

        // If we hit the cap, split the interval and fetch recursively
        const canSplit = !!(rangeStart && rangeEnd && rangeEnd.getTime() > rangeStart.getTime());
        if (canSplit && body.length >= 1000) {
          const startMs = rangeStart!.getTime();
          const endMs = rangeEnd!.getTime();
          const mid = new Date(Math.floor((startMs + endMs) / 2));
          if (endMs - startMs < 60 * 60 * 1000) {
            // If interval <= 1 hour and still capped, still split to force smaller windows
            const left = await fetchRange(p, loc, rangeStart, mid);
            const right = await fetchRange(p, loc, new Date(mid.getTime() + 1000), rangeEnd);
            return { header: left.header || header, rows: [...left.rows, ...right.rows] };
          }
          const left = await fetchRange(p, loc, rangeStart, mid);
          const right = await fetchRange(p, loc, new Date(mid.getTime() + 1000), rangeEnd);
          return { header: left.header || header, rows: [...left.rows, ...right.rows] };
        }

        return { header, rows: body };
      };

      // Strategy: Always aggregate per-location to avoid multi-location 404s and caps
      const targets = selectedLocations.length > 0 ? selectedLocations : [undefined];
      let finalHeader = '';
      const allRows: string[] = [];

      for (const loc of targets) {
        const { header, rows } = await fetchRange(baseParams, loc, startDate, endDate);
        if (!finalHeader && header) finalHeader = header;
        if (rows.length > 0) allRows.push(...rows);
      }

      if (!finalHeader || allRows.length === 0) {
        throw new Error('No data found for the selected criteria');
      }

      // Generate metadata header
      const downloadTimestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
      const locationsList = selectedLocations.length > 0 
        ? selectedLocations.join(', ') 
        : 'All locations';
      const dateRangeStr = startDate && endDate
        ? `${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}`
        : 'All dates';
      const attributesList = selectedAttributes.length > 0
        ? selectedAttributes.join(', ')
        : 'All attributes';
      
      // Get location details with coordinates and elevation
      const locationDetails = selectedLocations.length > 0
        ? selectedLocations.map(locName => {
            const loc = locations.find(l => l.name === locName);
            return loc 
              ? `${loc.displayName} (Lat: ${loc.latitude}, Lon: ${loc.longitude}, Elev: ${loc.elevation}m)`
              : locName;
          }).join('; ')
        : 'All locations';
      
      const metadata = [
        `# Summit to Shore Environmental Data Export`,
        `# Database: ${selectedDatabase}`,
        `# Table: ${selectedTable}`,
        `# Download Date: ${downloadTimestamp}`,
        `# Date Range: ${dateRangeStr}`,
        `# Locations: ${locationDetails}`,
        `# Selected Attributes: ${attributesList}`,
        `# Total Rows: ${allRows.length}`,
        `#`,
      ].join('\n');

      // Combine, normalize timestamps, and filter to selected attributes
      const combinedCsv = [finalHeader, ...allRows].join('\n');
      const processedCsv = normalizeAndFilter(combinedCsv);
      
      // Prepend metadata to CSV
      const csvWithMetadata = metadata + '\n' + processedCsv;
      const blob = new Blob([csvWithMetadata], { type: 'text/csv;charset=utf-8;' });

      console.log('[Downloaded Blob Size]', blob.size, 'bytes');
      if (blob.size === 0) throw new Error('No data found for the selected criteria');

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

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

      <Tabs defaultValue="select" className="w-full">
        <TabsList className="grid w-full grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-1 h-auto p-1">
          <TabsTrigger value="select" className="text-xs xs:text-sm p-2 xs:p-3">
            <Database className="h-3 w-3 xs:h-4 xs:w-4 mr-1 xs:mr-2" />
            <span className="xs:inline">Data Selection</span>
          </TabsTrigger>
          <TabsTrigger value="filters" className="text-xs xs:text-sm p-2 xs:p-3">
            <MapPin className="h-3 w-3 xs:h-4 xs:w-4 mr-1 xs:mr-2" />
            <span className="xs:inline">Filters</span>
          </TabsTrigger>
          <TabsTrigger value="metadata" className="text-xs xs:text-sm p-2 xs:p-3">
            <Info className="h-3 w-3 xs:h-4 xs:w-4 mr-1 xs:mr-2" />
            <span className="xs:inline">Metadata</span>
          </TabsTrigger>
          <TabsTrigger value="download" className="text-xs xs:text-sm p-2 xs:p-3">
            <Download className="h-3 w-3 xs:h-4 xs:w-4 mr-1 xs:mr-2" />
            <span className="xs:inline">Download</span>
          </TabsTrigger>
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
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle>Location Selection</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Choose monitoring stations from the network
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <MultiSelect
                  options={locations.map(loc => ({
                    value: loc.name,
                    label: loc.displayName || loc.name,
                    description: `${loc.elevation}m elevation`
                  }))}
                  selected={selectedLocations}
                  onChange={setSelectedLocations}
                  placeholder="Select locations..."
                  searchPlaceholder="Search locations..."
                  emptyText="No locations found"
                  maxDisplay={3}
                />
                
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
          )}

          {/* Date Range Selection */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Date Range Selection</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Filter data by time period with easy year/month navigation
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Last 7 Days', value: 'last_7_days' },
                  { label: 'Last 30 Days', value: 'last_30_days' },
                  { label: 'Last Month', value: 'last_month' },
                  { label: 'This Month', value: 'this_month' },
                  { label: 'Last Year', value: 'last_year' },
                  { label: 'This Year', value: 'this_year' },
                  { label: 'All Time', value: 'all_time' },
                ].map(preset => (
                  <Button
                    key={preset.value}
                    variant="outline"
                    size="sm"
                    onClick={() => setTimePreset(preset.value)}
                    className="text-xs"
                  >
                    {preset.label}
                  </Button>
                ))}
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
              
              <Separator />
              
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                minYear={2015}
                maxYear={new Date().getFullYear() + 1}
              />
              
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
          {selectedTable && attributes.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Filter className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Attribute Selection</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Choose which measurements to include
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <MultiSelect
                  options={attributes.map(attr => ({
                    value: attr.name,
                    label: attr.name,
                    description: `${attr.unit} • ${attr.category}${attr.isPrimary ? ' • Primary' : ''}`
                  }))}
                  selected={selectedAttributes}
                  onChange={setSelectedAttributes}
                  placeholder="Select attributes..."
                  searchPlaceholder="Search attributes..."
                  emptyText="No attributes found"
                  maxDisplay={3}
                />
                
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
          )}
        </TabsContent>

        <TabsContent value="metadata" className="space-y-6">
          <EnhancedMetadataDisplay
            database={databases.find(db => db.key === selectedDatabase)}
            table={tables.find(t => t.name === selectedTable)}
            locations={locations}
            attributes={attributes}
          />
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