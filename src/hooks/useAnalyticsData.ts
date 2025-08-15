import { useQuery, useQueries } from '@tanstack/react-query';
import { AnalyticsService, SnowDepthData, Location, Season } from '@/services/analyticsService';

export const useLocations = () => {
  return useQuery({
    queryKey: ['locations'],
    queryFn: AnalyticsService.getLocations,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useSeasons = () => {
  return useQuery({
    queryKey: ['seasons'],
    queryFn: AnalyticsService.getSeasons,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useSnowDepthData = (
  locationIds: string[] = [],
  seasonId?: string,
  startDate?: string,
  endDate?: string
) => {
  return useQuery({
    queryKey: ['snow-depth-data', locationIds, seasonId, startDate, endDate],
    queryFn: () => AnalyticsService.getSnowDepthData(locationIds, seasonId, startDate, endDate),
    enabled: Boolean(seasonId), // Only run when season is selected
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useLocationSummaries = (locationIds: string[], seasonId: string) => {
  return useQueries({
    queries: locationIds.map(locationId => ({
      queryKey: ['location-summary', locationId, seasonId],
      queryFn: () => AnalyticsService.getLocationSummary(locationId, seasonId),
      enabled: Boolean(locationId && seasonId),
      staleTime: 1000 * 60 * 5, // 5 minutes
    }))
  });
};

export const useAnalyticsState = () => {
  const { data: locations, isLoading: locationsLoading } = useLocations();
  const { data: seasons, isLoading: seasonsLoading } = useSeasons();
  
  return {
    locations: locations || [],
    seasons: seasons || [],
    isLoading: locationsLoading || seasonsLoading
  };
};