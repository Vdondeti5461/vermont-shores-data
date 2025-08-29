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
}

interface InteractiveMapProps {
  sites?: NetworkSite[];
  onSiteClick?: (site: NetworkSite) => void;
}

const InteractiveMap = ({ sites = [], onSiteClick }: InteractiveMapProps) => {
  const mapRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);

  // Default sites with exact coordinates and elevations from survey data
  const defaultSites: NetworkSite[] = [
    { id: 1, name: "Mansfield East Ranch Brook 1", shortName: "RB01", latitude: 44.52322238, longitude: -72.80863215, elevation: 1075, type: "ranch_brook", status: "active" },
    { id: 2, name: "Mansfield East Ranch Brook 2", shortName: "RB02", latitude: 44.51775982, longitude: -72.81039188, elevation: 910, type: "ranch_brook", status: "active" },
    { id: 3, name: "Mansfield East Ranch Brook 3", shortName: "RB03", latitude: 44.51481829, longitude: -72.80905263, elevation: 795, type: "ranch_brook", status: "active" },
    { id: 4, name: "Mansfield East Ranch Brook 4", shortName: "RB04", latitude: 44.51097861, longitude: -72.80281519, elevation: 640, type: "ranch_brook", status: "active" },
    { id: 5, name: "Mansfield East Ranch Brook 5", shortName: "RB05", latitude: 44.5044967, longitude: -72.79947434, elevation: 505, type: "ranch_brook", status: "active" },
    { id: 6, name: "Mansfield East Ranch Brook 6", shortName: "RB06", latitude: 44.50370289, longitude: -72.78352521, elevation: 414, type: "ranch_brook", status: "active" },
    { id: 7, name: "Mansfield East Ranch Brook 7", shortName: "RB07", latitude: 44.51528492, longitude: -72.78513705, elevation: 613, type: "ranch_brook", status: "active" },
    { id: 8, name: "Mansfield East Ranch Brook 8", shortName: "RB08", latitude: 44.50953955, longitude: -72.70208484, elevation: 472, type: "ranch_brook", status: "active" },
    { id: 9, name: "Mansfield East Ranch Brook 9", shortName: "RB09", latitude: 44.48905, longitude: -72.79285, elevation: 847, type: "ranch_brook", status: "active" },
    { id: 10, name: "Mansfield East Ranch Brook 10", shortName: "RB10", latitude: 44.49505, longitude: -72.78639, elevation: 624, type: "ranch_brook", status: "active" },
    { id: 11, name: "Mansfield East Ranch Brook 11", shortName: "RB11", latitude: 44.50545202, longitude: -72.7713791, elevation: 388, type: "ranch_brook", status: "active" },
    { id: 12, name: "Mansfield East FEMC", shortName: "RB12", latitude: 44.51880228, longitude: -72.79853548, elevation: 884, type: "ranch_brook", status: "active" },
    { id: 13, name: "Spear Street", shortName: "SPST", latitude: 44.45258109, longitude: -73.19181715, elevation: 87, type: "distributed", status: "active" },
    { id: 14, name: "Sleepers R3/Main", shortName: "SR01", latitude: 44.48296257, longitude: -72.16464901, elevation: 553, type: "distributed", status: "active" },
    { id: 15, name: "Sleepers W1/R11", shortName: "SR11", latitude: 44.45002119, longitude: -72.06714939, elevation: 225, type: "distributed", status: "active" },
    { id: 16, name: "Sleepers R25", shortName: "SR25", latitude: 44.47682346, longitude: -72.12582909, elevation: 357, type: "distributed", status: "maintenance" },
    { id: 17, name: "Jericho clearing", shortName: "JRCL", latitude: 44.447894, longitude: -73.00228357, elevation: 199, type: "distributed", status: "active" },
    { id: 18, name: "Jericho Forest", shortName: "JRFO", latitude: 44.44780437, longitude: -73.00270872, elevation: 196, type: "distributed", status: "active" },
    { id: 19, name: "Mansfield West Proctor", shortName: "PROC", latitude: 44.5285819, longitude: -72.886737, elevation: 418, type: "ranch_brook", status: "active" },
    { id: 20, name: "Potash Brook", shortName: "PTSH", latitude: 44.44489861, longitude: -73.21425398, elevation: 45, type: "distributed", status: "active" },
    { id: 21, name: "Mansfield SUMMIT", shortName: "SUMM", latitude: 44.52796261, longitude: -72.81496117, elevation: 1169, type: "ranch_brook", status: "active" },
    { id: 22, name: "Mansfield West SCAN", shortName: "UNDR", latitude: 44.53511455, longitude: -72.83462236, elevation: 698, type: "ranch_brook", status: "maintenance" }
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

        // Create custom icons for different site types and status
        const createIcon = (color: string, status: string = 'active') => {
          const opacity = status === 'maintenance' ? '0.6' : '1';
          const borderColor = status === 'maintenance' ? '#f59e0b' : 'white';
          return L.divIcon({
            className: `custom-marker ${status}`,
            html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid ${borderColor}; box-shadow: 0 2px 4px rgba(0,0,0,0.3); opacity: ${opacity};"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          });
        };

        // Add site markers
        mapSites.forEach((site) => {
          let color = '#2563eb';
          let typeLabel = 'Distributed';
          
          if (site.type === 'ranch_brook') {
            color = '#dc2626';
            typeLabel = 'Ranch Brook';
          } else if (site.type === 'database') {
            color = '#059669';
            typeLabel = 'Database Station';
          }
          
          const status = site.status || 'active';
          const icon = createIcon(color, status);
          const statusLabel = status === 'active' ? 'Active' : 'Under Maintenance';
          const statusColor = status === 'active' ? '#16a34a' : '#f59e0b';
          
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
                  <strong>Type:</strong> ${typeLabel}
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
            <Badge variant="outline" className="text-red-700 border-red-300">
              {mapSites.filter(s => s.type === 'ranch_brook').length} Mansfield
            </Badge>
            <Badge variant="outline" className="text-blue-700 border-blue-300">
              {mapSites.filter(s => s.type === 'distributed').length} Regional
            </Badge>
            <Badge variant="outline" className="text-yellow-700 border-yellow-300">
              {mapSites.filter(s => s.status === 'maintenance').length} Maintenance
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
                <div className="w-3 h-3 rounded-full bg-red-600 border border-white"></div>
                <span>Mansfield Sites ({mapSites.filter(s => s.type === 'ranch_brook').length})</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-blue-600 border border-white"></div>
                <span>Regional Sites ({mapSites.filter(s => s.type === 'distributed').length})</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-yellow-600 border border-white opacity-60"></div>
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