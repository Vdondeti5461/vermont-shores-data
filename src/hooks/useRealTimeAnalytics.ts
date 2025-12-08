import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';
import {
  fetchDatabases,
  fetchSeasons,
  fetchLocations,
  fetchTableAttributes,
  fetchTimeSeriesData,
  fetchMultiQualityComparison,
  warmUpLocationsCache,
  forceRefreshLocations,
  clearLocationsCache,
  Database,
  DatabaseType,
  TableType,
  Location,
  TableAttribute,
  TimeSeriesDataPoint,
  Season
} from '@/services/realTimeAnalyticsService';

// Hook to fetch available databases
export const useDatabases = () => {
  return useQuery({
    queryKey: ['databases'],
    queryFn: fetchDatabases,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000,
    retry: 3,
  });
};

// Hook to fetch seasons
export const useSeasons = () => {
  return useQuery({
    queryKey: ['seasons'],
    queryFn: fetchSeasons,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Hook to fetch locations with robust error handling and recovery
export const useLocations = (database?: DatabaseType, table?: TableType) => {
  const queryClient = useQueryClient();

  // Force refetch function that clears all caches
  const forceRefetch = useCallback(async () => {
    if (!database || !table) return;
    
    console.log('[Analytics] Force refetching locations...');
    clearLocationsCache();
    queryClient.invalidateQueries({ queryKey: ['locations', database, table] });
  }, [database, table, queryClient]);

  // Handle visibility change and online events
  useEffect(() => {
    if (!database || !table) return;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Warm up cache when tab becomes visible
        warmUpLocationsCache(database, table);
      }
    };
    
    const handleOnline = () => {
      console.log('[Analytics] Network restored, refreshing locations...');
      forceRefetch();
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
    };
  }, [database, table, forceRefetch]);

  const query = useQuery({
    queryKey: ['locations', database, table],
    queryFn: async () => {
      if (!database || !table) return [];
      try {
        return await fetchLocations(database, table);
      } catch (error) {
        console.error('[Analytics] Location fetch failed, attempting force refresh...');
        // On error, try force refresh once
        return await forceRefreshLocations(database, table);
      }
    },
    enabled: !!database && !!table,
    staleTime: 12 * 60 * 1000, // 12 minutes
    gcTime: 20 * 60 * 1000, // Keep in cache for 20 minutes
    retry: 4,
    retryDelay: (attemptIndex) => Math.min(500 * 2 ** attemptIndex, 8000),
    refetchOnWindowFocus: false, // We handle this manually
    refetchOnReconnect: true,
  });

  return { ...query, forceRefetch };
};

// Hook to fetch table attributes
export const useTableAttributes = (database?: DatabaseType, table?: TableType) => {
  return useQuery({
    queryKey: ['attributes', database, table],
    queryFn: () => database && table ? fetchTableAttributes(database, table) : Promise.resolve([]),
    enabled: !!database && !!table,
    staleTime: 30 * 60 * 1000,
  });
};

// Hook to fetch time series data
export const useTimeSeriesData = (
  database?: DatabaseType,
  table?: TableType,
  location?: string,
  attributes?: string[],
  startDate?: string,
  endDate?: string
) => {
  return useQuery({
    queryKey: ['timeseries', database, table, location, attributes, startDate, endDate],
    queryFn: () => {
      if (!database || !table || !location || !attributes || attributes.length === 0) {
        return Promise.resolve([]);
      }
      return fetchTimeSeriesData(database, table, location, attributes, startDate, endDate);
    },
    enabled: !!database && !!table && !!location && !!attributes && attributes.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook to fetch multi-quality comparison data
export const useMultiQualityData = (
  databases?: DatabaseType[],
  table?: TableType,
  location?: string,
  attributes?: string[],
  startDate?: string,
  endDate?: string
) => {
  return useQuery({
    queryKey: ['multiquality', databases, table, location, attributes, startDate, endDate],
    queryFn: () => {
      if (!databases || databases.length === 0 || !table || !location || !attributes || attributes.length === 0) {
        return Promise.resolve([]);
      }
      return fetchMultiQualityComparison(databases, table, location, attributes, startDate, endDate);
    },
    enabled: !!databases && databases.length > 0 && !!table && !!location && !!attributes && attributes.length > 0,
    staleTime: 2 * 60 * 1000,
  });
};

// Main state management hook for real-time analytics
export const useRealTimeAnalyticsState = () => {
  const [selectedDatabase, setSelectedDatabase] = useState<DatabaseType | undefined>();
  const [selectedTable, setSelectedTable] = useState<TableType | undefined>();
  const [selectedLocation, setSelectedLocation] = useState<string | undefined>();
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ start?: string; end?: string }>({});
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonDatabases, setComparisonDatabases] = useState<DatabaseType[]>([]);

  const { data: databases, isLoading: loadingDatabases } = useDatabases();
  const { data: seasons, isLoading: loadingSeasons } = useSeasons();
  const { data: locations, isLoading: loadingLocations } = useLocations(selectedDatabase, selectedTable);
  const { data: attributes, isLoading: loadingAttributes } = useTableAttributes(selectedDatabase, selectedTable);

  const { data: timeSeriesData, isLoading: loadingData } = useTimeSeriesData(
    selectedDatabase,
    selectedTable,
    selectedLocation,
    selectedAttributes,
    dateRange.start,
    dateRange.end
  );

  const { data: comparisonData, isLoading: loadingComparison } = useMultiQualityData(
    comparisonMode ? comparisonDatabases : undefined,
    selectedTable,
    selectedLocation,
    selectedAttributes,
    dateRange.start,
    dateRange.end
  );

  const isLoading = loadingDatabases || loadingSeasons || 
                    loadingLocations || loadingAttributes || loadingData || loadingComparison;

  return {
    // Data
    databases,
    seasons,
    locations,
    attributes,
    timeSeriesData,
    comparisonData,
    
    // State
    selectedDatabase,
    selectedTable,
    selectedLocation,
    selectedAttributes,
    dateRange,
    comparisonMode,
    comparisonDatabases,
    
    // Setters
    setSelectedDatabase,
    setSelectedTable,
    setSelectedLocation,
    setSelectedAttributes,
    setDateRange,
    setComparisonMode,
    setComparisonDatabases,
    
    // Loading state
    isLoading,
  };
};
