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
  { code: 'RB01', name: 'Mansfield East Ranch Brook 1', lat: 44.2619, lng: -72.8081, elev: 1200, region: 'Mansfield East' },
  { code: 'RB02', name: 'Mansfield East Ranch Brook 2', lat: 44.2625, lng: -72.8075, elev: 1180, region: 'Mansfield East' },
  { code: 'RB03', name: 'Mansfield East Ranch Brook 3', lat: 44.2631, lng: -72.8069, elev: 1160, region: 'Mansfield East' },
  { code: 'RB04', name: 'Mansfield East Ranch Brook 4', lat: 44.2637, lng: -72.8063, elev: 1140, region: 'Mansfield East' },
  { code: 'RB05', name: 'Mansfield East Ranch Brook 5', lat: 44.2643, lng: -72.8057, elev: 1120, region: 'Mansfield East' },
  { code: 'RB06', name: 'Mansfield East Ranch Brook 6', lat: 44.2649, lng: -72.8051, elev: 1100, region: 'Mansfield East' },
  { code: 'RB07', name: 'Mansfield East Ranch Brook 7', lat: 44.2655, lng: -72.8045, elev: 1080, region: 'Mansfield East' },
  { code: 'RB08', name: 'Mansfield East Ranch Brook 8', lat: 44.2661, lng: -72.8039, elev: 1060, region: 'Mansfield East' },
  { code: 'RB09', name: 'Mansfield East Ranch Brook 9', lat: 44.2667, lng: -72.8033, elev: 1040, region: 'Mansfield East' },
  { code: 'RB10', name: 'Mansfield East Ranch Brook 10', lat: 44.2673, lng: -72.8027, elev: 1020, region: 'Mansfield East' },
  { code: 'RB11', name: 'Mansfield East Ranch Brook 11', lat: 44.2679, lng: -72.8021, elev: 1000, region: 'Mansfield East' },
  { code: 'RB12', name: 'Mansfield East FEMC', lat: 44.2685, lng: -72.8015, elev: 980, region: 'Mansfield East' },
  { code: 'SPER', name: 'Spear Street', lat: 44.4759, lng: -73.1959, elev: 120, region: 'Urban' },
  { code: 'SR01', name: 'Sleepers R3/Main', lat: 44.2891, lng: -72.8211, elev: 900, region: 'Sleepers River' },
  { code: 'SR11', name: 'Sleepers W1/R11', lat: 44.2885, lng: -72.8205, elev: 920, region: 'Sleepers River' },
  { code: 'SR25', name: 'Sleepers R25', lat: 44.2879, lng: -72.8199, elev: 940, region: 'Sleepers River' },
  { code: 'JRCL', name: 'Jericho clearing', lat: 44.4919, lng: -72.9659, elev: 300, region: 'Jericho' },
  { code: 'JRFO', name: 'Jericho Forest', lat: 44.4925, lng: -72.9665, elev: 320, region: 'Jericho' },
  { code: 'PROC', name: 'Mansfield West Proctor', lat: 44.2561, lng: -72.8141, elev: 1300, region: 'Mansfield West' },
  { code: 'PTSH', name: 'Potash Brook', lat: 44.2567, lng: -72.8147, elev: 1280, region: 'Mansfield West' },
  { code: 'SUMM', name: 'Mansfield SUMMIT', lat: 44.2573, lng: -72.8153, elev: 1339, region: 'Mansfield West' },
  { code: 'UNDR', name: 'Mansfield West SCAN', lat: 44.2555, lng: -72.8135, elev: 1260, region: 'Mansfield West' }
];

