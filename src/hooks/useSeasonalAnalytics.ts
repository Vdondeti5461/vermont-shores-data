import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { 
  SeasonalAnalyticsService, 
  Location, 
  Season, 
  EnvironmentalData, 
  SeasonalMetrics, 
  TimeSeriesFilter 
} from '@/services/seasonalAnalyticsService';

export const useSeasonalLocations = () => {
  return useQuery({
    queryKey: ['seasonal-locations'],
    queryFn: SeasonalAnalyticsService.getLocations,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

export const useSeasonalSeasons = () => {
  return useQuery({
    queryKey: ['seasonal-seasons'],
    queryFn: SeasonalAnalyticsService.getSeasons,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useEnvironmentalData = (filters: TimeSeriesFilter = {}) => {
  return useQuery({
    queryKey: ['environmental-data', filters],
    queryFn: () => SeasonalAnalyticsService.getEnvironmentalData(filters),
    enabled: Boolean(filters.seasonId), // Only run when season is selected
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useSeasonalMetrics = (filters: TimeSeriesFilter = {}) => {
  return useQuery({
    queryKey: ['seasonal-metrics', filters],
    queryFn: () => SeasonalAnalyticsService.getSeasonalMetrics(filters),
    enabled: Boolean(filters.seasonId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useMonthlyTrends = (filters: TimeSeriesFilter = {}) => {
  return useQuery({
    queryKey: ['monthly-trends', filters],
    queryFn: () => SeasonalAnalyticsService.getMonthlyTrends(filters),
    enabled: Boolean(filters.seasonId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useSeasonalTrends = (filters: TimeSeriesFilter = {}) => {
  return useQuery({
    queryKey: ['seasonal-trends', filters],
    queryFn: () => SeasonalAnalyticsService.getSeasonalTrends(filters),
    enabled: Boolean(filters.seasonId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useSeasonalAnalyticsState = () => {
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<'fall' | 'winter' | 'spring' | 'summer' | 'all'>('all');

  const { data: locations, isLoading: locationsLoading, error: locationsError } = useSeasonalLocations();
  const { data: seasons, isLoading: seasonsLoading, error: seasonsError } = useSeasonalSeasons();

  const filters: TimeSeriesFilter = {
    locationIds: selectedLocations.length > 0 ? selectedLocations : undefined,
    seasonId: selectedSeason || undefined,
    monthFilter: (selectedMonth && selectedMonth !== 'all') ? selectedMonth : undefined,
    seasonPeriod: (selectedPeriod && selectedPeriod !== 'all') ? selectedPeriod : undefined,
  };

  const { data: environmentalData, isLoading: dataLoading, error: dataError } = useEnvironmentalData(filters);
  const { data: seasonalMetrics, isLoading: metricsLoading, error: metricsError } = useSeasonalMetrics(filters);
  const { data: monthlyTrends, isLoading: monthlyLoading, error: monthlyError } = useMonthlyTrends(filters);
  const { data: seasonalTrends, isLoading: seasonalLoading, error: seasonalError } = useSeasonalTrends(filters);

  // Check for API connectivity errors (503, network failures, etc.)
  const hasApiError = Boolean(
    locationsError || 
    seasonsError || 
    dataError || 
    metricsError || 
    monthlyError || 
    seasonalError
  );

  return {
    // Data
    locations: locations || [],
    seasons: seasons || [],
    environmentalData: environmentalData || [],
    seasonalMetrics: seasonalMetrics || [],
    monthlyTrends: monthlyTrends || {},
    seasonalTrends: seasonalTrends || {},
    
    // State
    selectedLocations,
    selectedSeason,
    selectedMonth,
    selectedPeriod,
    
    // Setters
    setSelectedLocations,
    setSelectedSeason,
    setSelectedMonth,
    setSelectedPeriod,
    
    // Loading states
    isLoading: locationsLoading || seasonsLoading || dataLoading || metricsLoading || monthlyLoading || seasonalLoading,
    hasError: hasApiError, // Show error when API is down
    
    // Filters object for convenience
    filters
  };
};