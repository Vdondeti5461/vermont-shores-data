import { useQuery } from '@tanstack/react-query';
import { LocalDatabaseService, LocationData, EnvironmentalData, AnalyticsData, TableMetadata } from '@/services/localDatabaseService';

export const useLocalLocations = (database: string = 'raw_data') => {
  return useQuery({
    queryKey: ['local-locations', database],
    queryFn: () => LocalDatabaseService.getLocations(database),
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 3,
  });
};

export const useLocalTableData = (
  table: string,
  database: string = 'raw_data',
  location?: string,
  startDate?: string,
  endDate?: string,
  season?: string,
  limit?: number
) => {
  return useQuery({
    queryKey: ['local-table-data', database, table, location, startDate, endDate, season, limit?.toString()],
    queryFn: () => LocalDatabaseService.getTableData(table, database, location, startDate, endDate, season, limit),
    enabled: Boolean(table),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useLocalTableMetadata = (table: string, database: string = 'raw_data') => {
  return useQuery({
    queryKey: ['local-table-metadata', database, table],
    queryFn: () => LocalDatabaseService.getTableMetadata(table, database),
    enabled: Boolean(table),
    staleTime: 1000 * 60 * 60, // 1 hour - metadata doesn't change often
  });
};

export const useLocalAnalytics = (
  database: string = 'raw_data',
  location?: string,
  startDate?: string,
  endDate?: string,
  season?: string
) => {
  return useQuery({
    queryKey: ['local-analytics', database, location, startDate, endDate, season],
    queryFn: () => LocalDatabaseService.getAnalyticsSummary(database, location, startDate, endDate, season),
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
export const useLocalDatabaseOverview = (database: string = 'raw_data', location?: string, dateRange?: { start: string; end: string }) => {
  const { data: locations, isLoading: locationsLoading } = useLocalLocations(database);
  const { data: analytics, isLoading: analyticsLoading } = useLocalAnalytics(
    database,
    location, 
    dateRange?.start, 
    dateRange?.end
  );
  const { data: isHealthy } = useLocalHealthCheck();

  return {
    locations: (locations as LocationData[]) || [],
    analytics: analytics || {
      temperature: { average: null, min: null, max: null, count: 0 },
      humidity: { average: null },
      wind: { average_speed: null, max_speed: null, average_direction: null, count: 0 },
      precipitation: { total: 0, average_intensity: null, count: 0 },
      snow: { average_swe: null, average_density: null, count: 0 },
      period: { start: '', end: '' }
    },
    tableData: {},
    isLoading: locationsLoading || analyticsLoading,
    isServerHealthy: isHealthy || false
  };
};