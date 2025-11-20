import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataDownloadService, DatabaseInfo, TableInfo, LocationInfo, AttributeInfo, DownloadFilters } from '@/services/dataDownloadService';
import { useToast } from './use-toast';

// Hook for managing databases
export const useDatabases = () => {
  return useQuery({
    queryKey: ['databases'],
    queryFn: DataDownloadService.getDatabases,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for managing tables for a specific database
export const useTables = (databaseId: string | undefined) => {
  return useQuery({
    queryKey: ['tables', databaseId],
    queryFn: () => DataDownloadService.getTables(databaseId!),
    enabled: !!databaseId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook for managing locations for a specific database
export const useLocations = (databaseId: string | undefined) => {
  return useQuery({
    queryKey: ['locations', databaseId],
    queryFn: () => DataDownloadService.getLocations(databaseId!),
    enabled: !!databaseId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook for managing table attributes
export const useTableAttributes = (databaseId: string | undefined, tableName: string | undefined) => {
  return useQuery({
    queryKey: ['attributes', databaseId, tableName],
    queryFn: () => DataDownloadService.getTableAttributes(databaseId!, tableName!),
    enabled: !!(databaseId && tableName),
    staleTime: 10 * 60 * 1000, // 10 minutes - attributes change rarely
    gcTime: 15 * 60 * 1000,
  });
};

// Hook for health check
export const useHealthCheck = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: DataDownloadService.checkHealth,
    refetchInterval: 30 * 1000, // Check every 30 seconds
    staleTime: 15 * 1000, // Consider stale after 15 seconds
    gcTime: 60 * 1000,
  });
};

// Hook for data preview
export const useDataPreview = () => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (filters: DownloadFilters) => DataDownloadService.previewData(filters),
    onError: (error: Error) => {
      toast({
        title: "Preview Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};

// Hook for data download
export const useDataDownload = () => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ filters, format }: { filters: DownloadFilters; format: 'csv' | 'excel' }) => 
      DataDownloadService.downloadData(filters, format),
    onSuccess: (_data, variables) => {
      toast({
        title: "Download Started",
        description: `Your ${variables.format.toUpperCase()} file download has begun.`
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Download Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};

// Comprehensive hook for managing download form state
export const useDownloadForm = () => {
  const [selectedDatabase, setSelectedDatabase] = useState<string>('');
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [timePreset, setTimePreset] = useState<string>('');

  // Data queries
  const { data: databases, isLoading: isDatabasesLoading } = useDatabases();
  const { data: tables, isLoading: isTablesLoading } = useTables(selectedDatabase);
  const { data: locations, isLoading: isLocationsLoading } = useLocations(selectedDatabase);
  const { data: attributes, isLoading: isAttributesLoading } = useTableAttributes(selectedDatabase, selectedTable);
  const { data: isHealthy } = useHealthCheck();

  // Auto-select first database when databases load
  useEffect(() => {
    if (databases && databases.length > 0 && !selectedDatabase) {
      setSelectedDatabase(databases[0].id);
    }
  }, [databases, selectedDatabase]);

  // Auto-select primary attributes when attributes load
  useEffect(() => {
    if (attributes && attributes.length > 0) {
      const primaryAttrs = attributes
        .filter(attr => attr.isPrimary || ['TIMESTAMP', 'Location'].includes(attr.name))
        .map(attr => attr.name);
      setSelectedAttributes(primaryAttrs);
    }
  }, [attributes]);

  // Reset dependent selections when database changes
  const handleDatabaseChange = (databaseId: string) => {
    setSelectedDatabase(databaseId);
    setSelectedTable('');
    setSelectedAttributes([]);
    setSelectedLocations([]);
  };

  // Reset attributes when table changes
  const handleTableChange = (tableName: string) => {
    setSelectedTable(tableName);
    setSelectedAttributes([]);
  };

  // Toggle location selection
  const handleLocationToggle = (locationName: string) => {
    setSelectedLocations(prev => 
      prev.includes(locationName) 
        ? prev.filter(name => name !== locationName)
        : [...prev, locationName]
    );
  };

  // Toggle attribute selection
  const handleAttributeToggle = (attributeName: string) => {
    setSelectedAttributes(prev => 
      prev.includes(attributeName) 
        ? prev.filter(name => name !== attributeName)
        : [...prev, attributeName]
    );
  };

  // Select/deselect all locations
  const handleSelectAllLocations = () => {
    if (!locations || locations.length === 0) return;
    
    if (selectedLocations.length === locations.length) {
      setSelectedLocations([]);
    } else {
      setSelectedLocations(locations.map(loc => loc.name));
    }
  };

  // Select/deselect all attributes
  const handleSelectAllAttributes = () => {
    if (!attributes || attributes.length === 0) return;
    
    const availableAttributes = attributes.map(attr => attr.name);
    if (selectedAttributes.length === availableAttributes.length) {
      setSelectedAttributes([]);
    } else {
      setSelectedAttributes(availableAttributes);
    }
  };

  // Handle time preset changes
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
      case 'custom':
      case '':
        // Allow manual date selection
        break;
      default:
        break;
    }
  };

  // Validation
  const canDownload = !!(
    selectedDatabase && 
    selectedTable && 
    selectedLocations.length > 0 &&
    !(startDate && endDate && startDate > endDate)
  );

  // Build download filters
  const getDownloadFilters = (): DownloadFilters => ({
    database: selectedDatabase,
    table: selectedTable,
    locations: selectedLocations.length > 0 ? selectedLocations : undefined,
    attributes: selectedAttributes.length > 0 ? selectedAttributes : undefined,
    startDate: startDate?.toISOString(),
    endDate: endDate?.toISOString(),
  });

  return {
    // State
    selectedDatabase,
    selectedTable,
    selectedLocations,
    selectedAttributes,
    startDate,
    endDate,
    timePreset,
    
    // Data
    databases: databases || [],
    tables: tables || [],
    locations: locations || [],
    attributes: attributes || [],
    isHealthy,
    
    // Loading states
    isDatabasesLoading,
    isTablesLoading,
    isLocationsLoading,
    isAttributesLoading,
    
    // Handlers
    handleDatabaseChange,
    handleTableChange,
    handleLocationToggle,
    handleAttributeToggle,
    handleSelectAllLocations,
    handleSelectAllAttributes,
    handleTimePresetChange,
    setStartDate,
    setEndDate,
    
    // Utilities
    canDownload,
    getDownloadFilters,
    
    // Summary
    downloadSummary: {
      database: databases?.find(db => db.id === selectedDatabase)?.name,
      table: selectedTable,
      locations: selectedLocations.length,
      attributes: selectedAttributes.length,
    }
  };
};