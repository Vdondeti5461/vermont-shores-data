import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useLocalHealthCheck } from '@/hooks/useLocalDatabase';
import { LocalDatabaseService, DatabaseInfo } from '@/services/localDatabaseService';
import DatabaseSelector from './DatabaseSelector';
import TableSelector from './TableSelector';
import LocationSelector from './LocationSelector';
import AttributeSelector from './AttributeSelector';
import DateRangeSelector from './DateRangeSelector';
import { Download, RefreshCw, AlertCircle, CheckCircle, Database } from 'lucide-react';

const DownloadInterface = () => {
  const { toast } = useToast();
  const { data: isHealthy } = useLocalHealthCheck();
  
  // State management
  const [selectedDatabase, setSelectedDatabase] = useState<string>('');
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [timePreset, setTimePreset] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Data states
  const [databases, setDatabases] = useState<DatabaseInfo[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [tableMetadata, setTableMetadata] = useState<any>(null);
  
  // Loading states
  const [isDatabasesLoading, setIsDatabasesLoading] = useState(true);
  const [isTablesLoading, setIsTablesLoading] = useState(false);
  const [isLocationsLoading, setIsLocationsLoading] = useState(false);
  const [isAttributesLoading, setIsAttributesLoading] = useState(false);
  // Load databases on component mount
  useEffect(() => {
    loadDatabasesInfo();
  }, []);
  
  // Load tables and locations when database changes
  useEffect(() => {
    if (selectedDatabase) {
      loadTables();
      loadLocations();
    }
  }, [selectedDatabase]);
  
  // Load table metadata when table changes
  useEffect(() => {
    if (selectedTable && selectedDatabase) {
      loadTableMetadata();
    }
  }, [selectedTable, selectedDatabase]);

  const loadDatabasesInfo = async () => {
    setIsDatabasesLoading(true);
    try {
      const info = await LocalDatabaseService.getDatabasesInfo();
      setDatabases(info.databases);
      if (info.databases.length > 0) {
        setSelectedDatabase(info.databases[0].id); // Auto-select first database
      }
    } catch (error) {
      console.error('Error loading databases info:', error);
      toast({
        title: "Error Loading Databases",
        description: "Failed to load available databases",
        variant: "destructive"
      });
    } finally {
      setIsDatabasesLoading(false);
    }
  };

  const loadTables = async () => {
    setIsTablesLoading(true);
    try {
      const tablesData = await LocalDatabaseService.getTables(selectedDatabase);
      setTables(tablesData); // tablesData is already the array of tables
    } catch (error) {
      console.error('Error loading tables:', error);
      toast({
        title: "Error Loading Tables",
        description: `Failed to load tables for ${selectedDatabase}`,
        variant: "destructive"
      });
    } finally {
      setIsTablesLoading(false);
    }
  };

  const loadLocations = async () => {
    setIsLocationsLoading(true);
    try {
      const locs = await LocalDatabaseService.getLocations(selectedDatabase);
      setLocations(locs);
    } catch (error) {
      console.error('Error loading locations:', error);
      toast({
        title: "Error Loading Locations",
        description: `Failed to load locations for ${selectedDatabase}`,
        variant: "destructive"
      });
    } finally {
      setIsLocationsLoading(false);
    }
  };

  const loadTableMetadata = async () => {
    setIsAttributesLoading(true);
    try {
      const metadata = await LocalDatabaseService.getTableMetadata(selectedTable, selectedDatabase);
      setTableMetadata(metadata);
      // Auto-select timestamp and location attributes
      if (metadata?.columns) {
        const defaultAttrs = metadata.columns
          .filter((col: any) => col.isPrimary || ['TIMESTAMP', 'Location'].includes(col.name))
          .map((col: any) => col.name);
        setSelectedAttributes(defaultAttrs);
      }
    } catch (error) {
      console.error('Error loading table metadata:', error);
      toast({
        title: "Error Loading Attributes",
        description: `Failed to load attributes for ${selectedTable}`,
        variant: "destructive"
      });
    } finally {
      setIsAttributesLoading(false);
    }
  };

  // Tables are loaded dynamically from the selected database

  // Time presets (enhanced with season support)
  const timePresets = [
    { value: 'season', label: 'Use Season Filter' },
    { value: 'last_24h', label: 'Last 24 Hours' },
    { value: 'last_week', label: 'Last Week' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'last_3months', label: 'Last 3 Months' },
    { value: 'last_year', label: 'Last Year' },
    { value: 'current_year', label: 'Current Year (2024)' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const handleLocationToggle = (locationName: string) => {
    setSelectedLocations(prev => 
      prev.includes(locationName) 
        ? prev.filter(name => name !== locationName)
        : [...prev, locationName]
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
    if (!locations || locations.length === 0) return;
    if (selectedLocations.length === locations.length) {
      setSelectedLocations([]);
    } else {
      setSelectedLocations(locations.map(loc => loc.name));
    }
  };

  const handleSelectAllAttributes = () => {
    if (!tableMetadata?.columns) return;
    
    const availableAttributes = tableMetadata.columns.map(col => col.name);
    if (selectedAttributes.length === availableAttributes.length) {
      setSelectedAttributes([]);
    } else {
      setSelectedAttributes(availableAttributes);
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
      case '':
        // Allow manual date selection
        break;
    }
  };

  const handleTableChange = (tableName: string) => {
    setSelectedTable(tableName);
    setSelectedAttributes([]); // Reset attributes when table changes
  };

  const handleDatabaseChange = (databaseId: string) => {
    setSelectedDatabase(databaseId);
    setSelectedTable(''); // Reset table selection
    setSelectedAttributes([]);
    setSelectedLocations([]);
  };

  const handleDownload = async () => {
    // Validation
    if (!selectedDatabase || !selectedTable || selectedLocations.length === 0) {
      toast({
        title: "Selection Required",
        description: "Please select a database, table, and at least one location before downloading.",
        variant: "destructive"
      });
      return;
    }

    if (startDate && endDate && startDate > endDate) {
      toast({
        title: "Invalid Date Range",
        description: "Start date must be before end date.",
        variant: "destructive"
      });
      return;
    }

    setIsDownloading(true);

    try {
      // Download for each selected location
      for (const location of selectedLocations) {
        const startDateStr = startDate?.toISOString();
        const endDateStr = endDate?.toISOString();
        const columns = selectedAttributes.length > 0 ? selectedAttributes : undefined;

        await LocalDatabaseService.downloadTableData(
          selectedTable,
          selectedDatabase,
          location,
          startDateStr,
          endDateStr,
          undefined, // season
          columns
        );
      }

      const selectedDb = databases.find(db => db.id === selectedDatabase);
      
      toast({
        title: "Download Complete",
        description: `Successfully downloaded ${selectedTable} data from ${selectedDb?.name} for ${selectedLocations.length} location(s).`
      });

    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "There was an error processing your download request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Status Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-background to-secondary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Environmental Data Download</CardTitle>
                <p className="text-muted-foreground text-sm">
                  Interactive interface for accessing multi-database environmental datasets
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {isHealthy ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <Badge variant={isHealthy ? "default" : "destructive"} className="text-xs">
                  {isHealthy ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">
                  {databases.find(db => db.id === selectedDatabase)?.name || 'No Database Selected'}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Selection Interface */}
      <div className="grid xl:grid-cols-5 lg:grid-cols-3 md:grid-cols-2 gap-6">
        {/* Database Selection */}
        <DatabaseSelector
          databases={databases}
          selectedDatabase={selectedDatabase}
          onDatabaseChange={handleDatabaseChange}
          isLoading={isDatabasesLoading}
        />

        {/* Table Selection */}
        <TableSelector
          tables={tables}
          selectedTable={selectedTable}
          onTableChange={handleTableChange}
          isLoading={isTablesLoading}
          databaseName={databases.find(db => db.id === selectedDatabase)?.name}
        />

        {/* Location Selection */}
        <LocationSelector
          locations={locations}
          selectedLocations={selectedLocations}
          onLocationToggle={handleLocationToggle}
          onSelectAll={handleSelectAllLocations}
          isLoading={isLocationsLoading}
        />

        {/* Attribute Selection */}
        <AttributeSelector
          attributes={tableMetadata?.columns || []}
          selectedAttributes={selectedAttributes}
          onAttributeToggle={handleAttributeToggle}
          onSelectAll={handleSelectAllAttributes}
          isLoading={isAttributesLoading}
          tableName={selectedTable}
        />

        {/* Date Range & Download */}
        <DateRangeSelector
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          timePreset={timePreset}
          onTimePresetChange={handleTimePresetChange}
          onDownload={handleDownload}
          isDownloading={isDownloading}
          downloadSummary={{
            database: databases.find(db => db.id === selectedDatabase)?.name,
            table: selectedTable,
            locations: selectedLocations.length,
            attributes: selectedAttributes.length,
          }}
        />
      </div>

      {/* Download Summary */}
      {selectedDatabase && selectedTable && (
        <Card className="border-secondary/20 bg-secondary/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Download className="h-5 w-5" />
              Download Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div className="text-center p-3 rounded-lg bg-background/50">
                <div className="font-semibold text-primary">
                  {databases.find(db => db.id === selectedDatabase)?.name}
                </div>
                <div className="text-muted-foreground">Database</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-background/50">
                <div className="font-semibold text-primary">{selectedTable}</div>
                <div className="text-muted-foreground">Table</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-background/50">
                <div className="font-semibold text-primary">{selectedLocations.length}</div>
                <div className="text-muted-foreground">Locations</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-background/50">
                <div className="font-semibold text-primary">{selectedAttributes.length}</div>
                <div className="text-muted-foreground">Attributes</div>
              </div>
            </div>
            
            {startDate && endDate && (
              <div className="mt-4 p-3 rounded-lg bg-background/50 text-center">
                <div className="font-semibold text-primary">
                  {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                </div>
                <div className="text-muted-foreground text-sm">Date Range</div>
              </div>
            )}

            <div className="flex justify-center mt-6">
              <Button
                onClick={handleDownload}
                disabled={!selectedDatabase || !selectedTable || selectedLocations.length === 0 || isDownloading}
                size="lg"
                className="min-w-48"
              >
                {isDownloading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Preparing Download...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download CSV Data
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

export default DownloadInterface;