import { useQuery, useQueries } from '@tanstack/react-query';
import { LocalDatabaseService, LocationData, MetricData, AnalyticsData } from '@/services/localDatabaseService';

export const useLocalLocations = () => {
  return useQuery({
    queryKey: ['local-locations'],
    queryFn: LocalDatabaseService.getLocations,
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 3,
  });
};

export const useLocalTemperatureData = (
  locationId?: string,
  startDate?: string,
  endDate?: string
) => {
  return useQuery({
    queryKey: ['local-temperature', locationId, startDate, endDate],
    queryFn: () => LocalDatabaseService.getTemperatureData(locationId, startDate, endDate),
    enabled: Boolean(locationId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useLocalWindData = (
  locationId?: string,
  startDate?: string,
  endDate?: string
) => {
  return useQuery({
    queryKey: ['local-wind', locationId, startDate, endDate],
    queryFn: () => LocalDatabaseService.getWindData(locationId, startDate, endDate),
    enabled: Boolean(locationId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useLocalPrecipitationData = (
  locationId?: string,
  startDate?: string,
  endDate?: string
) => {
  return useQuery({
    queryKey: ['local-precipitation', locationId, startDate, endDate],
    queryFn: () => LocalDatabaseService.getPrecipitationData(locationId, startDate, endDate),
    enabled: Boolean(locationId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useLocalSnowData = (
  locationId?: string,
  startDate?: string,
  endDate?: string
) => {
  return useQuery({
    queryKey: ['local-snow', locationId, startDate, endDate],
    queryFn: () => LocalDatabaseService.getSnowData(locationId, startDate, endDate),
    enabled: Boolean(locationId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useLocalAnalytics = (locationId?: string) => {
  return useQuery({
    queryKey: ['local-analytics', locationId],
    queryFn: () => LocalDatabaseService.getAnalyticsSummary(locationId),
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

// Combined hook for environmental analytics
export const useLocalEnvironmentalAnalytics = (locationId?: string, dateRange?: { start: string; end: string }) => {
  const { data: locations, isLoading: locationsLoading } = useLocalLocations();
  const { data: analytics, isLoading: analyticsLoading } = useLocalAnalytics(locationId);
  const { data: isHealthy } = useLocalHealthCheck();
  
  const { data: temperature } = useLocalTemperatureData(
    locationId, 
    dateRange?.start, 
    dateRange?.end
  );
  const { data: wind } = useLocalWindData(
    locationId, 
    dateRange?.start, 
    dateRange?.end
  );
  const { data: precipitation } = useLocalPrecipitationData(
    locationId, 
    dateRange?.start, 
    dateRange?.end
  );
  const { data: snow } = useLocalSnowData(
    locationId, 
    dateRange?.start, 
    dateRange?.end
  );

  return {
    locations: locations || [],
    analytics: analytics || { current_metrics: {}, recent_data: [] },
    environmentalData: {
      temperature: temperature || [],
      wind: wind || [],
      precipitation: precipitation || [],
      snow: snow || []
    },
    isLoading: locationsLoading || analyticsLoading,
    isServerHealthy: isHealthy || false
  };
};