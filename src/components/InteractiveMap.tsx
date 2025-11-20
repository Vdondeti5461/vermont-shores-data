import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, ZoomIn, ZoomOut, Maximize2, Layers } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';

interface NetworkSite {
  id: number;
  name: string;
  shortName?: string;
  latitude: number;
  longitude: number;
  elevation: number;
  type: 'ranch_brook' | 'distributed' | 'database';
  status?: 'active' | 'maintenance';
  region?: string;
}

interface InteractiveMapProps {
  sites?: NetworkSite[];
  onSiteClick?: (site: NetworkSite) => void;
}

import { getSiteColor } from '@/lib/siteColors';

// Normalize a code from shortName or name (e.g., "RB-01" -> "RB01", "SUMM" stays "SUMM")
const normalizeCode = (shortName?: string, name?: string) => {
  return ((shortName || name || '').replace(/[^A-Za-z0-9]/g, '')).toUpperCase();
};

const InteractiveMap = ({ sites = [], onSiteClick }: InteractiveMapProps) => {
  const mapRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ byId: Record<number, any>; byCode: Record<string, any> }>({ byId: {}, byCode: {} });
  const siteMapRef = useRef<{ byId: Record<number, NetworkSite>; byCode: Record<string, NetworkSite> }>({ byId: {}, byCode: {} });
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);
  const [selectedSiteCode, setSelectedSiteCode] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<NetworkSite | null>(null);

  // Vermont S2S Network Sites - Survey-verified with accurate coordinates from spreadsheet
  const defaultSites: NetworkSite[] = [
    { id: 1, name: "Mansfield Summit", shortName: "SUMM", latitude: 44.52796261, longitude: -72.81496117, elevation: 1168.568, type: "distributed", status: "active", region: "Alpine" },
    { id: 2, name: "Ranch Brook #1", shortName: "RB01", latitude: 44.52322238, longitude: -72.80863215, elevation: 1075.002, type: "ranch_brook", status: "active", region: "Alpine" },
    { id: 3, name: "Ranch Brook #2", shortName: "RB02", latitude: 44.51775982, longitude: -72.81039188, elevation: 910.188, type: "ranch_brook", status: "active", region: "Alpine" },
    { id: 4, name: "Ranch Brook #12", shortName: "RB12", latitude: 44.51880228, longitude: -72.79785548, elevation: 884.151, type: "ranch_brook", status: "active", region: "Alpine" },
    { id: 5, name: "Ranch Brook #9", shortName: "RB09", latitude: 44.48905, longitude: -72.79285, elevation: 847, type: "ranch_brook", status: "active", region: "Alpine" },
    { id: 6, name: "Ranch Brook #3", shortName: "RB03", latitude: 44.51481829, longitude: -72.80905263, elevation: 794.901, type: "ranch_brook", status: "active", region: "Montane" },
    { id: 7, name: "Mansfield West SCAN", shortName: "UNDR", latitude: 44.53511455, longitude: -72.83462236, elevation: 698.292, type: "distributed", status: "active", region: "Montane" },
    { id: 8, name: "Ranch Brook #4", shortName: "RB04", latitude: 44.51097861, longitude: -72.80281519, elevation: 639.716, type: "ranch_brook", status: "active", region: "Montane" },
    { id: 9, name: "Ranch Brook #10", shortName: "RB10", latitude: 44.49505, longitude: -72.78639, elevation: 624, type: "ranch_brook", status: "active", region: "Montane" },
    { id: 10, name: "Ranch Brook #7", shortName: "RB07", latitude: 44.51528492, longitude: -72.78513705, elevation: 613.31, type: "ranch_brook", status: "active", region: "Montane" },
    { id: 11, name: "Sleepers R3/Main", shortName: "SR01", latitude: 44.48296257, longitude: -72.16464901, elevation: 552.866, type: "distributed", status: "active", region: "Montane" },
    { id: 12, name: "Ranch Brook #5", shortName: "RB05", latitude: 44.5044967, longitude: -72.79947434, elevation: 505.38, type: "ranch_brook", status: "active", region: "Montane" },
    { id: 13, name: "Ranch Brook #8", shortName: "RB08", latitude: 44.50953955, longitude: -72.78220384, elevation: 471.51, type: "ranch_brook", status: "active", region: "Valley" },
    { id: 14, name: "Mansfield West Proctor", shortName: "PROC", latitude: 44.5285819, longitude: -72.866737, elevation: 418.212, type: "distributed", status: "active", region: "Valley" },
    { id: 15, name: "Ranch Brook #6", shortName: "RB06", latitude: 44.50370289, longitude: -72.78352521, elevation: 414.489, type: "ranch_brook", status: "active", region: "Valley" },
    { id: 16, name: "Ranch Brook #11", shortName: "RB11", latitude: 44.50545202, longitude: -72.7713791, elevation: 388.039, type: "ranch_brook", status: "active", region: "Valley" },
    { id: 17, name: "Sleepers R25", shortName: "SR25", latitude: 44.47682346, longitude: -72.12589909, elevation: 356.653, type: "distributed", status: "active", region: "Valley" },
    { id: 18, name: "Sleepers W1/R11", shortName: "SI11", latitude: 44.45002119, longitude: -72.06714939, elevation: 225.481, type: "distributed", status: "active", region: "Valley" },
    { id: 19, name: "Jericho Clearing", shortName: "JRCL", latitude: 44.447694, longitude: -73.00228357, elevation: 199, type: "distributed", status: "active", region: "Valley" },
    { id: 20, name: "Jericho Forest", shortName: "JRFO", latitude: 44.44780437, longitude: -73.00270872, elevation: 196, type: "distributed", status: "active", region: "Valley" },
    { id: 21, name: "Spear St", shortName: "SPST", latitude: 44.45258109, longitude: -73.19181715, elevation: 87.108, type: "distributed", status: "active", region: "Valley" },
    { id: 22, name: "Potash Brook", shortName: "PTSH", latitude: 44.44489861, longitude: -73.21425398, elevation: 44.711, type: "distributed", status: "active", region: "Valley" }
  ];

  const mapSites = sites.length > 0 ? sites : defaultSites;

  useEffect(() => {
    const initializeMap = async () => {
      // Dynamically import Leaflet to avoid SSR issues
      const L = await import('leaflet');
      
      // Fix for default markers
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      if (mapRef.current && !mapInstanceRef.current) {
        // Initialize map centered on Vermont with proper bounds for S2S network
        const map = L.map(mapRef.current, {
          scrollWheelZoom: false,
          tap: true,
        }).setView([44.5, -72.7], 9); // Better center for Vermont S2S sites

        // Ensure proper sizing on iOS Safari and after layout changes
        setTimeout(() => map.invalidateSize(), 0);
        const handleResize = () => map.invalidateSize();
        window.addEventListener('resize', handleResize);
        map.on('popupopen', () => setTimeout(() => map.invalidateSize(), 0));

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        // Add topographic layer as an option
        const topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
          attribution: 'Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)',
          maxZoom: 17,
        });

        // Create custom icons with selection highlighting
        const createIcon = (color: string, status: string = 'active', isSelected: boolean = false) => {
          const opacity = status === 'maintenance' ? '0.7' : '1';
          const size = isSelected ? '18px' : '14px';
          const borderColor = isSelected ? '#ff0000' : 'white';
          const borderWidth = isSelected ? '4px' : '2px';
          const pulseEffect = isSelected ? 'animation: pulse 2s infinite;' : '';
          const shadow = isSelected ? '0 0 15px rgba(255,0,0,0.6)' : '0 3px 6px rgba(0,0,0,0.4)';
          
          return L.divIcon({
            className: `custom-marker ${status} ${isSelected ? 'selected' : ''}`,
            html: `<div style="background-color: ${color}; width: ${size}; height: ${size}; border-radius: 50%; border: ${borderWidth} solid ${borderColor}; box-shadow: ${shadow}; opacity: ${opacity}; ${pulseEffect}"></div>`,
            iconSize: isSelected ? [26, 26] : [18, 18],
            iconAnchor: isSelected ? [13, 13] : [9, 9],
          });
        };

        // Prepare marker maps
        markersRef.current = { byId: {}, byCode: {} };
        siteMapRef.current = { byId: {}, byCode: {} };

        // Standardized color palette - already defined at top level
        // Add site markers with enhanced styling
        mapSites.forEach((site) => {
          const code = normalizeCode(site.shortName, site.name);

          // Assign color based on site ID for consistency
          const color = getSiteColor(site.id);
          
          // Determine elevation range for display
          let elevationRange = 'Valley';
          if (site.elevation >= 800) {
            elevationRange = 'Alpine';
          } else if (site.elevation >= 400) {
            elevationRange = 'Montane';
          }
          
          const status = site.status || 'active';
          const isSelected = selectedSiteId === site.id;
          const icon = createIcon(color, status, isSelected);
          const statusLabel = status === 'active' ? 'Active' : 'Under Maintenance';
          
          const marker = L.marker([site.latitude, site.longitude], { icon })
            .addTo(map)
            .bindPopup(`
              <div style="min-width: 250px;">
                <h3 style="margin: 0 0 8px 0; font-weight: bold; color: ${color};">
                  ${site.shortName} - ${site.name}
                </h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
                  <div><strong>Code:</strong> ${code}</div>
                  <div><strong>Short Name:</strong> ${site.shortName}</div>
                  <div><strong>Elevation:</strong> ${site.elevation}m</div>
                  <div><strong>Zone:</strong> ${elevationRange}</div>
                  <div><strong>Latitude:</strong> ${site.latitude.toFixed(4)}°</div>
                  <div><strong>Longitude:</strong> ${site.longitude.toFixed(4)}°</div>
                  <div><strong>Network:</strong> ${site.type === 'ranch_brook' ? 'Ranch Brook' : 'Distributed'}</div>
                  <div><strong>Status:</strong> <span style="color: ${status === 'active' ? '#16a34a' : '#f59e0b'};">${statusLabel}</span></div>
                </div>
              </div>
            `);

          // Store marker and site references by ID and code
          markersRef.current.byId[site.id] = marker;
          markersRef.current.byCode[code] = marker;
          siteMapRef.current.byId[site.id] = site;
          siteMapRef.current.byCode[code] = site;

          marker.on('click', () => {
            setSelectedSiteId(site.id);
            setSelectedSiteCode(code);
            setSelectedSite(site);
            if (onSiteClick) onSiteClick(site);
          });
        });

        // Layer control
        const baseLayers = {
          'OpenStreetMap': map._layers[Object.keys(map._layers)[0]],
          'Topographic': topoLayer,
        };

        L.control.layers(baseLayers).addTo(map);

        // Scale control
        L.control.scale().addTo(map);

        mapInstanceRef.current = map;
      }
    };

    initializeMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapSites, onSiteClick]);

  // Update marker selection when selectedSiteId changes
  useEffect(() => {
    if (mapInstanceRef.current && markersRef.current) {
      const updateMarkers = async () => {
        const L = await import('leaflet');
        
        const createIconForUpdate = (color: string, status: string = 'active', isSelected: boolean = false) => {
          const opacity = status === 'maintenance' ? '0.7' : '1';
          const size = isSelected ? '18px' : '14px';
          const borderColor = isSelected ? '#ff0000' : 'white';
          const borderWidth = isSelected ? '4px' : '2px';
          const pulseEffect = isSelected ? 'animation: pulse 2s infinite;' : '';
          const shadow = isSelected ? '0 0 15px rgba(255,0,0,0.6)' : '0 3px 6px rgba(0,0,0,0.4)';
          
          return L.divIcon({
            className: `custom-marker ${status} ${isSelected ? 'selected' : ''}`,
            html: `<div style="background-color: ${color}; width: ${size}; height: ${size}; border-radius: 50%; border: ${borderWidth} solid ${borderColor}; box-shadow: ${shadow}; opacity: ${opacity}; ${pulseEffect}"></div>`,
            iconSize: isSelected ? [26, 26] : [18, 18],
            iconAnchor: isSelected ? [13, 13] : [9, 9],
          });
        };
        
        Object.entries(markersRef.current.byId).forEach(([siteId, marker]: [string, any]) => {
          const id = parseInt(siteId, 10);
          const site = siteMapRef.current.byId[id] || mapSites.find(s => s.id === id);
          if (site) {
            // Use consistent ID-based color
            const color = getSiteColor(site.id);
            
            const isSelected = selectedSiteId === id;
            const newIcon = createIconForUpdate(color, site.status || 'active', isSelected);
            marker.setIcon(newIcon);
          }
        });
      };
      
      updateMarkers();
    }
  }, [selectedSiteId, mapSites]);

  const handleSiteSelection = (value: string) => {
    // Value can be an ID ("13") or a code ("SUMM", "RB01", etc.)
    const maybeId = parseInt(value, 10);
    let site: NetworkSite | undefined;
    let code: string | null = null;

    if (!Number.isNaN(maybeId) && siteMapRef.current.byId[maybeId]) {
      site = siteMapRef.current.byId[maybeId];
      code = normalizeCode(site.shortName, site.name);
    } else {
      code = normalizeCode(value);
      site = siteMapRef.current.byCode[code] || mapSites.find((s) => normalizeCode(s.shortName, s.name) === code);
    }

    if (site && mapInstanceRef.current) {
      const siteCode = code || normalizeCode(site.shortName, site.name);
      setSelectedSiteId(site.id);
      setSelectedSiteCode(siteCode);
      setSelectedSite(site);

      // Center map on selected site with smooth animation
      mapInstanceRef.current.setView([site.latitude, site.longitude], 13, {
        animate: true,
        duration: 1.0,
      });

      // Open popup for selected marker after a short delay
      setTimeout(() => {
        const markerById = markersRef.current.byId[site.id];
        const markerByCode = markersRef.current.byCode[siteCode];
        const marker = markerById || markerByCode;
        if (marker) {
          marker.openPopup();
        }
      }, 400);

      if (onSiteClick) onSiteClick(site);
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const handleFitBounds = () => {
    if (mapInstanceRef.current && mapSites.length > 0) {
      const group = mapSites.map(site => [site.latitude, site.longitude]);
      mapInstanceRef.current.fitBounds(group, { padding: [20, 20] });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Location Selector - Similar to NY reference */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg">Vermont S2S Sites</CardTitle>
          <p className="text-sm text-muted-foreground">
            Select a monitoring station
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select onValueChange={handleSiteSelection} value={selectedSiteId?.toString() || ""}>
            <SelectTrigger className="bg-background border-border">
              <SelectValue placeholder="Choose location..." />
            </SelectTrigger>
            <SelectContent className="bg-background border-border z-50 max-h-72">
              {mapSites
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((site) => (
                <SelectItem key={site.id} value={site.id.toString()} className="hover:bg-muted">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full border border-white shadow-sm"
                      style={{ backgroundColor: getSiteColor(site.id) }}
                    />
                    <span className="truncate">{site.shortName} - {site.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Selected Site Metadata */}
          {selectedSite && (
            <div className="p-4 border rounded-lg bg-muted/30 space-y-3">
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: getSiteColor(selectedSite.id) }}
                />
                <h4 className="font-semibold text-sm">{selectedSite.shortName}</h4>
              </div>
              <div className="text-xs space-y-2">
                <div><span className="font-medium">Name:</span> {selectedSite.name}</div>
                <div><span className="font-medium">Elevation:</span> {selectedSite.elevation}m</div>
                <div><span className="font-medium">Zone:</span> {
                  selectedSite.elevation >= 800 ? 'Alpine' :
                  selectedSite.elevation >= 400 ? 'Montane' : 'Valley'
                }</div>
                <div><span className="font-medium">Network:</span> {
                  selectedSite.type === 'ranch_brook' ? 'Ranch Brook' : 'Distributed'
                }</div>
                <div><span className="font-medium">Coordinates:</span></div>
                <div className="ml-2 text-xs text-muted-foreground">
                  Lat: {selectedSite.latitude.toFixed(4)}°<br/>
                  Lon: {selectedSite.longitude.toFixed(4)}°
                </div>
                <div><span className="font-medium">Status:</span> 
                  <Badge variant={selectedSite.status === 'active' ? 'default' : 'secondary'} className="ml-2 text-xs">
                    {selectedSite.status === 'active' ? 'Active' : 'Maintenance'}
                  </Badge>
                </div>
              </div>
            </div>
          )}
          
          {/* Site Statistics */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Total Sites:</span>
              <Badge variant="secondary">{mapSites.length}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Alpine (≥800m):</span>
              <Badge variant="outline" className="text-red-700 border-red-300">
                {mapSites.filter(s => s.elevation >= 800).length}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Montane (400-799m):</span>
              <Badge variant="outline" className="text-orange-700 border-orange-300">
                {mapSites.filter(s => s.elevation >= 400 && s.elevation < 800).length}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Valley (&lt;400m):</span>
              <Badge variant="outline" className="text-green-700 border-green-300">
                {mapSites.filter(s => s.elevation < 400).length}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map Container */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Vermont Environmental Monitoring Network
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Interactive map showing {mapSites.length} monitoring stations across Vermont's elevation zones
          </p>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Map Container */}
            <div 
              ref={mapRef} 
              className="w-full rounded-lg border overflow-hidden"
              style={{ height: '500px' }}
            />
            
            {/* Map Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                className="bg-white/90 backdrop-blur-sm min-h-[44px] min-w-[44px]"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                className="bg-white/90 backdrop-blur-sm min-h-[44px] min-w-[44px]"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleFitBounds}
                className="bg-white/90 backdrop-blur-sm min-h-[44px] min-w-[44px]"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Compact Legend */}
            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 border shadow-lg max-w-xs">
              <h4 className="font-semibold mb-2 text-sm">Station Colors</h4>
              <p className="text-xs text-muted-foreground mb-2">
                Each station has a unique color for easy identification.
              </p>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-red-600 border border-white"></div>
                  <span>Alpine ≥800m ({mapSites.filter(s => s.elevation >= 800).length} stations)</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-orange-500 border border-white"></div>
                  <span>Montane 400-799m ({mapSites.filter(s => s.elevation >= 400 && s.elevation < 800).length} stations)</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-green-600 border border-white"></div>
                  <span>Valley &lt;400m ({mapSites.filter(s => s.elevation < 400).length} stations)</span>
                </div>
                {selectedSiteId && (
                  <div className="flex items-center gap-2 text-xs mt-2 pt-2 border-t border-gray-200">
                    <div className="w-3 h-3 rounded-full bg-red-500 border-4 border-red-500 animate-pulse"></div>
                    <span className="font-medium">Selected Site</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InteractiveMap;