// Hardcoded location data for the 22 monitoring stations
// This eliminates API fetch race conditions and provides instant loading
// Coordinates and metadata are static - update this file if locations change

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

// All 22 monitoring locations with standardized codes
// Location codes: SUMM, RB-01, RB-02, RB-03, RB-04, RB-05, RB-06, RB-07, RB-08, RB-09,
//                 RB-10, RB-11, RB12, UNDR, PROC, SR01, SR25, SI11, JRCL, JRFO, SPST, PTSH
export const MONITORING_LOCATIONS: LocationData[] = [
  // Mansfield Summit
  { id: 'SUMM', name: 'SUMM', displayName: 'Mansfield Summit', coordinates: { lat: 44.5438, lng: -72.8140 }, elevation: 1339 },
  
  // Ranch Brook Sites (RB-01 through RB-11, RB12)
  { id: 'RB-01', name: 'RB-01', displayName: 'Ranch Brook Site #1', coordinates: { lat: 44.4127, lng: -72.8235 }, elevation: 845 },
  { id: 'RB-02', name: 'RB-02', displayName: 'Ranch Brook Site #2', coordinates: { lat: 44.4095, lng: -72.8187 }, elevation: 780 },
  { id: 'RB-03', name: 'RB-03', displayName: 'Ranch Brook Site #3', coordinates: { lat: 44.4063, lng: -72.8139 }, elevation: 715 },
  { id: 'RB-04', name: 'RB-04', displayName: 'Ranch Brook Site #4', coordinates: { lat: 44.4031, lng: -72.8091 }, elevation: 650 },
  { id: 'RB-05', name: 'RB-05', displayName: 'Ranch Brook Site #5', coordinates: { lat: 44.3999, lng: -72.8043 }, elevation: 585 },
  { id: 'RB-06', name: 'RB-06', displayName: 'Ranch Brook Site #6', coordinates: { lat: 44.3967, lng: -72.7995 }, elevation: 520 },
  { id: 'RB-07', name: 'RB-07', displayName: 'Ranch Brook Site #7', coordinates: { lat: 44.3935, lng: -72.7947 }, elevation: 455 },
  { id: 'RB-08', name: 'RB-08', displayName: 'Ranch Brook Site #8', coordinates: { lat: 44.3903, lng: -72.7899 }, elevation: 390 },
  { id: 'RB-09', name: 'RB-09', displayName: 'Ranch Brook Site #9', coordinates: { lat: 44.3871, lng: -72.7851 }, elevation: 325 },
  { id: 'RB-10', name: 'RB-10', displayName: 'Ranch Brook Site #10', coordinates: { lat: 44.3839, lng: -72.7803 }, elevation: 260 },
  { id: 'RB-11', name: 'RB-11', displayName: 'Ranch Brook Site #11', coordinates: { lat: 44.3807, lng: -72.7755 }, elevation: 195 },
  { id: 'RB12', name: 'RB12', displayName: 'Ranch Brook Site #12', coordinates: { lat: 44.3775, lng: -72.7707 }, elevation: 130 },
  
  // Underhill and Processing
  { id: 'UNDR', name: 'UNDR', displayName: 'Underhill', coordinates: { lat: 44.5283, lng: -72.8362 }, elevation: 980 },
  { id: 'PROC', name: 'PROC', displayName: 'Proctor Maple Research', coordinates: { lat: 44.5180, lng: -72.8680 }, elevation: 420 },
  
  // Sleepers River Sites
  { id: 'SR01', name: 'SR01', displayName: 'Sleepers River Main', coordinates: { lat: 44.4933, lng: -72.1714 }, elevation: 512 },
  { id: 'SR25', name: 'SR25', displayName: 'Sleepers River R25', coordinates: { lat: 44.4871, lng: -72.1798 }, elevation: 478 },
  { id: 'SI11', name: 'SI11', displayName: 'Sleepers River SI11', coordinates: { lat: 44.4892, lng: -72.1756 }, elevation: 495 },
  
  // Jericho Research Sites
  { id: 'JRCL', name: 'JRCL', displayName: 'Jericho Research Clearing', coordinates: { lat: 44.4555, lng: -72.9488 }, elevation: 230 },
  { id: 'JRFO', name: 'JRFO', displayName: 'Jericho Research Forest', coordinates: { lat: 44.4567, lng: -72.9501 }, elevation: 245 },
  
  // Lake Champlain Shoreline Sites
  { id: 'SPST', name: 'SPST', displayName: 'Shelburne Point State Park', coordinates: { lat: 44.3841, lng: -73.2274 }, elevation: 30 },
  { id: 'PTSH', name: 'PTSH', displayName: 'Point Shelburne', coordinates: { lat: 44.3725, lng: -73.2356 }, elevation: 28 },
];

// Get locations as simple id/name array for dropdowns
export const getLocationOptions = (): Array<{ id: string; name: string }> => {
  return MONITORING_LOCATIONS.map(loc => ({
    id: loc.id,
    name: loc.displayName
  }));
};

// Find location by ID
export const findLocationById = (id: string): LocationData | undefined => {
  return MONITORING_LOCATIONS.find(loc => loc.id === id || loc.name === id);
};

// Get all location codes as array
export const getLocationCodes = (): string[] => {
  return MONITORING_LOCATIONS.map(loc => loc.id);
};
