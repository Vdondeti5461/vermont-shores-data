import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  MapPin, 
  Database, 
  Search, 
  ChevronDown, 
  ChevronRight, 
  Thermometer, 
  Cloud, 
  Zap, 
  TreePine, 
  Droplets, 
  Wind,
  Activity,
  Clock,
  Info,
  Eye,
  Filter
} from 'lucide-react';

// Enhanced metadata with visual categorization
const LOCATION_DATA = [
  { code: 'RB01', name: 'Mansfield East Ranch Brook 1', lat: 44.5232, lng: -72.8086, elev: 1075, region: 'Mansfield East' },
  { code: 'RB02', name: 'Mansfield East Ranch Brook 2', lat: 44.5178, lng: -72.8104, elev: 910, region: 'Mansfield East' },
  { code: 'RB03', name: 'Mansfield East Ranch Brook 3', lat: 44.5148, lng: -72.8091, elev: 795, region: 'Mansfield East' },
  { code: 'RB04', name: 'Mansfield East Ranch Brook 4', lat: 44.5110, lng: -72.8028, elev: 640, region: 'Mansfield East' },
  { code: 'RB05', name: 'Mansfield East Ranch Brook 5', lat: 44.5045, lng: -72.7995, elev: 505, region: 'Mansfield East' },
  { code: 'RB06', name: 'Mansfield East Ranch Brook 6', lat: 44.5037, lng: -72.7835, elev: 414, region: 'Mansfield East' },
  { code: 'RB07', name: 'Mansfield East Ranch Brook 7', lat: 44.5153, lng: -72.7851, elev: 613, region: 'Mansfield East' },
  { code: 'RB08', name: 'Mansfield East Ranch Brook 8', lat: 44.5095, lng: -72.7021, elev: 472, region: 'Mansfield East' },
  { code: 'RB09', name: 'Mansfield East Ranch Brook 9', lat: 44.4891, lng: -72.7929, elev: 847, region: 'Mansfield East' },
  { code: 'RB10', name: 'Mansfield East Ranch Brook 10', lat: 44.4951, lng: -72.7864, elev: 624, region: 'Mansfield East' },
  { code: 'RB11', name: 'Mansfield East Ranch Brook 11', lat: 44.5055, lng: -72.7714, elev: 388, region: 'Mansfield East' },
  { code: 'RB12', name: 'Mansfield East FEMC', lat: 44.5188, lng: -72.7985, elev: 884, region: 'Mansfield East' },
  { code: 'SPST', name: 'Spear Street', lat: 44.4526, lng: -73.1918, elev: 87, region: 'Urban' },
  { code: 'SR01', name: 'Sleepers R3/Main', lat: 44.4830, lng: -72.1646, elev: 553, region: 'Sleepers River' },
  { code: 'SR11', name: 'Sleepers W1/R11', lat: 44.4500, lng: -72.0671, elev: 225, region: 'Sleepers River' },
  { code: 'SR25', name: 'Sleepers R25', lat: 44.4768, lng: -72.1258, elev: 357, region: 'Sleepers River' },
  { code: 'JRCL', name: 'Jericho clearing', lat: 44.4479, lng: -73.0023, elev: 199, region: 'Jericho' },
  { code: 'JRFO', name: 'Jericho Forest', lat: 44.4478, lng: -73.0027, elev: 196, region: 'Jericho' },
  { code: 'PROC', name: 'Mansfield West Proctor', lat: 44.5286, lng: -72.8867, elev: 418, region: 'Mansfield West' },
  { code: 'PTSH', name: 'Potash Brook', lat: 44.4449, lng: -73.2143, elev: 45, region: 'Urban' },
  { code: 'SUMM', name: 'Mansfield SUMMIT', lat: 44.5280, lng: -72.8150, elev: 1169, region: 'Mansfield West' },
  { code: 'UNDR', name: 'Mansfield West SCAN', lat: 44.5351, lng: -72.8346, elev: 698, region: 'Mansfield West' }
];

