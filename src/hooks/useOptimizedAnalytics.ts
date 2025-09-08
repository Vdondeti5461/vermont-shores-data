import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnalyticsService, Location, Season, SnowDepthData } from '@/services/analyticsService';

// Optimized hook for analytics with better caching and lazy loading
export const useOptimizedAnalytics = () => {
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedSeason, setSelectedSeason] = useState('2024-2025');
  
  // Cache locations and seasons with longer stale time
  const { data: locations = [], isLoading: locationsLoading } = useQuery({
    queryKey: ['analytics-locations'],
    queryFn: AnalyticsService.getLocations,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });

  const { data: seasons = [], isLoading: seasonsLoading } = useQuery({
    queryKey: ['analytics-seasons'],
    queryFn: AnalyticsService.getSeasons,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });

  // Only load data when both location and season are selected
  const { data: analyticsData, isLoading: dataLoading, error } = useQuery({
    queryKey: ['analytics-data', selectedLocation, selectedSeason],
    queryFn: () => {
      const locationIds = selectedLocation === 'all' ? [] : [selectedLocation];
      return AnalyticsService.getSnowDepthData(locationIds, selectedSeason);
    },
    enabled: Boolean(selectedSeason), // Only run when season is selected
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  });

  // Location summary for selected location
  const { data: locationSummary } = useQuery({
    queryKey: ['location-summary', selectedLocation, selectedSeason],
    queryFn: () => AnalyticsService.getLocationSummary(selectedLocation, selectedSeason),
    enabled: Boolean(selectedLocation !== 'all' && selectedSeason),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Memoized computed values
  const computedMetrics = useMemo(() => {
    if (!analyticsData || analyticsData.length === 0) {
      return {
        avgTemperature: 0,
        avgSnowDepth: 0,
        avgPrecipitation: 0,
        avgWindSpeed: 0,
        avgHumidity: 0,
        dataPoints: 0,
        maxSnowDepth: 0,
        minTemperature: 0,
        maxTemperature: 0
      };
    }

    const totalPoints = analyticsData.length;
    const avgTemperature = analyticsData.reduce((sum, d) => sum + d.temperature, 0) / totalPoints;
    const avgSnowDepth = analyticsData.reduce((sum, d) => sum + d.snow_depth_clean, 0) / totalPoints;
    const avgPrecipitation = analyticsData.reduce((sum, d) => sum + d.precipitation, 0) / totalPoints;
    const avgWindSpeed = analyticsData.reduce((sum, d) => sum + d.wind_speed, 0) / totalPoints;
    const avgHumidity = analyticsData.reduce((sum, d) => sum + d.humidity, 0) / totalPoints;
    
    const maxSnowDepth = Math.max(...analyticsData.map(d => d.snow_depth_clean));
    const minTemperature = Math.min(...analyticsData.map(d => d.temperature));
    const maxTemperature = Math.max(...analyticsData.map(d => d.temperature));

    return {
      avgTemperature: Math.round(avgTemperature * 10) / 10,
      avgSnowDepth: Math.round(avgSnowDepth * 10) / 10,
      avgPrecipitation: Math.round(avgPrecipitation * 10) / 10,
      avgWindSpeed: Math.round(avgWindSpeed * 10) / 10,
      avgHumidity: Math.round(avgHumidity * 10) / 10,
      maxSnowDepth: Math.round(maxSnowDepth * 10) / 10,
      minTemperature: Math.round(minTemperature * 10) / 10,
      maxTemperature: Math.round(maxTemperature * 10) / 10,
      dataPoints: totalPoints
    };
  }, [analyticsData]);

  return {
    locations,
    seasons,
    analyticsData: analyticsData || [],
    locationSummary,
    computedMetrics,
    selectedLocation,
    selectedSeason,
    setSelectedLocation,
    setSelectedSeason,
    isLoading: locationsLoading || seasonsLoading || dataLoading,
    hasError: Boolean(error)
  };
};