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
}

interface InteractiveMapProps {
  sites?: NetworkSite[];
  onSiteClick?: (site: NetworkSite) => void;
}

const InteractiveMap = ({ sites = [], onSiteClick }: InteractiveMapProps) => {
  const mapRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);

  // Default sites if none provided
  const defaultSites: NetworkSite[] = [
    { id: 6, name: "Site #6", shortName: "RB-06", latitude: 44.5036530380135, longitude: -72.7836409062135, elevation: 412, type: "ranch_brook" },
    { id: 13, name: "Mansfield Summit", shortName: "RB-13", latitude: 44.5283751587457, longitude: -72.8146923602848, elevation: 1163, type: "ranch_brook" },
    { id: 11, name: "Site #11", shortName: "RB-11", latitude: 44.5054945991154, longitude: -72.7713537523828, elevation: 380, type: "ranch_brook" },
    { id: 22, name: "Potash Brook", shortName: "POTASH", latitude: 44.4448498951540, longitude: -73.2143236967372, elevation: 47, type: "distributed" },
    { id: 21, name: "Spear St", shortName: "SPEAR", latitude: 44.4525602200818, longitude: -73.1919332892984, elevation: 86, type: "distributed" },
    { id: 20, name: "Jericho (Forested)", shortName: "JER-F", latitude: 44.4478096390368, longitude: -73.0027073790982, elevation: 196, type: "distributed" },
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

        // Create custom icons for different site types
        const ranchBrookIcon = L.divIcon({
          className: 'custom-marker ranch-brook',
          html: '<div style="background-color: #dc2626; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });

        const distributedIcon = L.divIcon({
          className: 'custom-marker distributed',
          html: '<div style="background-color: #2563eb; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });

        const databaseIcon = L.divIcon({
          className: 'custom-marker database',
          html: '<div style="background-color: #059669; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });

        // Add site markers
        mapSites.forEach((site) => {
          let icon = distributedIcon;
          let typeLabel = 'Distributed';
          let color = '#2563eb';
          
          if (site.type === 'ranch_brook') {
            icon = ranchBrookIcon;
            typeLabel = 'Ranch Brook';
            color = '#dc2626';
          } else if (site.type === 'database') {
            icon = databaseIcon;
            typeLabel = 'Database Station';
            color = '#059669';
          }
          
          const marker = L.marker([site.latitude, site.longitude], { icon })
            .addTo(map)
            .bindPopup(`
              <div style="min-width: 200px;">
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
                <p style="margin: 0; font-size: 12px;">
                  <strong>Type:</strong> ${typeLabel}
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