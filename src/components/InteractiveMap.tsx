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

const InteractiveMap = ({ sites = [], onSiteClick }: InteractiveMapProps) => {
  const mapRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any>({});
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);
  const [selectedSite, setSelectedSite] = useState<NetworkSite | null>(null);

  // Vermont S2S Network Sites - Based on actual survey data from spreadsheet
  const defaultSites: NetworkSite[] = [
    { id: 1, name: "Mansfield Summit", shortName: "SUMMIT", latitude: 44.5284, longitude: -72.8147, elevation: 1163, type: "ranch_brook", status: "active", region: "Alpine" },
    { id: 2, name: "Site #1", shortName: "RB-01", latitude: 44.5232, longitude: -72.8087, elevation: 1072, type: "ranch_brook", status: "active", region: "Alpine" },
    { id: 3, name: "Site #2", shortName: "RB-02", latitude: 44.5178, longitude: -72.8104, elevation: 911, type: "ranch_brook", status: "active", region: "Alpine" },
    { id: 4, name: "FEMC", shortName: "FEMC", latitude: 44.5189, longitude: -72.7979, elevation: 872, type: "ranch_brook", status: "active", region: "Alpine" },
    { id: 5, name: "Site #9", shortName: "RB-09", latitude: 44.4891, longitude: -72.7928, elevation: 846, type: "ranch_brook", status: "active", region: "Alpine" },
    { id: 6, name: "Site #3", shortName: "RB-03", latitude: 44.5148, longitude: -72.8091, elevation: 795, type: "ranch_brook", status: "active", region: "Montane" },
    { id: 7, name: "West SCAN", shortName: "RB-14", latitude: 44.535, longitude: -72.8346, elevation: 705, type: "ranch_brook", status: "active", region: "Montane" },
    { id: 8, name: "Site #4", shortName: "RB-04", latitude: 44.511, longitude: -72.8028, elevation: 639, type: "ranch_brook", status: "active", region: "Montane" },
    { id: 9, name: "Site #7", shortName: "RB-07", latitude: 44.515, longitude: -72.7854, elevation: 613, type: "ranch_brook", status: "active", region: "Montane" },
    { id: 10, name: "Sleepers R3/Main", shortName: "SLP-R3", latitude: 44.483, longitude: -72.1647, elevation: 553, type: "distributed", status: "active", region: "Montane" },
    { id: 11, name: "Site #5", shortName: "RB-05", latitude: 44.5045, longitude: -72.7994, elevation: 507, type: "ranch_brook", status: "active", region: "Montane" },
    { id: 12, name: "Site #8", shortName: "RB-08", latitude: 44.5096, longitude: -72.7824, elevation: 472, type: "ranch_brook", status: "active", region: "Valley" },
    { id: 13, name: "Proctor Maple", shortName: "PROC", latitude: 44.5285, longitude: -72.8667, elevation: 422, type: "distributed", status: "active", region: "Valley" },
    { id: 14, name: "Site #6", shortName: "RB-06", latitude: 44.5037, longitude: -72.7836, elevation: 412, type: "ranch_brook", status: "active", region: "Valley" },
    { id: 15, name: "Site #11", shortName: "RB-11", latitude: 44.5055, longitude: -72.7714, elevation: 380, type: "ranch_brook", status: "active", region: "Valley" },
    { id: 16, name: "Sleepers R25", shortName: "SLP-R25", latitude: 44.4767, longitude: -72.126, elevation: 360, type: "distributed", status: "active", region: "Valley" },
    { id: 17, name: "Site #10", shortName: "RB-10", latitude: 44.495, longitude: -72.7864, elevation: 324, type: "ranch_brook", status: "active", region: "Valley" },
    { id: 18, name: "Sleepers W1/R11", shortName: "SLP-W1", latitude: 44.4999, longitude: -72.0671, elevation: 226, type: "distributed", status: "active", region: "Valley" },
    { id: 19, name: "Jericho (Clearing)", shortName: "JER-C", latitude: 44.4477, longitude: -73.0025, elevation: 198, type: "distributed", status: "active", region: "Valley" },
    { id: 20, name: "Jericho (Forested)", shortName: "JER-F", latitude: 44.4478, longitude: -73.0027, elevation: 196, type: "distributed", status: "active", region: "Valley" },
    { id: 21, name: "Spear St", shortName: "SPEAR", latitude: 44.4526, longitude: -73.1919, elevation: 86, type: "distributed", status: "active", region: "Valley" },
    { id: 22, name: "Potash Brook", shortName: "POTASH", latitude: 44.4448, longitude: -73.2143, elevation: 47, type: "distributed", status: "active", region: "Valley" }
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
        // Initialize map centered on Vermont with proper bounds
        const map = L.map(mapRef.current, {
          scrollWheelZoom: false,
          tap: true,
        }).setView([44.26, -72.58], 8); // Centered on Vermont state

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

        // Add site markers with enhanced styling
        mapSites.forEach((site) => {
          let color = '#3b82f6'; // Default blue
          let elevationRange = 'Valley';
          
          // Color by elevation zone
          if (site.elevation >= 800) {
            color = '#dc2626'; // Red for Alpine (800m+)
            elevationRange = 'Alpine';
          } else if (site.elevation >= 400) {
            color = '#f59e0b'; // Orange for Montane (400-799m)
            elevationRange = 'Montane';
          } else {
            color = '#16a34a'; // Green for Valley (<400m)
            elevationRange = 'Valley';
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
                  <div><strong>Elevation:</strong> ${site.elevation}m</div>
                  <div><strong>Zone:</strong> ${elevationRange}</div>
                  <div><strong>Latitude:</strong> ${site.latitude.toFixed(4)}°</div>
                  <div><strong>Longitude:</strong> ${site.longitude.toFixed(4)}°</div>
                  <div><strong>Network:</strong> ${site.type === 'ranch_brook' ? 'Ranch Brook' : 'Distributed'}</div>
                  <div><strong>Status:</strong> <span style="color: ${status === 'active' ? '#16a34a' : '#f59e0b'};">${statusLabel}</span></div>
                </div>
              </div>
            `);

          // Store marker reference for selection highlighting
          markersRef.current[site.id] = marker;

          marker.on('click', () => {
            setSelectedSiteId(site.id);
            setSelectedSite(site);
            if (onSiteClick) {
              onSiteClick(site);
            }
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
        
        Object.entries(markersRef.current).forEach(([siteId, marker]: [string, any]) => {
          const site = mapSites.find(s => s.id === parseInt(siteId));
          if (site) {
            let color = '#3b82f6';
            if (site.elevation >= 800) color = '#dc2626';
            else if (site.elevation >= 400) color = '#f59e0b';
            else color = '#16a34a';
            
            const isSelected = selectedSiteId === parseInt(siteId);
            const newIcon = createIconForUpdate(color, site.status || 'active', isSelected);
            marker.setIcon(newIcon);
          }
        });
      };
      
      updateMarkers();
    }
  }, [selectedSiteId, mapSites]);

  const handleSiteSelection = (siteId: string) => {
    const id = parseInt(siteId);
    setSelectedSiteId(id);
    
    const site = mapSites.find(s => s.id === id);
    if (site && mapInstanceRef.current) {
      setSelectedSite(site);
      
      // Center map on selected site with smooth animation
      mapInstanceRef.current.setView([site.latitude, site.longitude], 13, {
        animate: true,
        duration: 1.0
      });
      
      // Open popup for selected marker after a short delay
      setTimeout(() => {
        const marker = markersRef.current[id];
        if (marker) {
          marker.openPopup();
        }
      }, 500);
      
      if (onSiteClick) {
        onSiteClick(site);
      }
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
                      style={{
                        backgroundColor: site.elevation >= 800 ? '#dc2626' : 
                                       site.elevation >= 400 ? '#f59e0b' : '#16a34a'
                      }}
                    />
                    <span className="truncate">{site.name}</span>
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
                  style={{
                    backgroundColor: selectedSite.elevation >= 800 ? '#dc2626' : 
                                   selectedSite.elevation >= 400 ? '#f59e0b' : '#16a34a'
                  }}
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
              <h4 className="font-semibold mb-2 text-sm">Elevation Zones</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-red-600 border border-white"></div>
                  <span>Alpine ≥800m ({mapSites.filter(s => s.elevation >= 800).length})</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-orange-500 border border-white"></div>
                  <span>Montane 400-799m ({mapSites.filter(s => s.elevation >= 400 && s.elevation < 800).length})</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-green-600 border border-white"></div>
                  <span>Valley &lt;400m ({mapSites.filter(s => s.elevation < 400).length})</span>
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