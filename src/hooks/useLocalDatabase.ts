import { useQuery } from '@tanstack/react-query';
import { LocalDatabaseService, LocationData, EnvironmentalData, AnalyticsData, TableMetadata } from '@/services/localDatabaseService';

export const useLocalLocations = () => {
  return useQuery({
    queryKey: ['local-locations'],
    queryFn: LocalDatabaseService.getLocations,
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 3,
  });
};

export const useLocalTableData = (
  table: string,
  location?: string,
  startDate?: string,
  endDate?: string,
  limit?: number
) => {
  return useQuery({
    queryKey: ['local-table-data', table, location, startDate, endDate, limit],
    queryFn: () => LocalDatabaseService.getTableData(table, location, startDate, endDate, limit),
    enabled: Boolean(table),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useLocalTableMetadata = (table: string) => {
  return useQuery({
    queryKey: ['local-table-metadata', table],
    queryFn: () => LocalDatabaseService.getTableMetadata(table),
    enabled: Boolean(table),
    staleTime: 1000 * 60 * 60, // 1 hour - metadata doesn't change often
  });
};

export const useLocalAnalytics = (
  location?: string,
  startDate?: string,
  endDate?: string
) => {
  return useQuery({
    queryKey: ['local-analytics', location, startDate, endDate],
    queryFn: () => LocalDatabaseService.getAnalyticsSummary(location, startDate, endDate),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 10, // Auto-refresh every 10 minutes
  });
};

export const useLocalHealthCheck = () => {
  return useQuery({
    queryKey: ['local-health'],
    queryFn: LocalDatabaseService.healthCheck,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Check every minute
  });
};

// Combined hook for database overview
export const useLocalDatabaseOverview = (location?: string, dateRange?: { start: string; end: string }) => {
  const { data: locations, isLoading: locationsLoading } = useLocalLocations();
  const { data: analytics, isLoading: analyticsLoading } = useLocalAnalytics(
    location, 
    dateRange?.start, 
    dateRange?.end
  );
  const { data: isHealthy } = useLocalHealthCheck();

  // Get sample data from each table
  const { data: table1Data } = useLocalTableData(
    LocalDatabaseService.TABLES.TABLE1, 
    location, 
    dateRange?.start, 
    dateRange?.end, 
    100
  );
  const { data: windData } = useLocalTableData(
    LocalDatabaseService.TABLES.WIND, 
    location, 
    dateRange?.start, 
    dateRange?.end, 
    100
  );
  const { data: precipitationData } = useLocalTableData(
    LocalDatabaseService.TABLES.PRECIPITATION, 
    location, 
    dateRange?.start, 
    dateRange?.end, 
    100
  );
  const { data: snowData } = useLocalTableData(
    LocalDatabaseService.TABLES.SNOW_TEMP_PROFILE, 
    location, 
    dateRange?.start, 
    dateRange?.end, 
    100
  );

  return {
    locations: locations || [],
    analytics: analytics || {
      temperature: { average: null, min: null, max: null, count: 0 },
      humidity: { average: null },
      wind: { average_speed: null, max_speed: null, average_direction: null, count: 0 },
      precipitation: { total: 0, average_intensity: null, count: 0 },
      snow: { average_swe: null, average_density: null, count: 0 },
      period: { start: '', end: '' }
    },
    tableData: {
      table1: table1Data || [],
      wind: windData || [],
      precipitation: precipitationData || [],
      snow: snowData || []
    },
    isLoading: locationsLoading || analyticsLoading,
    isServerHealthy: isHealthy || false
  };
};