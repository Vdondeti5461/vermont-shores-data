import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Database, FileText, Info } from 'lucide-react';

interface LocationMetadata {
  code: string;
  name: string;
  latitude: number;
  longitude: number;
  elevation: number;
}

interface AttributeMetadata {
  description: string;
  unit: string;
  measurement_type: string;
  category: string;
}

interface TableMetadata {
  displayName: string;
  description: string;
  attributes: Record<string, AttributeMetadata>;
}

const LOCATION_METADATA: Record<string, LocationMetadata> = {
  'RB01': { code: 'RB01', name: 'Mansfield East Ranch Brook 1', latitude: 44.5232, longitude: -72.8086, elevation: 1075 },
  'RB02': { code: 'RB02', name: 'Mansfield East Ranch Brook 2', latitude: 44.5178, longitude: -72.8104, elevation: 910 },
  'RB03': { code: 'RB03', name: 'Mansfield East Ranch Brook 3', latitude: 44.5148, longitude: -72.8091, elevation: 795 },
  'RB04': { code: 'RB04', name: 'Mansfield East Ranch Brook 4', latitude: 44.5110, longitude: -72.8028, elevation: 640 },
  'RB05': { code: 'RB05', name: 'Mansfield East Ranch Brook 5', latitude: 44.5045, longitude: -72.7995, elevation: 505 },
  'RB06': { code: 'RB06', name: 'Mansfield East Ranch Brook 6', latitude: 44.5037, longitude: -72.7835, elevation: 414 },
  'RB07': { code: 'RB07', name: 'Mansfield East Ranch Brook 7', latitude: 44.5153, longitude: -72.7851, elevation: 613 },
  'RB08': { code: 'RB08', name: 'Mansfield East Ranch Brook 8', latitude: 44.5095, longitude: -72.7021, elevation: 472 },
  'RB09': { code: 'RB09', name: 'Mansfield East Ranch Brook 9', latitude: 44.4891, longitude: -72.7929, elevation: 847 },
  'RB10': { code: 'RB10', name: 'Mansfield East Ranch Brook 10', latitude: 44.4951, longitude: -72.7864, elevation: 624 },
  'RB11': { code: 'RB11', name: 'Mansfield East Ranch Brook 11', latitude: 44.5055, longitude: -72.7714, elevation: 388 },
  'RB12': { code: 'RB12', name: 'Mansfield East FEMC', latitude: 44.5188, longitude: -72.7985, elevation: 884 },
  'SPST': { code: 'SPST', name: 'Spear Street', latitude: 44.4526, longitude: -73.1918, elevation: 87 },
  'SR01': { code: 'SR01', name: 'Sleepers R3/Main', latitude: 44.4830, longitude: -72.1646, elevation: 553 },
  'SR11': { code: 'SR11', name: 'Sleepers W1/R11', latitude: 44.4500, longitude: -72.0671, elevation: 225 },
  'SR25': { code: 'SR25', name: 'Sleepers R25', latitude: 44.4768, longitude: -72.1258, elevation: 357 },
  'JRCL': { code: 'JRCL', name: 'Jericho clearing', latitude: 44.4479, longitude: -73.0023, elevation: 199 },
  'JRFO': { code: 'JRFO', name: 'Jericho Forest', latitude: 44.4478, longitude: -73.0027, elevation: 196 },
  'PROC': { code: 'PROC', name: 'Mansfield West Proctor', latitude: 44.5286, longitude: -72.8867, elevation: 418 },
  'PTSH': { code: 'PTSH', name: 'Potash Brook', latitude: 44.4449, longitude: -73.2143, elevation: 45 },
  'SUMM': { code: 'SUMM', name: 'Mansfield SUMMIT', latitude: 44.5280, longitude: -72.8150, elevation: 1169 },
  'UNDR': { code: 'UNDR', name: 'Mansfield West SCAN', latitude: 44.5351, longitude: -72.8346, elevation: 698 }
};

