// Hardcoded location data for the 22 monitoring stations
// This eliminates API fetch race conditions and provides instant loading
// Coordinates and metadata are static and match backend LOCATION_METADATA

export interface LocationData {
  id: string;
  name: string;
  displayName: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  elevation?: number;
}

// All 22 monitoring locations with standardized codes matching database
// Location codes match LOCATION_METADATA in backend server
export const MONITORING_LOCATIONS: LocationData[] = [
  // Mansfield Summit
  { id: 'SUMM', name: 'SUMM', displayName: 'Mansfield Summit', coordinates: { lat: 44.52796261, lng: -72.81496117 }, elevation: 1169 },
  
  // Ranch Brook Sites (RB01 through RB12 - note: no dashes in codes)
  { id: 'RB01', name: 'RB01', displayName: 'Ranch Brook #1', coordinates: { lat: 44.52322238, lng: -72.80863215 }, elevation: 1075 },
  { id: 'RB02', name: 'RB02', displayName: 'Ranch Brook #2', coordinates: { lat: 44.51775982, lng: -72.81039188 }, elevation: 910 },
  { id: 'RB03', name: 'RB03', displayName: 'Ranch Brook #3', coordinates: { lat: 44.51481829, lng: -72.80905263 }, elevation: 795 },
  { id: 'RB04', name: 'RB04', displayName: 'Ranch Brook #4', coordinates: { lat: 44.51097861, lng: -72.80281519 }, elevation: 640 },
  { id: 'RB05', name: 'RB05', displayName: 'Ranch Brook #5', coordinates: { lat: 44.5044967, lng: -72.79947434 }, elevation: 505 },
  { id: 'RB06', name: 'RB06', displayName: 'Ranch Brook #6', coordinates: { lat: 44.50370285, lng: -72.78352521 }, elevation: 414 },
  { id: 'RB07', name: 'RB07', displayName: 'Ranch Brook #7', coordinates: { lat: 44.51528492, lng: -72.78513705 }, elevation: 613 },
  { id: 'RB08', name: 'RB08', displayName: 'Ranch Brook #8', coordinates: { lat: 44.50953955, lng: -72.78220384 }, elevation: 472 },
  { id: 'RB09', name: 'RB09', displayName: 'Ranch Brook #9', coordinates: { lat: 44.48905, lng: -72.79285 }, elevation: 847 },
  { id: 'RB10', name: 'RB10', displayName: 'Ranch Brook #10', coordinates: { lat: 44.49505, lng: -72.78639 }, elevation: 624 },
  { id: 'RB11', name: 'RB11', displayName: 'Ranch Brook #11', coordinates: { lat: 44.50545202, lng: -72.7713791 }, elevation: 388 },
  { id: 'RB12', name: 'RB12', displayName: 'Ranch Brook #12', coordinates: { lat: 44.51880228, lng: -72.79785548 }, elevation: 884 },
  
  // Underhill and Proctor
  { id: 'UNDR', name: 'UNDR', displayName: 'Mansfield West SCAN', coordinates: { lat: 44.53511455, lng: -72.83462236 }, elevation: 698 },
  { id: 'PROC', name: 'PROC', displayName: 'Mansfield West Proctor', coordinates: { lat: 44.5285819, lng: -72.866737 }, elevation: 418 },
  
  // Sleepers River Sites
  { id: 'SR01', name: 'SR01', displayName: 'Sleepers R3/Main', coordinates: { lat: 44.48296257, lng: -72.16464901 }, elevation: 553 },
  { id: 'SR11', name: 'SR11', displayName: 'Sleepers W1/R11', coordinates: { lat: 44.45002119, lng: -72.06714939 }, elevation: 225 },
  { id: 'SR25', name: 'SR25', displayName: 'Sleepers R25', coordinates: { lat: 44.47682346, lng: -72.12582909 }, elevation: 357 },
  
  // Jericho Research Sites
  { id: 'JRCL', name: 'JRCL', displayName: 'Jericho Clearing', coordinates: { lat: 44.447694, lng: -73.00228357 }, elevation: 199 },
  { id: 'JRFO', name: 'JRFO', displayName: 'Jericho Forest', coordinates: { lat: 44.44780437, lng: -73.00270872 }, elevation: 196 },
  
  // Lake Champlain Shoreline Sites
  { id: 'SPST', name: 'SPST', displayName: 'Spear St', coordinates: { lat: 44.45258109, lng: -73.19181715 }, elevation: 87 },
  { id: 'PTSH', name: 'PTSH', displayName: 'Potash Brook', coordinates: { lat: 44.44489861, lng: -73.21425398 }, elevation: 45 },
];

// Get locations as simple id/name array for dropdowns
export const getLocationOptions = (): Array<{ id: string; name: string }> => {
  return MONITORING_LOCATIONS.map(loc => ({
    id: loc.id,
    name: loc.displayName
  }));
};

// Find location by ID (supports both with and without dashes)
export const findLocationById = (id: string): LocationData | undefined => {
  const normalizedId = id.replace(/-/g, '');
  return MONITORING_LOCATIONS.find(loc => 
    loc.id === id || 
    loc.name === id || 
    loc.id.replace(/-/g, '') === normalizedId
  );
};

// Get all location codes as array
export const getLocationCodes = (): string[] => {
  return MONITORING_LOCATIONS.map(loc => loc.id);
};
