import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { 
  RealTimeAnalyticsService, 
  Location, 
  Season, 
  TimeSeriesDataPoint 
} from '@/services/realTimeAnalyticsService';

export const useDatabases = () => {
  return useQuery({
    queryKey: ['databases'],
    queryFn: RealTimeAnalyticsService.getDatabases,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useSeasons = () => {
  return useQuery({
    queryKey: ['seasons'],
    queryFn: RealTimeAnalyticsService.getSeasons,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

export const useLocations = (database?: string, table?: string) => {
  return useQuery({
    queryKey: ['locations', database, table],
    queryFn: () => RealTimeAnalyticsService.getLocations(database!, table!),
    enabled: Boolean(database && table),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

export const useTableAttributes = (database?: string, table?: string) => {
  return useQuery({
    queryKey: ['table-attributes', database, table],
    queryFn: () => RealTimeAnalyticsService.getTableAttributes(database!, table!),
    enabled: Boolean(database && table),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useTimeSeriesData = (
  database?: string,
  table?: string,
  attributes: string[] = [],
  locations?: string[],
  startDate?: string,
  endDate?: string
) => {
  return useQuery({
    queryKey: ['time-series', database, table, attributes, locations, startDate, endDate],
    queryFn: () => RealTimeAnalyticsService.getTimeSeriesData(
      database!,
      table!,
      attributes,
      locations,
      startDate,
      endDate
    ),
    enabled: Boolean(database && table && attributes.length > 0),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useMultiQualityData = (
  season?: Season,
  attributes: string[] = [],
  locations?: string[],
  startDate?: string,
  endDate?: string
) => {
  return useQuery({
    queryKey: ['multi-quality', season?.id, attributes, locations, startDate, endDate],
    queryFn: () => RealTimeAnalyticsService.getMultiQualityData(
      season!,
      attributes,
      locations,
      startDate,
      endDate
    ),
    enabled: Boolean(season && attributes.length > 0),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useRealTimeAnalyticsState = () => {
  const [selectedSeason, setSelectedSeason] = useState<Season | undefined>();
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([
    'snow_depth',
    'air_temperature_avg_c',
    'wind_speed_max_ms'
  ]);
  const [dateRange, setDateRange] = useState<{ start?: string; end?: string }>({});

  const { data: seasons, isLoading: seasonsLoading } = useSeasons();
  const { data: locations, isLoading: locationsLoading } = useLocations(
    selectedSeason?.database,
    selectedSeason?.table
  );
  const { data: attributes, isLoading: attributesLoading } = useTableAttributes(
    selectedSeason?.database,
    selectedSeason?.table
  );
  const { data: multiQualityData, isLoading: dataLoading } = useMultiQualityData(
    selectedSeason,
    selectedAttributes,
    selectedLocations.length > 0 ? selectedLocations : undefined,
    dateRange.start,
    dateRange.end
  );

  return {
    // Data
    seasons: seasons || [],
    locations: locations || [],
    attributes: attributes || [],
    rawData: multiQualityData?.raw || [],
    cleanData: multiQualityData?.clean || [],
    qaqcData: multiQualityData?.qaqc || [],
    
    // State
    selectedSeason,
    selectedLocations,
    selectedAttributes,
    dateRange,
    
    // Setters
    setSelectedSeason,
    setSelectedLocations,
    setSelectedAttributes,
    setDateRange,
    
    // Loading states
    isLoading: seasonsLoading || locationsLoading || attributesLoading || dataLoading,
  };
};