const TABLE_DATA = {
  'table1': {
    name: 'Primary Environmental Data',
    description: 'Comprehensive environmental measurements including temperature, humidity, soil conditions, and radiation',
    icon: Database,
    color: 'bg-blue-500',
    categories: {
      'Time': { icon: Clock, color: 'text-gray-600', attributes: ['TS_LOC_REC', 'TIMESTAMP'] },
      'Location': { icon: MapPin, color: 'text-green-600', attributes: ['LOCATION'] },
      'System': { icon: Activity, color: 'text-purple-600', attributes: ['Record', 'Batt_Volt_Min'] },
      'Temperature': { icon: Thermometer, color: 'text-red-600', attributes: ['P_Temp', 'AirTC_Avg', 'Soil_Temperature_C'] },
      'Humidity': { icon: Droplets, color: 'text-blue-600', attributes: ['RH'] },
      'Radiation': { icon: Zap, color: 'text-yellow-600', attributes: ['SHF', 'SW_in', 'SW_out', 'LW_in', 'LW_out'] },
      'Soil': { icon: TreePine, color: 'text-green-700', attributes: ['Soil_Moisture'] },
      'Snow': { icon: Cloud, color: 'text-cyan-600', attributes: ['SWE', 'Ice_content', 'Water_Content', 'Snowpack_Density', 'Target_Depth', 'TCDT', 'DBTCDT', 'Target_Depth_Med', 'TCDT_Med', 'DBTCDT_Med'] },
      'Quality': { icon: Info, color: 'text-orange-600', attributes: ['Qual', 'Qual_Med', 'DataQualityFlag'] }
    },
    attributes: {
      'TS_LOC_REC': { desc: 'TimeStamp Location Record', unit: 'No_Unit', type: 'No_Unit' },
      'TIMESTAMP': { desc: 'TimeStamp', unit: 'TS', type: 'No_Unit' },
      'LOCATION': { desc: 'Location', unit: 'LOC', type: 'No_Unit' },
      'Record': { desc: 'Record Number', unit: 'RN', type: 'No Unit' },
      'Batt_Volt_Min': { desc: 'Battery Voltage', unit: 'Volts', type: 'Min' },
      'P_Temp': { desc: 'Panel Temperature (Reference)', unit: 'Deg C', type: 'smp' },
      'AirTC_Avg': { desc: 'Air Temperature Average', unit: 'Deg C', type: 'Avg' },
      'RH': { desc: 'Relative Humidity', unit: '%', type: 'Smp' },
      'SHF': { desc: 'Soil Heat Flux', unit: 'W/m²', type: 'smp' },
      'Soil_Moisture': { desc: 'Soil Moisture', unit: 'wfv', type: 'smp' },
      'Soil_Temperature_C': { desc: 'Soil Temperature', unit: 'Deg C', type: 'smp' },
      'SWE': { desc: 'Snow Water Equivalent', unit: 'mm H₂O', type: 'smp' },
      'Ice_content': { desc: 'Ice Content of SnowPack', unit: '%', type: 'smp' },
      'Water_Content': { desc: 'Water Content of SnowPack', unit: '%', type: 'smp' },
      'Snowpack_Density': { desc: 'Snowpack Density', unit: 'kg/m³', type: 'smp' },
      'SW_in': { desc: 'Shortwave Radiation Incoming', unit: 'W/m²', type: 'smp' },
      'SW_out': { desc: 'Shortwave Radiation Outgoing', unit: 'W/m²', type: 'smp' },
      'LW_in': { desc: 'Longwave Radiation Incoming', unit: 'W/m²', type: 'smp' },
      'LW_out': { desc: 'Longwave Radiation Outgoing', unit: 'W/m²', type: 'smp' },
      'Target_Depth': { desc: 'Target Depth', unit: 'cm', type: 'smp' },
      'Qual': { desc: 'Quality Numbers (Snow Sensor)', unit: 'No Unit', type: 'smp' },
      'TCDT': { desc: 'Temperature Corrected Distance', unit: 'cm', type: 'smp' },
      'DBTCDT': { desc: 'Snow Depth', unit: 'cm', type: 'smp' },
      'Target_Depth_Med': { desc: 'Target Depth (Median)', unit: 'cm', type: 'Med' },
      'Qual_Med': { desc: 'Quality Numbers (Median)', unit: 'No Unit', type: 'Med' },
      'TCDT_Med': { desc: 'Temperature Corrected Distance (Median)', unit: 'cm', type: 'Med' },
      'DBTCDT_Med': { desc: 'Snow Depth (Median)', unit: 'cm', type: 'Med' },
      'DataQualityFlag': { desc: 'Data Quality Flag (1=Median, 0=Original)', unit: 'Flag', type: 'Flag' }
    }
  },
  'Wind': {
    name: 'Wind Measurements',
    description: 'Wind speed and direction from meteorological stations',
    icon: Wind,
    color: 'bg-emerald-500',
    categories: {
      'Time': { icon: Clock, color: 'text-gray-600', attributes: ['TIMESTAMP'] },
      'Location': { icon: MapPin, color: 'text-green-600', attributes: ['LOCATION'] },
      'System': { icon: Activity, color: 'text-purple-600', attributes: ['Record'] },
      'Wind': { icon: Wind, color: 'text-emerald-600', attributes: ['WindDir', 'WS_ms_Max', 'WS_ms_TMx', 'WS_ms', 'WS_ms_S_WVT', 'WindDir_D1_WVT', 'WindDir_SD1_WVT', 'WS_ms_Min', 'WS_ms_TMn'] }
    },
    attributes: {
      'TIMESTAMP': { desc: 'TimeStamp', unit: 'TS', type: 'No_Unit' },
      'LOCATION': { desc: 'Location', unit: 'LOC', type: 'No_Unit' },
      'Record': { desc: 'Record Number', unit: 'RN', type: 'No Unit' },
      'WindDir': { desc: 'Wind Direction', unit: 'degrees', type: 'smp' },
      'WS_ms_Max': { desc: 'Maximum Wind Speed', unit: 'm/s', type: 'Max' },
      'WS_ms_TMx': { desc: 'Wind Speed at Time of Max', unit: 'm/s', type: 'TMx' },
      'WS_ms': { desc: 'Wind Speed', unit: 'm/s', type: 'smp' },
      'WS_ms_S_WVT': { desc: 'Wind Speed Standard Deviation', unit: 'm/s', type: 'Wvc' },
      'WindDir_D1_WVT': { desc: 'Wind Direction Vector', unit: 'degrees', type: 'Wvc' },
      'WindDir_SD1_WVT': { desc: 'Wind Direction Standard Deviation', unit: 'degrees', type: 'Wvc' },
      'WS_ms_Min': { desc: 'Minimum Wind Speed', unit: 'm/s', type: 'Min' },
      'WS_ms_TMn': { desc: 'Wind Speed at Time of Min', unit: 'm/s', type: 'TMn' }
    }
  },
  'Precipitation': {
    name: 'Precipitation Data',
    description: 'Precipitation measurements including intensity and accumulation',
    icon: Droplets,
    color: 'bg-blue-500',
    categories: {
      'Time': { icon: Clock, color: 'text-gray-600', attributes: ['TIMESTAMP'] },
      'Location': { icon: MapPin, color: 'text-green-600', attributes: ['LOCATION'] },
      'System': { icon: Activity, color: 'text-purple-600', attributes: ['Record'] },
      'Precipitation': { icon: Droplets, color: 'text-blue-600', attributes: ['Intensity_RT', 'Accu_NRT', 'Accu_RT_NRT', 'Accu_Total_NRT', 'Bucket_NRT', 'Bucket_RT'] },
      'Temperature': { icon: Thermometer, color: 'text-red-600', attributes: ['Load_Temp'] }
    },
    attributes: {
      'TIMESTAMP': { desc: 'TimeStamp', unit: 'TS', type: 'No_Unit' },
      'LOCATION': { desc: 'Location', unit: 'LOC', type: 'No_Unit' },
      'Record': { desc: 'Record Number', unit: 'RN', type: 'No Unit' },
      'Intensity_RT': { desc: 'Real-time Precipitation Intensity', unit: 'mm/min', type: 'smp' },
      'Accu_NRT': { desc: 'Accumulated Non-real-time Precipitation', unit: 'mm', type: 'smp' },
      'Accu_RT_NRT': { desc: 'Accumulated RT - NRT Precipitation', unit: 'mm', type: 'smp' },
      'Accu_Total_NRT': { desc: 'Total Accumulated NRT Precipitation', unit: 'mm', type: 'smp' },
      'Bucket_NRT': { desc: 'Bucket Precipitation (Non-real-time)', unit: 'mm', type: 'smp' },
      'Bucket_RT': { desc: 'Bucket Precipitation (Real-time)', unit: 'mm', type: 'smp' },
      'Load_Temp': { desc: 'Load Temperature (Battery)', unit: 'Deg C', type: 'smp' }
    }
  },
  'SnowPkTempProfile': {
    name: 'Snow Temperature Profile',
    description: 'Snowpack temperature at depths 0-290cm',
    icon: TreePine,
    color: 'bg-cyan-500',
    categories: {
      'Time': { icon: Clock, color: 'text-gray-600', attributes: ['TIMESTAMP'] },
      'Location': { icon: MapPin, color: 'text-green-600', attributes: ['LOCATION'] },
      'System': { icon: Activity, color: 'text-purple-600', attributes: ['Record'] },
      'Temperature Profile': { icon: Thermometer, color: 'text-red-600', attributes: ['T107_C_0cm_Avg', 'T107_C_5cm_Avg', 'T107_C_10cm_Avg', 'T107_C_15cm_Avg', 'T107_C_20cm_Avg', 'T107_C_30cm_Avg', 'T107_C_50cm_Avg', 'T107_C_100cm_Avg', 'T107_C_150cm_Avg', 'T107_C_200cm_Avg', 'T107_C_250cm_Avg', 'T107_C_290cm_Avg'] }
    },
    attributes: {
      'TIMESTAMP': { desc: 'TimeStamp', unit: 'TS', type: 'No_Unit' },
      'LOCATION': { desc: 'Location', unit: 'LOC', type: 'No_Unit' },
      'Record': { desc: 'Record Number', unit: 'RN', type: 'No Unit' },
      'T107_C_0cm_Avg': { desc: 'Snow Temperature at 0cm depth', unit: 'Deg C', type: 'Avg' },
      'T107_C_5cm_Avg': { desc: 'Snow Temperature at 5cm depth', unit: 'Deg C', type: 'Avg' },
      'T107_C_10cm_Avg': { desc: 'Snow Temperature at 10cm depth', unit: 'Deg C', type: 'Avg' },
      'T107_C_15cm_Avg': { desc: 'Snow Temperature at 15cm depth', unit: 'Deg C', type: 'Avg' },
      'T107_C_20cm_Avg': { desc: 'Snow Temperature at 20cm depth', unit: 'Deg C', type: 'Avg' },
      'T107_C_30cm_Avg': { desc: 'Snow Temperature at 30cm depth', unit: 'Deg C', type: 'Avg' },
      'T107_C_50cm_Avg': { desc: 'Snow Temperature at 50cm depth', unit: 'Deg C', type: 'Avg' },
      'T107_C_100cm_Avg': { desc: 'Snow Temperature at 100cm depth', unit: 'Deg C', type: 'Avg' },
      'T107_C_150cm_Avg': { desc: 'Snow Temperature at 150cm depth', unit: 'Deg C', type: 'Avg' },
      'T107_C_200cm_Avg': { desc: 'Snow Temperature at 200cm depth', unit: 'Deg C', type: 'Avg' },
      'T107_C_250cm_Avg': { desc: 'Snow Temperature at 250cm depth', unit: 'Deg C', type: 'Avg' },
      'T107_C_290cm_Avg': { desc: 'Snow Temperature at 290cm depth', unit: 'Deg C', type: 'Avg' }
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
            <div className="text-2xl font-bold">22</div>
            <div className="text-sm text-muted-foreground">Locations</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Database className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">4</div>
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
            <div className="text-2xl font-bold">5</div>
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