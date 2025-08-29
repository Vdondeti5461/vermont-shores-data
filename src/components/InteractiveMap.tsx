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

  // Default sites if none provided - matches Network page data
  const defaultSites: NetworkSite[] = [
    { id: 1, name: "Mansfield East Ranch Brook 1", shortName: "RB01", latitude: 44.2619, longitude: -72.8081, elevation: 850, type: "ranch_brook" },
    { id: 2, name: "Mansfield East Ranch Brook 2", shortName: "RB02", latitude: 44.2625, longitude: -72.8075, elevation: 875, type: "ranch_brook" },
    { id: 3, name: "Mansfield East Ranch Brook 3", shortName: "RB03", latitude: 44.2631, longitude: -72.8069, elevation: 900, type: "ranch_brook" },
    { id: 4, name: "Mansfield East Ranch Brook 4", shortName: "RB04", latitude: 44.2637, longitude: -72.8063, elevation: 925, type: "ranch_brook" },
    { id: 5, name: "Mansfield East Ranch Brook 5", shortName: "RB05", latitude: 44.2643, longitude: -72.8057, elevation: 950, type: "ranch_brook" },
    { id: 6, name: "Mansfield East Ranch Brook 6", shortName: "RB06", latitude: 44.2649, longitude: -72.8051, elevation: 975, type: "ranch_brook" },
    { id: 7, name: "Mansfield East Ranch Brook 7", shortName: "RB07", latitude: 44.2655, longitude: -72.8045, elevation: 1000, type: "ranch_brook" },
    { id: 8, name: "Mansfield East Ranch Brook 8", shortName: "RB08", latitude: 44.2661, longitude: -72.8039, elevation: 1025, type: "ranch_brook" },
    { id: 9, name: "Mansfield East Ranch Brook 9", shortName: "RB09", latitude: 44.2667, longitude: -72.8033, elevation: 1050, type: "ranch_brook" },
    { id: 10, name: "Mansfield East Ranch Brook 10", shortName: "RB10", latitude: 44.2673, longitude: -72.8027, elevation: 1075, type: "ranch_brook" },
    { id: 11, name: "Mansfield East Ranch Brook 11", shortName: "RB11", latitude: 44.2679, longitude: -72.8021, elevation: 1100, type: "ranch_brook" },
    { id: 12, name: "Mansfield East FEMC", shortName: "RB12", latitude: 44.2685, longitude: -72.8015, elevation: 1125, type: "ranch_brook" },
    { id: 13, name: "Spear Street", shortName: "SPER", latitude: 44.4759, longitude: -73.1959, elevation: 95, type: "distributed" },
    { id: 14, name: "Sleepers R3/Main", shortName: "SR01", latitude: 44.2891, longitude: -72.8211, elevation: 680, type: "distributed" },
    { id: 15, name: "Sleepers W1/R11", shortName: "SR11", latitude: 44.2885, longitude: -72.8205, elevation: 705, type: "distributed" },
    { id: 16, name: "Sleepers R25", shortName: "SR25", latitude: 44.2879, longitude: -72.8199, elevation: 730, type: "database" },
    { id: 17, name: "Jericho clearing", shortName: "JRCL", latitude: 44.4919, longitude: -72.9659, elevation: 195, type: "distributed" },
    { id: 18, name: "Jericho Forest", shortName: "JRFO", latitude: 44.4925, longitude: -72.9665, elevation: 215, type: "distributed" },
    { id: 19, name: "Mansfield West Proctor", shortName: "PROC", latitude: 44.2561, longitude: -72.8141, elevation: 1200, type: "distributed" },
    { id: 20, name: "Potash Brook", shortName: "PTSH", latitude: 44.2567, longitude: -72.8147, elevation: 1225, type: "distributed" },
    { id: 21, name: "Mansfield SUMMIT", shortName: "SUMM", latitude: 44.2573, longitude: -72.8153, elevation: 1339, type: "ranch_brook" },
    { id: 22, name: "Mansfield West SCAN", shortName: "UNDR", latitude: 44.2555, longitude: -72.8135, elevation: 1175, type: "database" }
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
              {mapSites.filter(s => s.type === 'ranch_brook').length} Ranch Brook
            </Badge>
            <Badge variant="outline" className="text-blue-700 border-blue-300">
              {mapSites.filter(s => s.type === 'distributed').length} Distributed
            </Badge>
            <Badge variant="outline" className="text-green-700 border-green-300">
              {mapSites.filter(s => s.type === 'database').length} Database
            </Badge>
            <Badge variant="outline" className="text-yellow-700 border-yellow-300">
              {mapSites.filter(s => s.status === 'maintenance').length || 2} Maintenance
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
                <span>Ranch Brook Sites (Mount Mansfield)</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-blue-600 border border-white"></div>
                <span>Distributed Sites (Regional)</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-green-600 border border-white"></div>
                <span>Database Stations</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InteractiveMap;