const TABLE_DATA = {
  'raw_env_core_observations': {
    name: 'Core Environmental Observations',
    description: 'Comprehensive environmental measurements including temperature, humidity, soil conditions, radiation, and snow properties',
    icon: Database,
    color: 'bg-blue-500',
    categories: {
      'Time': { icon: Clock, color: 'text-gray-600', attributes: ['timestamp'] },
      'Location': { icon: MapPin, color: 'text-green-600', attributes: ['location'] },
      'System': { icon: Activity, color: 'text-purple-600', attributes: ['id', 'battery_voltage_min'] },
      'Temperature': { icon: Thermometer, color: 'text-red-600', attributes: ['panel_temperature_c', 'air_temperature_avg_c', 'soil_temperature_c'] },
      'Humidity': { icon: Droplets, color: 'text-blue-600', attributes: ['relative_humidity_percent'] },
      'Radiation': { icon: Zap, color: 'text-yellow-600', attributes: ['soil_heat_flux_w_m2', 'shortwave_radiation_in_w_m2', 'shortwave_radiation_out_w_m2', 'longwave_radiation_in_w_m2', 'longwave_radiation_out_w_m2'] },
      'Soil': { icon: TreePine, color: 'text-green-700', attributes: ['soil_moisture_wfv', 'soil_temperature_c'] },
      'Snow': { icon: Cloud, color: 'text-cyan-600', attributes: ['snow_water_equivalent_mm', 'ice_content_percent', 'water_content_percent', 'snowpack_density_kg_m3', 'target_depth_cm', 'tcdt', 'snow_depth_cm'] },
      'Quality': { icon: Info, color: 'text-orange-600', attributes: ['quality_number', 'data_quality_flag'] }
    },
    attributes: {
      'id': { desc: 'Auto-incremented primary key', unit: 'No Unit', type: 'Identifier' },
      'timestamp': { desc: 'Date and time of observation (EST)', unit: 'DateTime', type: 'No Unit' },
      'location': { desc: 'Logger site ID (e.g., RB01, SUMM)', unit: 'LOC', type: 'No Unit' },
      'battery_voltage_min': { desc: 'Minimum battery voltage recorded', unit: 'Volts', type: 'Min' },
      'panel_temperature_c': { desc: 'Panel (enclosure) temperature', unit: 'Deg C', type: 'Sample' },
      'air_temperature_avg_c': { desc: 'Air temperature average', unit: 'Deg C', type: 'Avg' },
      'relative_humidity_percent': { desc: 'Relative humidity percentage', unit: '%', type: 'Sample' },
      'soil_heat_flux_w_m2': { desc: 'Soil heat flux', unit: 'W/m²', type: 'Sample' },
      'soil_moisture_wfv': { desc: 'Soil moisture in Water-Filled Pore Volume', unit: '%', type: 'Sample' },
      'soil_temperature_c': { desc: 'Soil temperature', unit: 'Deg C', type: 'Sample' },
      'snow_water_equivalent_mm': { desc: 'Snow Water Equivalent', unit: 'mm H₂O', type: 'Sample' },
      'ice_content_percent': { desc: 'Ice content percentage in the snowpack', unit: '%', type: 'Sample' },
      'water_content_percent': { desc: 'Liquid water content percentage in the snowpack', unit: '%', type: 'Sample' },
      'snowpack_density_kg_m3': { desc: 'Snowpack density', unit: 'kg/m³', type: 'Sample' },
      'shortwave_radiation_in_w_m2': { desc: 'Incoming shortwave radiation', unit: 'W/m²', type: 'Sample' },
      'shortwave_radiation_out_w_m2': { desc: 'Outgoing shortwave radiation', unit: 'W/m²', type: 'Sample' },
      'longwave_radiation_in_w_m2': { desc: 'Incoming longwave radiation', unit: 'W/m²', type: 'Sample' },
      'longwave_radiation_out_w_m2': { desc: 'Outgoing longwave radiation', unit: 'W/m²', type: 'Sample' },
      'target_depth_cm': { desc: 'Target depth of snow/ice sensor', unit: 'cm', type: 'Sample' },
      'tcdt': { desc: 'Temp-Corrected Distance from depth sensor', unit: 'cm', type: 'Sample' },
      'snow_depth_cm': { desc: 'Calculated snow depth', unit: 'cm', type: 'Sample' },
      'quality_number': { desc: 'Quality number (typically 0–600 scale)', unit: 'No Unit', type: 'Sample' },
      'data_quality_flag': { desc: 'Data quality flag (0 = raw sample, 1 = median filtered)', unit: 'Flag', type: 'Flag' }
    }
  },
  'raw_env_wind_observations': {
    name: 'Wind Observations',
    description: 'Wind speed and direction measurements from meteorological stations',
    icon: Wind,
    color: 'bg-emerald-500',
    categories: {
      'Time': { icon: Clock, color: 'text-gray-600', attributes: ['timestamp'] },
      'Location': { icon: MapPin, color: 'text-green-600', attributes: ['location'] },
      'System': { icon: Activity, color: 'text-purple-600', attributes: ['id'] },
      'Wind': { icon: Wind, color: 'text-emerald-600', attributes: ['wind_direction_deg', 'wind_speed_max_ms', 'wind_speed_max_time', 'wind_speed_avg_ms', 'wind_speed_scalar_avg_ms', 'wind_direction_vector_avg_deg', 'wind_direction_sd_deg', 'wind_speed_min_ms', 'wind_speed_min_time'] }
    },
    attributes: {
      'id': { desc: 'Internal auto-increment ID', unit: 'No Unit', type: 'Identifier' },
      'timestamp': { desc: 'Timestamp of wind observation', unit: 'DateTime', type: 'No Unit' },
      'location': { desc: 'Logger/station ID', unit: 'LOC', type: 'No Unit' },
      'wind_direction_deg': { desc: 'Instantaneous wind direction', unit: 'degrees', type: 'Sample' },
      'wind_speed_max_ms': { desc: 'Maximum wind speed', unit: 'm/s', type: 'Max' },
      'wind_speed_max_time': { desc: 'Timestamp of maximum wind speed', unit: 'DateTime', type: 'Time' },
      'wind_speed_avg_ms': { desc: 'Instantaneous or average wind speed', unit: 'm/s', type: 'Avg' },
      'wind_speed_scalar_avg_ms': { desc: 'Scalar mean wind speed', unit: 'm/s', type: 'Avg' },
      'wind_direction_vector_avg_deg': { desc: 'Vector-averaged wind direction', unit: 'degrees', type: 'Avg' },
      'wind_direction_sd_deg': { desc: 'Standard deviation of wind direction', unit: 'degrees', type: 'StdDev' },
      'wind_speed_min_ms': { desc: 'Minimum wind speed', unit: 'm/s', type: 'Min' },
      'wind_speed_min_time': { desc: 'Timestamp of minimum wind speed', unit: 'DateTime', type: 'Time' }
    }
  },
  'raw_env_precipitation_observations': {
    name: 'Precipitation Observations',
    description: 'Precipitation measurements including intensity and accumulation',
    icon: Droplets,
    color: 'bg-blue-500',
    categories: {
      'Time': { icon: Clock, color: 'text-gray-600', attributes: ['timestamp'] },
      'Location': { icon: MapPin, color: 'text-green-600', attributes: ['LOCATION'] },
      'System': { icon: Activity, color: 'text-purple-600', attributes: ['id'] },
      'Precipitation': { icon: Droplets, color: 'text-blue-600', attributes: ['precip_intensity_rt_mm_min', 'precip_accum_rt_nrt_mm', 'precip_accum_nrt_mm', 'precip_total_nrt_mm', 'bucket_precip_rt_mm', 'bucket_precip_nrt_mm'] },
      'Temperature': { icon: Thermometer, color: 'text-red-600', attributes: ['load_temperature_c'] }
    },
    attributes: {
      'id': { desc: 'Unique row identifier', unit: 'No Unit', type: 'Identifier' },
      'timestamp': { desc: 'Observation time', unit: 'DateTime', type: 'No Unit' },
      'location': { desc: 'Logger or site identifier', unit: 'LOC', type: 'No Unit' },
      'precip_intensity_rt_mm_min': { desc: 'Real-time precipitation intensity', unit: 'mm/min', type: 'Sample' },
      'precip_accum_rt_nrt_mm': { desc: 'Real-time + NRT (near real-time) accumulation', unit: 'mm', type: 'Accum' },
      'precip_accum_nrt_mm': { desc: 'NRT-only accumulation', unit: 'mm', type: 'Accum' },
      'precip_total_nrt_mm': { desc: 'Total NRT accumulation', unit: 'mm', type: 'Total' },
      'bucket_precip_rt_mm': { desc: 'Real-time bucket precipitation measurement', unit: 'mm', type: 'Sample' },
      'bucket_precip_nrt_mm': { desc: 'NRT bucket precipitation measurement', unit: 'mm', type: 'Sample' },
      'load_temperature_c': { desc: 'Load sensor temperature', unit: 'Deg C', type: 'Sample' }
    }
  },
  'raw_env_snowpack_temperature_profile': {
    name: 'Snowpack Temperature Profile',
    description: 'Temperature measurements at multiple depths within snowpack from 0cm to 290cm',
    icon: Thermometer,
    color: 'bg-red-500',
    categories: {
      'Time': { icon: Clock, color: 'text-gray-600', attributes: ['timestamp'] },
      'Location': { icon: MapPin, color: 'text-green-600', attributes: ['location'] },
      'System': { icon: Activity, color: 'text-purple-600', attributes: ['id'] },
      'Temperature Profile': { icon: Thermometer, color: 'text-red-600', attributes: ['snow_temp_0cm_avg', 'snow_temp_10cm_avg', 'snow_temp_20cm_avg', 'snow_temp_30cm_avg', 'snow_temp_40cm_avg', 'snow_temp_50cm_avg', 'snow_temp_60cm_avg', 'snow_temp_70cm_avg', 'snow_temp_80cm_avg', 'snow_temp_90cm_avg', 'snow_temp_100cm_avg', 'snow_temp_110cm_avg', 'snow_temp_120cm_avg', 'snow_temp_130cm_avg', 'snow_temp_140cm_avg', 'snow_temp_150cm_avg', 'snow_temp_160cm_avg', 'snow_temp_170cm_avg', 'snow_temp_180cm_avg', 'snow_temp_190cm_avg', 'snow_temp_200cm_avg', 'snow_temp_210cm_avg', 'snow_temp_220cm_avg', 'snow_temp_230cm_avg', 'snow_temp_240cm_avg', 'snow_temp_250cm_avg', 'snow_temp_260cm_avg', 'snow_temp_270cm_avg', 'snow_temp_280cm_avg', 'snow_temp_290cm_avg'] }
    },
    attributes: {
      'id': { desc: 'Unique row identifier', unit: 'No Unit', type: 'Identifier' },
      'timestamp': { desc: 'Observation timestamp', unit: 'DateTime', type: 'No Unit' },
      'location': { desc: 'Logger/site ID', unit: 'LOC', type: 'No Unit' },
      'snow_temp_0cm_avg': { desc: 'Snow temperature at 0cm depth', unit: 'Deg C', type: 'Avg' },
      'snow_temp_10cm_avg': { desc: 'Snow temperature at 10cm depth', unit: 'Deg C', type: 'Avg' },
      'snow_temp_20cm_avg': { desc: 'Snow temperature at 20cm depth', unit: 'Deg C', type: 'Avg' },
      'snow_temp_30cm_avg': { desc: 'Snow temperature at 30cm depth', unit: 'Deg C', type: 'Avg' },
      'snow_temp_40cm_avg': { desc: 'Snow temperature at 40cm depth', unit: 'Deg C', type: 'Avg' },
      'snow_temp_50cm_avg': { desc: 'Snow temperature at 50cm depth', unit: 'Deg C', type: 'Avg' },
      'snow_temp_60cm_avg': { desc: 'Snow temperature at 60cm depth', unit: 'Deg C', type: 'Avg' },
      'snow_temp_70cm_avg': { desc: 'Snow temperature at 70cm depth', unit: 'Deg C', type: 'Avg' },
      'snow_temp_80cm_avg': { desc: 'Snow temperature at 80cm depth', unit: 'Deg C', type: 'Avg' },
      'snow_temp_90cm_avg': { desc: 'Snow temperature at 90cm depth', unit: 'Deg C', type: 'Avg' },
      'snow_temp_100cm_avg': { desc: 'Snow temperature at 100cm depth', unit: 'Deg C', type: 'Avg' },
      'snow_temp_110cm_avg': { desc: 'Snow temperature at 110cm depth', unit: 'Deg C', type: 'Avg' },
      'snow_temp_120cm_avg': { desc: 'Snow temperature at 120cm depth', unit: 'Deg C', type: 'Avg' },
      'snow_temp_130cm_avg': { desc: 'Snow temperature at 130cm depth', unit: 'Deg C', type: 'Avg' },
      'snow_temp_140cm_avg': { desc: 'Snow temperature at 140cm depth', unit: 'Deg C', type: 'Avg' },
      'snow_temp_150cm_avg': { desc: 'Snow temperature at 150cm depth', unit: 'Deg C', type: 'Avg' },
      'snow_temp_160cm_avg': { desc: 'Snow temperature at 160cm depth', unit: 'Deg C', type: 'Avg' },
      'snow_temp_170cm_avg': { desc: 'Snow temperature at 170cm depth', unit: 'Deg C', type: 'Avg' },
      'snow_temp_180cm_avg': { desc: 'Snow temperature at 180cm depth', unit: 'Deg C', type: 'Avg' },
      'snow_temp_190cm_avg': { desc: 'Snow temperature at 190cm depth', unit: 'Deg C', type: 'Avg' },
      'snow_temp_200cm_avg': { desc: 'Snow temperature at 200cm depth', unit: 'Deg C', type: 'Avg' },
      'snow_temp_210cm_avg': { desc: 'Snow temperature at 210cm depth', unit: 'Deg C', type: 'Avg' },
      'snow_temp_220cm_avg': { desc: 'Snow temperature at 220cm depth', unit: 'Deg C', type: 'Avg' },
      'snow_temp_230cm_avg': { desc: 'Snow temperature at 230cm depth', unit: 'Deg C', type: 'Avg' },
      'snow_temp_240cm_avg': { desc: 'Snow temperature at 240cm depth', unit: 'Deg C', type: 'Avg' },
      'snow_temp_250cm_avg': { desc: 'Snow temperature at 250cm depth', unit: 'Deg C', type: 'Avg' },
      'snow_temp_260cm_avg': { desc: 'Snow temperature at 260cm depth', unit: 'Deg C', type: 'Avg' },
      'snow_temp_270cm_avg': { desc: 'Snow temperature at 270cm depth', unit: 'Deg C', type: 'Avg' },
      'snow_temp_280cm_avg': { desc: 'Snow temperature at 280cm depth', unit: 'Deg C', type: 'Avg' },
      'snow_temp_290cm_avg': { desc: 'Snow temperature at 290cm depth', unit: 'Deg C', type: 'Avg' }
    }
  }
};

