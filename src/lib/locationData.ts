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
export const MONITORING_LOCATIONS: LocationData[] = [
  { id: 'SUMM', name: 'SUMM', displayName: 'Mansfield Summit', coordinates: { lat: 44.5438, lng: -72.8140 }, elevation: 1339 },
  { id: 'WEST', name: 'WEST', displayName: 'West Branch', coordinates: { lat: 44.5380, lng: -72.8295 }, elevation: 1150 },
  { id: 'VALE', name: 'VALE', displayName: 'Underhill Vale', coordinates: { lat: 44.5283, lng: -72.8362 }, elevation: 980 },
  { id: 'STEA', name: 'STEA', displayName: 'Stevensville', coordinates: { lat: 44.5097, lng: -72.8447 }, elevation: 750 },
  { id: 'UNDH', name: 'UNDH', displayName: 'Underhill Center', coordinates: { lat: 44.4925, lng: -72.8534 }, elevation: 520 },
  { id: 'LUND', name: 'LUND', displayName: 'Lower Underhill', coordinates: { lat: 44.4755, lng: -72.8618 }, elevation: 380 },
  { id: 'RB-01', name: 'RB-01', displayName: 'Ranch Brook Site #1', coordinates: { lat: 44.4127, lng: -72.8235 }, elevation: 845 },
  { id: 'RB-02', name: 'RB-02', displayName: 'Ranch Brook Site #2', coordinates: { lat: 44.4095, lng: -72.8187 }, elevation: 780 },
  { id: 'RB-03', name: 'RB-03', displayName: 'Ranch Brook Site #3', coordinates: { lat: 44.4063, lng: -72.8139 }, elevation: 715 },
  { id: 'RB-04', name: 'RB-04', displayName: 'Ranch Brook Site #4', coordinates: { lat: 44.4031, lng: -72.8091 }, elevation: 650 },
  { id: 'RB-05', name: 'RB-05', displayName: 'Ranch Brook Site #5', coordinates: { lat: 44.3999, lng: -72.8043 }, elevation: 585 },
  { id: 'SR01', name: 'SR01', displayName: 'Sleepers River Main', coordinates: { lat: 44.4933, lng: -72.1714 }, elevation: 512 },
  { id: 'SR11', name: 'SR11', displayName: 'Sleepers River W1', coordinates: { lat: 44.4892, lng: -72.1756 }, elevation: 495 },
  { id: 'SR25', name: 'SR25', displayName: 'Sleepers River R25', coordinates: { lat: 44.4871, lng: -72.1798 }, elevation: 478 },
  { id: 'LAKE', name: 'LAKE', displayName: 'Lake Champlain', coordinates: { lat: 44.4751, lng: -73.2103 }, elevation: 30 },
  { id: 'BURR', name: 'BURR', displayName: 'Burlington', coordinates: { lat: 44.4759, lng: -73.2121 }, elevation: 65 },
  { id: 'WILL', name: 'WILL', displayName: 'Williston', coordinates: { lat: 44.4393, lng: -73.0688 }, elevation: 120 },
  { id: 'RICH', name: 'RICH', displayName: 'Richmond', coordinates: { lat: 44.4092, lng: -72.9996 }, elevation: 175 },
  { id: 'JERI', name: 'JERI', displayName: 'Jericho', coordinates: { lat: 44.4555, lng: -72.9488 }, elevation: 230 },
  { id: 'ESSE', name: 'ESSE', displayName: 'Essex', coordinates: { lat: 44.5092, lng: -73.0687 }, elevation: 85 },
  { id: 'COLU', name: 'COLU', displayName: 'Colchester', coordinates: { lat: 44.5426, lng: -73.1476 }, elevation: 45 },
  { id: 'MIDD', name: 'MIDD', displayName: 'Middlebury', coordinates: { lat: 44.0154, lng: -73.1677 }, elevation: 110 },
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
