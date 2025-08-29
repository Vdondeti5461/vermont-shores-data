import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, ZoomIn, ZoomOut, Maximize2, Layers } from 'lucide-react';
import { useEffect, useRef } from 'react';
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

  // Exact survey data with precise coordinates and elevations
  const defaultSites: NetworkSite[] = [
    { id: 1, name: "Mansfield East Ranch Brook 1", shortName: "RB01", latitude: 44.5232, longitude: -72.8086, elevation: 1075, type: "ranch_brook", status: "active", region: "Mansfield East" },
    { id: 2, name: "Mansfield East Ranch Brook 2", shortName: "RB02", latitude: 44.5178, longitude: -72.8104, elevation: 910, type: "ranch_brook", status: "active", region: "Mansfield East" },
    { id: 3, name: "Mansfield East Ranch Brook 3", shortName: "RB03", latitude: 44.5148, longitude: -72.8091, elevation: 795, type: "ranch_brook", status: "active", region: "Mansfield East" },
    { id: 4, name: "Mansfield East Ranch Brook 4", shortName: "RB04", latitude: 44.5110, longitude: -72.8028, elevation: 640, type: "ranch_brook", status: "active", region: "Mansfield East" },
    { id: 5, name: "Mansfield East Ranch Brook 5", shortName: "RB05", latitude: 44.5045, longitude: -72.7995, elevation: 505, type: "ranch_brook", status: "active", region: "Mansfield East" },
    { id: 6, name: "Mansfield East Ranch Brook 6", shortName: "RB06", latitude: 44.5037, longitude: -72.7835, elevation: 414, type: "ranch_brook", status: "active", region: "Mansfield East" },
    { id: 7, name: "Mansfield East Ranch Brook 7", shortName: "RB07", latitude: 44.5153, longitude: -72.7851, elevation: 613, type: "ranch_brook", status: "active", region: "Mansfield East" },
    { id: 8, name: "Mansfield East Ranch Brook 8", shortName: "RB08", latitude: 44.5095, longitude: -72.7021, elevation: 472, type: "ranch_brook", status: "active", region: "Mansfield East" },
    { id: 9, name: "Mansfield East Ranch Brook 9", shortName: "RB09", latitude: 44.4891, longitude: -72.7929, elevation: 847, type: "ranch_brook", status: "active", region: "Mansfield East" },
    { id: 10, name: "Mansfield East Ranch Brook 10", shortName: "RB10", latitude: 44.4951, longitude: -72.7864, elevation: 624, type: "ranch_brook", status: "active", region: "Mansfield East" },
    { id: 11, name: "Mansfield East Ranch Brook 11", shortName: "RB11", latitude: 44.5055, longitude: -72.7714, elevation: 388, type: "ranch_brook", status: "active", region: "Mansfield East" },
    { id: 12, name: "Mansfield East FEMC", shortName: "RB12", latitude: 44.5188, longitude: -72.7985, elevation: 884, type: "ranch_brook", status: "active", region: "Mansfield East" },
    { id: 13, name: "Spear Street", shortName: "SPST", latitude: 44.4526, longitude: -73.1918, elevation: 87, type: "distributed", status: "active", region: "Urban" },
    { id: 14, name: "Sleepers R3/Main", shortName: "SR01", latitude: 44.4830, longitude: -72.1646, elevation: 553, type: "distributed", status: "active", region: "Sleepers River" },
    { id: 15, name: "Sleepers W1/R11", shortName: "SR11", latitude: 44.4500, longitude: -72.0671, elevation: 225, type: "distributed", status: "active", region: "Sleepers River" },
    { id: 16, name: "Sleepers R25", shortName: "SR25", latitude: 44.4768, longitude: -72.1258, elevation: 357, type: "distributed", status: "maintenance", region: "Sleepers River" },
    { id: 17, name: "Jericho clearing", shortName: "JRCL", latitude: 44.4479, longitude: -73.0023, elevation: 199, type: "distributed", status: "active", region: "Jericho" },
    { id: 18, name: "Jericho Forest", shortName: "JRFO", latitude: 44.4478, longitude: -73.0027, elevation: 196, type: "distributed", status: "active", region: "Jericho" },
    { id: 19, name: "Mansfield West Proctor", shortName: "PROC", latitude: 44.5286, longitude: -72.8867, elevation: 418, type: "ranch_brook", status: "active", region: "Mansfield West" },
    { id: 20, name: "Potash Brook", shortName: "PTSH", latitude: 44.4449, longitude: -73.2143, elevation: 45, type: "distributed", status: "active", region: "Urban" },
    { id: 21, name: "Mansfield SUMMIT", shortName: "SUMM", latitude: 44.5280, longitude: -72.8150, elevation: 1169, type: "ranch_brook", status: "active", region: "Mansfield West" },
    { id: 22, name: "Mansfield West SCAN", shortName: "UNDR", latitude: 44.5351, longitude: -72.8346, elevation: 698, type: "ranch_brook", status: "maintenance", region: "Mansfield West" }
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
        // Initialize map centered on Vermont
        const map = L.map(mapRef.current).setView([44.5588, -72.5778], 9);

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

        // Create custom icons with enhanced styling for different site types and status
        const createIcon = (color: string, status: string = 'active', hasDataMismatch: boolean = false) => {
          const opacity = status === 'maintenance' ? '0.6' : '1';
          const borderColor = hasDataMismatch ? '#ff4444' : (status === 'maintenance' ? '#f59e0b' : 'white');
          const borderWidth = hasDataMismatch ? '3px' : '2px';
          const pulseEffect = hasDataMismatch ? 'animation: pulse 2s infinite;' : '';
          return L.divIcon({
            className: `custom-marker ${status} ${hasDataMismatch ? 'data-mismatch' : ''}`,
            html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: ${borderWidth} solid ${borderColor}; box-shadow: 0 3px 6px rgba(0,0,0,0.4); opacity: ${opacity}; ${pulseEffect}"></div>`,
            iconSize: [18, 18],
            iconAnchor: [9, 9],
          });
        };

        // Add site markers - using region-based colors to match network overview
        mapSites.forEach((site) => {
          let color = 'hsl(var(--primary))'; // Default blue
          let typeLabel = site.region || 'Regional';
          
          // Color by region to match network overview differentiation
          switch(site.region) {
            case 'Mansfield East':
              color = 'hsl(var(--destructive))'; // Red for Mansfield East (Ranch Brook)
              break;
            case 'Mansfield West':
              color = 'hsl(var(--warning))'; // Yellow/orange for Mansfield West (Summit area)
              break;
            case 'Sleepers River':
              color = 'hsl(var(--primary))'; // Blue for Sleepers River
              break;
            case 'Jericho':
              color = 'hsl(var(--secondary))'; // Green for Jericho
              break;
            case 'Urban':
              color = 'hsl(var(--accent))'; // Purple for Urban sites
              break;
            default:
              color = 'hsl(var(--muted-foreground))'; // Gray for undefined
              break;
          }
          
          const status = site.status || 'active';
          const icon = createIcon(color, status);
          const statusLabel = status === 'active' ? 'Active' : 'Under Maintenance';
          const statusColor = status === 'active' ? 'hsl(var(--success))' : 'hsl(var(--warning))';
          
          const marker = L.marker([site.latitude, site.longitude], { icon })
            .addTo(map)
            .bindPopup(`
              <div style="min-width: 220px;">
                <h3 style="margin: 0 0 8px 0; font-weight: bold; color: ${color};">
                  ${site.shortName || site.name}
                </h3>
                <p style="margin: 0 0 4px 0; font-size: 14px; color: #666;">
                  ${site.name}
                </p>
                <p style="margin: 0 0 4px 0; font-size: 12px;">
                  <strong>Elevation:</strong> ${site.elevation}m
                </p>
                <p style="margin: 0 0 4px 0; font-size: 12px;">
                  <strong>Coordinates:</strong> ${site.latitude.toFixed(4)}°N, ${site.longitude.toFixed(4)}°W
                </p>
                <p style="margin: 0 0 4px 0; font-size: 12px;">
                  <strong>Region:</strong> ${typeLabel}
                </p>
                <p style="margin: 0; font-size: 12px;">
                  <strong>Status:</strong> <span style="color: ${statusColor};">${statusLabel}</span>
                </p>
              </div>
            `);

          marker.on('click', () => {
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
    <Card className="data-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Interactive Network Map
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Real-time visualization of {mapSites.length} monitoring stations across Vermont
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-destructive border-destructive/30">
              {mapSites.filter(s => s.region === 'Mansfield East').length} Mansfield East
            </Badge>
            <Badge variant="outline" className="text-warning border-warning/30">
              {mapSites.filter(s => s.region === 'Mansfield West').length} Mansfield West
            </Badge>
            <Badge variant="outline" className="text-primary border-primary/30">
              {mapSites.filter(s => s.region === 'Sleepers River').length} Sleepers River
            </Badge>
            <Badge variant="outline" className="text-secondary border-secondary/30">
              {mapSites.filter(s => s.region === 'Jericho').length} Jericho
            </Badge>
            <Badge variant="outline" className="text-accent border-accent/30">
              {mapSites.filter(s => s.region === 'Urban').length} Urban
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Map Container */}
          <div 
            ref={mapRef} 
            className="w-full h-[600px] rounded-lg border overflow-hidden"
            style={{ minHeight: '600px' }}
          />
          
          {/* Map Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              className="bg-white/90 backdrop-blur-sm"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              className="bg-white/90 backdrop-blur-sm"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleFitBounds}
              className="bg-white/90 backdrop-blur-sm"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 border shadow-lg">
            <h4 className="font-semibold mb-2 text-sm">Network Legend</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-destructive border border-white"></div>
                <span>Mansfield East ({mapSites.filter(s => s.region === 'Mansfield East').length})</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-warning border border-white"></div>
                <span>Mansfield West ({mapSites.filter(s => s.region === 'Mansfield West').length})</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-primary border border-white"></div>
                <span>Sleepers River ({mapSites.filter(s => s.region === 'Sleepers River').length})</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-secondary border border-white"></div>
                <span>Jericho ({mapSites.filter(s => s.region === 'Jericho').length})</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-accent border border-white"></div>
                <span>Urban ({mapSites.filter(s => s.region === 'Urban').length})</span>
              </div>
              <div className="flex items-center gap-2 text-xs mt-2 pt-2 border-t border-muted">
                <div className="w-3 h-3 rounded-full bg-muted border border-white opacity-60"></div>
                <span>Under Maintenance ({mapSites.filter(s => s.status === 'maintenance').length})</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InteractiveMap;