const TABLE_METADATA: Record<string, TableMetadata> = {
  'table1': {
    displayName: 'Primary Environmental Data (Table1)',
    description: 'Comprehensive environmental measurements including temperature, humidity, soil conditions, and radiation',
    attributes: {
      'TS_LOC_REC': { description: 'TimeStamp Location Record', unit: 'No_Unit', measurement_type: 'No_Unit', category: 'System' },
      'TIMESTAMP': { description: 'TimeStamp', unit: 'TS', measurement_type: 'No_Unit', category: 'Time' },
      'LOCATION': { description: 'Location', unit: 'LOC', measurement_type: 'No_Unit', category: 'Location' },
      'Record': { description: 'Record Number', unit: 'RN', measurement_type: 'No Unit', category: 'System' },
      'Batt_Volt_Min': { description: 'Battery Voltage', unit: 'Volts', measurement_type: 'Min', category: 'System' },
      'P_Temp': { description: 'Panel Temperature (Reference Temperature Measurement)', unit: 'Deg C', measurement_type: 'smp', category: 'Temperature' },
      'AirTC_Avg': { description: 'Air Temperature Average in Celsius', unit: 'Deg C', measurement_type: 'Avg', category: 'Temperature' },
      'RH': { description: 'Relative Humidity', unit: '%', measurement_type: 'Smp', category: 'Humidity' },
      'SHF': { description: 'Soil Heat Flux (radiation Parameter)', unit: 'W/m^2', measurement_type: 'smp', category: 'Radiation' },
      'Soil_Moisture': { description: 'Soil Moisture', unit: 'wfv', measurement_type: 'smp', category: 'Soil' },
      'Soil_Temperature_C': { description: 'Soil Temperature in Celsius', unit: 'Deg C', measurement_type: 'smp', category: 'Temperature' },
      'SWE': { description: 'Snow water Equivalent', unit: 'mm of H20', measurement_type: 'smp', category: 'Snow' },
      'Ice_content': { description: 'Ice content of SnowPack', unit: '%', measurement_type: 'smp', category: 'Snow' },
      'Water_Content': { description: 'Water Content of SnowPack', unit: '%', measurement_type: 'smp', category: 'Snow' },
      'Snowpack_Density': { description: 'Snowpack Density', unit: 'kg/m^3', measurement_type: 'smp', category: 'Snow' },
      'SW_in': { description: 'Short wave radiation incoming', unit: 'W/m^2', measurement_type: 'smp', category: 'Radiation' },
      'SW_out': { description: 'Short wave radiation outgoing', unit: 'W/m^2', measurement_type: 'smp', category: 'Radiation' },
      'LW_in': { description: 'Longwave radiation incoming', unit: 'W/m^2', measurement_type: 'smp', category: 'Radiation' },
      'LW_out': { description: 'Longwave radiation outgoing', unit: 'W/m^2', measurement_type: 'smp', category: 'Radiation' },
      'Target_Depth': { description: 'Target depth', unit: 'cm', measurement_type: 'smp', category: 'Snow' },
      'Qual': { description: 'Quality numbers (snow sensor)', unit: 'No Unit', measurement_type: 'smp', category: 'Quality' },
      'TCDT': { description: 'Temperature corrected distance value', unit: 'cm', measurement_type: 'smp', category: 'Snow' },
      'DBTCDT': { description: 'Snow Depth', unit: 'cm', measurement_type: 'smp', category: 'Snow' },
      'Target_Depth_Med': { description: 'Target depth', unit: 'cm', measurement_type: 'Med', category: 'Snow' },
      'Qual_Med': { description: 'Quality numbers (snow sensor)', unit: 'No Unit', measurement_type: 'Med', category: 'Quality' },
      'TCDT_Med': { description: 'Temperature corrected distance value', unit: 'cm', measurement_type: 'Med', category: 'Snow' },
      'DBTCDT_Med': { description: 'Snow Depth', unit: 'cm', measurement_type: 'Med', category: 'Snow' },
      'DataQualityFlag': { description: 'Data Quality Flag (1=Median Data, 0=Original Data)', unit: 'Flag', measurement_type: 'Flag', category: 'Quality' }
    }
  },
  'Wind': {
    displayName: 'Wind Measurements',
    description: 'Wind speed and direction measurements from meteorological stations',
    attributes: {
      'TIMESTAMP': { description: 'TimeStamp', unit: 'TS', measurement_type: 'No_Unit', category: 'Time' },
      'LOCATION': { description: 'Location', unit: 'LOC', measurement_type: 'No_Unit', category: 'Location' },
      'Record': { description: 'Record Number', unit: 'RN', measurement_type: 'No Unit', category: 'System' },
      'WindDir': { description: 'Wind Direction', unit: 'deg', measurement_type: 'smp', category: 'Wind' },
      'WS_ms_Max': { description: 'Max wind speed', unit: 'meters/second', measurement_type: 'Max', category: 'Wind' },
      'WS_ms_TMx': { description: 'Wind Speed', unit: 'meters/second', measurement_type: 'TMx', category: 'Wind' },
      'WS_ms': { description: 'Wind speed', unit: 'meters/second', measurement_type: 'smp', category: 'Wind' },
      'WS_ms_S_WVT': { description: 'Wind Speed Standard Deviation', unit: 'meters/second', measurement_type: 'Wvc', category: 'Wind' },
      'WindDir_D1_WVT': { description: 'Wind Direction Vector', unit: 'Deg', measurement_type: 'Wvc', category: 'Wind' },
      'WindDir_SD1_WVT': { description: 'Wind Direction Standard Deviation', unit: 'Deg', measurement_type: 'Wvc', category: 'Wind' },
      'WS_ms_Min': { description: 'Min wind speed', unit: 'meters/second', measurement_type: 'Min', category: 'Wind' },
      'WS_ms_TMn': { description: 'Wind Speed', unit: 'meters/second', measurement_type: 'TMn', category: 'Wind' }
    }
  },
  'Precipitation': {
    displayName: 'Precipitation Data',
    description: 'Precipitation measurements including intensity, accumulation, and bucket data',
    attributes: {
      'TIMESTAMP': { description: 'TimeStamp', unit: 'TS', measurement_type: 'No_Unit', category: 'Time' },
      'LOCATION': { description: 'Location', unit: 'LOC', measurement_type: 'No_Unit', category: 'Location' },
      'Record': { description: 'Record Number', unit: 'RN', measurement_type: 'No Unit', category: 'System' },
      'Intensity_RT': { description: 'Intensity Real time', unit: 'mm/min', measurement_type: 'smp', category: 'Precipitation' },
      'Accu_NRT': { description: 'Accumulated Non real time Precipitation', unit: 'mm', measurement_type: 'smp', category: 'Precipitation' },
      'Accu_RT_NRT': { description: 'Accumulated real time - Non Real time Precipitation', unit: 'mm', measurement_type: 'smp', category: 'Precipitation' },
      'Accu_Total_NRT': { description: 'Accumulated Total Non real time Precipitation', unit: 'mm', measurement_type: 'smp', category: 'Precipitation' },
      'Bucket_NRT': { description: 'Bucket Precipitation Non real time', unit: 'mm', measurement_type: 'smp', category: 'Precipitation' },
      'Bucket_RT': { description: 'Bucket Precipitation real time', unit: 'mm', measurement_type: 'smp', category: 'Precipitation' },
      'Load_Temp': { description: 'Load Temperature (Battery)', unit: 'Deg C', measurement_type: 'smp', category: 'Temperature' }
    }
  },
  'SnowPkTempProfile': {
    displayName: 'Snow Pack Temperature Profile',
    description: 'Snowpack temperature measurements at various depths from 0cm to 290cm',
    attributes: {
      'TIMESTAMP': { description: 'TimeStamp', unit: 'TS', measurement_type: 'No_Unit', category: 'Time' },
      'LOCATION': { description: 'Location', unit: 'LOC', measurement_type: 'No_Unit', category: 'Location' },
      'Record': { description: 'Record Number', unit: 'RN', measurement_type: 'No Unit', category: 'System' },
      'T107_C_0cm_Avg': { description: 'Snowpack temperature profile at 0 CM', unit: 'Deg C', measurement_type: 'Avg', category: 'Temperature Profile' },
      'T107_C_5cm_Avg': { description: 'Snowpack temperature profile at 5 CM', unit: 'Deg C', measurement_type: 'Avg', category: 'Temperature Profile' },
      'T107_C_10cm_Avg': { description: 'Snowpack temperature profile at 10 CM', unit: 'Deg C', measurement_type: 'Avg', category: 'Temperature Profile' },
      'T107_C_15cm_Avg': { description: 'Snowpack temperature profile at 15 CM', unit: 'Deg C', measurement_type: 'Avg', category: 'Temperature Profile' },
      'T107_C_20cm_Avg': { description: 'Snowpack temperature profile at 20 CM', unit: 'Deg C', measurement_type: 'Avg', category: 'Temperature Profile' },
      'T107_C_30cm_Avg': { description: 'Snowpack temperature profile at 30 CM', unit: 'Deg C', measurement_type: 'Avg', category: 'Temperature Profile' },
      'T107_C_50cm_Avg': { description: 'Snowpack temperature profile at 50 CM', unit: 'Deg C', measurement_type: 'Avg', category: 'Temperature Profile' },
      'T107_C_100cm_Avg': { description: 'Snowpack temperature profile at 100 CM', unit: 'Deg C', measurement_type: 'Avg', category: 'Temperature Profile' },
      'T107_C_150cm_Avg': { description: 'Snowpack temperature profile at 150 CM', unit: 'Deg C', measurement_type: 'Avg', category: 'Temperature Profile' },
      'T107_C_200cm_Avg': { description: 'Snowpack temperature profile at 200 CM', unit: 'Deg C', measurement_type: 'Avg', category: 'Temperature Profile' },
      'T107_C_250cm_Avg': { description: 'Snowpack temperature profile at 250 CM', unit: 'Deg C', measurement_type: 'Avg', category: 'Temperature Profile' },
      'T107_C_290cm_Avg': { description: 'Snowpack temperature profile at 290 CM', unit: 'Deg C', measurement_type: 'Avg', category: 'Temperature Profile' }
    }
  }
};