const InteractiveMetadata = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTable, setSelectedTable] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [selectedRegion, setSelectedRegion] = useState('');

  // Get unique regions for filtering
  const regions = [...new Set(LOCATION_DATA.map(loc => loc.region))];
  
  // Filter locations based on search and region
  const filteredLocations = LOCATION_DATA.filter(location => {
    const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         location.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = !selectedRegion || location.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  // Group locations by region
  const locationsByRegion = filteredLocations.reduce((acc, location) => {
    if (!acc[location.region]) acc[location.region] = [];
    acc[location.region].push(location);
    return acc;
  }, {} as Record<string, typeof LOCATION_DATA>);

  const toggleCategory = (tableId: string, categoryId: string) => {
    const key = `${tableId}-${categoryId}`;
    setExpandedCategories(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const LocationCard = ({ location }: { location: typeof LOCATION_DATA[0] }) => {
    const [showDetails, setShowDetails] = useState(false);
    
    return (
      <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary" className="font-mono">{location.code}</Badge>
            <Badge variant="outline" className="text-xs">{location.elev}m</Badge>
          </div>
          <h4 className="font-medium text-sm mb-1">{location.name}</h4>
          <p className="text-xs text-muted-foreground">{location.region}</p>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-2 p-0 h-auto text-xs"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Hide' : 'Show'} Details
          </Button>
          
          {showDetails && (
            <div className="mt-3 pt-3 border-t space-y-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="font-medium">Latitude:</span>
                  <p>{location.lat.toFixed(4)}°</p>
                </div>
                <div>
                  <span className="font-medium">Longitude:</span>
                  <p>{location.lng.toFixed(4)}°</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const AttributeItem = ({ attrName, tableId }: { attrName: string, tableId: string }) => {
    const attr = TABLE_DATA[tableId as keyof typeof TABLE_DATA]?.attributes[attrName];
    if (!attr) return null;

    return (
      <div className="p-3 bg-muted/30 rounded-lg">
        <div className="flex items-center justify-between mb-1">
          <span className="font-medium text-sm">{attrName}</span>
          <Badge variant="outline" className="text-xs">{attr.type}</Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-2">{attr.desc}</p>
        <div className="flex gap-4 text-xs">
          <span className="text-muted-foreground">Unit: <span className="font-mono">{attr.unit}</span></span>
          <span className="text-muted-foreground">Type: <span className="font-mono">{attr.type}</span></span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <Badge variant="outline" className="mb-4">
          <Info className="w-4 h-4 mr-2" />
          Interactive Metadata Explorer
        </Badge>
        <h2 className="text-3xl font-bold mb-4">
          Vermont Environmental <span className="text-primary">Monitoring Network</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Explore 22 monitoring locations and 4 data tables with comprehensive environmental measurements
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <MapPin className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">{LOCATION_DATA.length}</div>
            <div className="text-sm text-muted-foreground">Locations</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Database className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{Object.keys(TABLE_DATA).length}</div>
            <div className="text-sm text-muted-foreground">Data Tables</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">50+</div>
            <div className="text-sm text-muted-foreground">Attributes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TreePine className="w-8 h-8 mx-auto mb-2 text-cyan-600" />
            <div className="text-2xl font-bold">{regions.length}</div>
            <div className="text-sm text-muted-foreground">Regions</div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Location Explorer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Monitoring Locations
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedRegion === '' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedRegion('')}
              >
                All Regions
              </Button>
              {regions.map(region => (
                <Button
                  key={region}
                  variant={selectedRegion === region ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedRegion(region)}
                >
                  {region}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(locationsByRegion).map(([region, locations]) => (
              <div key={region}>
                <h3 className="font-medium text-lg mb-3 flex items-center gap-2">
                  <Badge variant="secondary">{region}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {locations.length} location{locations.length > 1 ? 's' : ''}
                  </span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {locations.map(location => (
                    <LocationCard key={location.code} location={location} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Interactive Data Tables Explorer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Tables & Attributes
          </CardTitle>
          <p className="text-muted-foreground">
            Click on tables to explore their attributes and measurement details
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(TABLE_DATA).map(([tableId, table]) => {
              const TableIcon = table.icon;
              return (
                <Card key={tableId} className="border-l-4 border-l-primary">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${table.color} text-white`}>
                        <TableIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{table.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{table.description}</p>
                      </div>
                      <div className="ml-auto">
                        <Badge variant="secondary">
                          {Object.keys(table.attributes).length} attributes
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(table.categories).map(([categoryName, category]) => {
                        const CategoryIcon = category.icon;
                        const isExpanded = expandedCategories[`${tableId}-${categoryName}`];
                        
                        return (
                          <Collapsible key={categoryName}>
                            <CollapsibleTrigger
                              onClick={() => toggleCategory(tableId, categoryName)}
                              className="flex items-center gap-2 w-full p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                            >
                              <CategoryIcon className={`h-4 w-4 ${category.color}`} />
                              <span className="font-medium">{categoryName}</span>
                              <Badge variant="outline" className="ml-auto">
                                {category.attributes.length}
                              </Badge>
                              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-6">
                                {category.attributes.map(attrName => (
                                  <AttributeItem key={attrName} attrName={attrName} tableId={tableId} />
                                ))}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Data Quality Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Data Quality & Processing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Filter className="h-4 w-4 text-amber-600" />
                Median Data Processing
              </h4>
              <p className="text-sm mb-3">
                Some attributes undergo median filtering to reduce sensor noise and improve data quality.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">0</Badge>
                  <span className="text-sm">Original unprocessed data</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">1</Badge>
                  <span className="text-sm">Median processed data</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Eye className="h-4 w-4 text-blue-600" />
                Temperature Profiles
              </h4>
              <p className="text-sm mb-3">
                Snow temperature is measured at multiple depths from surface to 290cm depth.
              </p>
              <p className="text-sm text-muted-foreground">
                Each measurement represents the average temperature at that specific depth in the snowpack.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InteractiveMetadata;