const MetadataDisplay = () => {
  // Group attributes by category for better display
  const getGroupedAttributes = (attributes: Record<string, AttributeMetadata>) => {
    return Object.entries(attributes).reduce((groups, [name, attr]) => {
      const category = attr.category || 'Other';
      if (!groups[category]) groups[category] = [];
      groups[category].push({ name, ...attr });
      return groups;
    }, {} as Record<string, Array<{ name: string } & AttributeMetadata>>);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Badge variant="outline" className="mb-4">
          <Info className="w-4 h-4 mr-2" />
          Project Metadata
        </Badge>
        <h2 className="scientific-heading text-3xl md:text-4xl mb-4">
          CRREL S2S <span className="text-primary">Project</span> Metadata
        </h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Comprehensive information about monitoring locations and data attributes across Vermont's 
          Summit-to-Shore environmental monitoring network.
        </p>
      </div>

      <Tabs defaultValue="locations" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="locations">Locations (22)</TabsTrigger>
          <TabsTrigger value="tables">Data Tables (4)</TabsTrigger>
          <TabsTrigger value="quality">Data Quality</TabsTrigger>
        </TabsList>

        <TabsContent value="locations" className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location Information in Vermont
              </CardTitle>
              <p className="text-muted-foreground">
                22 monitoring locations installed across Vermont for comprehensive environmental data collection
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(LOCATION_METADATA).map(([code, location]) => (
                  <div key={code} className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">{code}</Badge>
                      <span className="text-xs text-muted-foreground">{location.elevation}m</span>
                    </div>
                    <h4 className="font-medium mb-2">{location.name}</h4>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>Lat: {location.latitude.toFixed(4)}°</p>
                      <p>Lon: {location.longitude.toFixed(4)}°</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tables" className="mt-8">
          <div className="space-y-6">
            {Object.entries(TABLE_METADATA).map(([tableName, metadata]) => (
              <Card key={tableName}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    {metadata.displayName}
                  </CardTitle>
                  <p className="text-muted-foreground">{metadata.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(getGroupedAttributes(metadata.attributes)).map(([category, attributes]) => (
                      <div key={category}>
                        <h4 className="font-medium text-primary mb-3">{category}</h4>
                        <div className="grid gap-3 md:grid-cols-2">
                          {attributes.map((attr) => (
                            <div key={attr.name} className="p-3 bg-muted/30 rounded-lg">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-sm">{attr.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {attr.measurement_type}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mb-1">
                                {attr.description}
                              </p>
                              <p className="text-xs font-mono bg-muted px-2 py-1 rounded">
                                Unit: {attr.unit}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="quality" className="mt-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Data Quality Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Median Data Processing</h4>
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                      For certain snow measurement attributes, we collect median data to improve accuracy and reduce sensor noise.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium mb-2">Original Attributes:</h5>
                        <ul className="text-sm space-y-1">
                          <li>• Target_Depth</li>
                          <li>• Qual (Quality numbers)</li>
                          <li>• TCDT (Temperature corrected distance)</li>
                          <li>• DBTCDT (Snow Depth)</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium mb-2">Median Versions:</h5>
                        <ul className="text-sm space-y-1">
                          <li>• Target_Depth_Med</li>
                          <li>• Qual_Med</li>
                          <li>• TCDT_Med</li>
                          <li>• DBTCDT_Med</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Data Quality Flag</h4>
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                    <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
                      <strong>DataQualityFlag</strong> indicates the type of data processing applied:
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">1</Badge>
                        <span className="text-sm">Median processed data</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">0</Badge>
                        <span className="text-sm">Original unprocessed data</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Temperature Profile Data</h4>
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                      SnowPkTempProfile table contains temperature measurements at various depths:
                    </p>
                    <p className="text-sm text-green-800 dark:text-green-200">
                      <strong>T107_C_[XXX]cm_Avg</strong> - Temperature measurements from 0cm to 290cm depth in 10cm increments
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MetadataDisplay;