import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Database, Table, Clock, MapPin, Thermometer, Droplets, Wind, Calendar } from 'lucide-react';
import { useState } from 'react';

interface DatabaseInfo {
  name: string;
  tables: TableInfo[];
}

interface TableInfo {
  name: string;
  attributes: AttributeInfo[];
  recordCount: number;
  lastUpdated: string;
}

interface AttributeInfo {
  name: string;
  type: 'timestamp' | 'location' | 'temperature' | 'precipitation' | 'wind' | 'other';
  dataType: string;
}

const DatabaseFilter = () => {
  const [selectedDatabase, setSelectedDatabase] = useState<string>('');
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [locationFilter, setLocationFilter] = useState('');

  // Mock database structure based on your screenshots
  const databases: DatabaseInfo[] = [
    {
      name: 'CRRLL2X_VTClimateRepository',
      tables: [
        {
          name: 'TS_LOC_RECORDS',
          recordCount: 1177764,
          lastUpdated: '2025-07-18 07:50:06',
          attributes: [
            { name: 'TIMESTAMP', type: 'timestamp', dataType: 'datetime' },
            { name: 'RECORDS', type: 'other', dataType: 'int' },
            { name: 'Location', type: 'location', dataType: 'varchar' },
            { name: 'Bat_Volt_Min', type: 'other', dataType: 'float' },
            { name: 'PTTemp', type: 'temperature', dataType: 'float' },
            { name: 'AirTC_Avg', type: 'temperature', dataType: 'float' },
            { name: 'RH', type: 'other', dataType: 'float' },
            { name: 'Soil_Moisture', type: 'other', dataType: 'float' },
            { name: 'Sol_Temperature_C', type: 'temperature', dataType: 'float' },
            { name: 'SWF', type: 'other', dataType: 'float' },
            { name: 'Ice_Content', type: 'other', dataType: 'float' },
            { name: 'Water_Content', type: 'other', dataType: 'float' }
          ]
        },
        {
          name: 'wind',
          recordCount: 1388113,
          lastUpdated: '2025-07-18 07:50:06',
          attributes: [
            { name: 'TIMESTAMP', type: 'timestamp', dataType: 'datetime' },
            { name: 'RECORD', type: 'other', dataType: 'int' },
            { name: 'Location', type: 'location', dataType: 'varchar' },
            { name: 'WindDir', type: 'wind', dataType: 'float' },
            { name: 'WS_ms_Max', type: 'wind', dataType: 'float' },
            { name: 'WS_ms_TMx', type: 'wind', dataType: 'float' },
            { name: 'WS_ms', type: 'wind', dataType: 'float' },
            { name: 'WS_ms_S_WVT', type: 'wind', dataType: 'float' },
            { name: 'WindDir_D1_WVT', type: 'wind', dataType: 'float' },
            { name: 'WindDir_SD1_WVT', type: 'wind', dataType: 'float' },
            { name: 'WS_ms_Min', type: 'wind', dataType: 'float' },
            { name: 'WS_ms_TMn', type: 'wind', dataType: 'float' }
          ]
        },
        {
          name: 'precipitation',
          recordCount: 1335537,
          lastUpdated: '2025-07-18 08:50:06',
          attributes: [
            { name: 'TIMESTAMP', type: 'timestamp', dataType: 'datetime' },
            { name: 'TS_LOC_RECORD', type: 'other', dataType: 'int' },
            { name: 'RECORD', type: 'other', dataType: 'int' },
            { name: 'Location', type: 'location', dataType: 'varchar' },
            { name: 'Intensity_RT', type: 'precipitation', dataType: 'float' },
            { name: 'Accu_RT_NRT', type: 'precipitation', dataType: 'float' },
            { name: 'Accu_NRT', type: 'precipitation', dataType: 'float' },
            { name: 'Accu_total_NRT', type: 'precipitation', dataType: 'float' },
            { name: 'Bucket_RT', type: 'precipitation', dataType: 'float' },
            { name: 'Bucket_NRT', type: 'precipitation', dataType: 'float' },
            { name: 'Load_Temp', type: 'temperature', dataType: 'float' }
          ]
        }
      ]
    },
    {
      name: 'WeatherDB',
      tables: [
        {
          name: 'daily_observations',
          recordCount: 45231,
          lastUpdated: '2025-07-18 06:30:00',
          attributes: [
            { name: 'observation_date', type: 'timestamp', dataType: 'date' },
            { name: 'station_id', type: 'location', dataType: 'varchar' },
            { name: 'temperature_avg', type: 'temperature', dataType: 'float' },
            { name: 'temperature_max', type: 'temperature', dataType: 'float' },
            { name: 'temperature_min', type: 'temperature', dataType: 'float' },
            { name: 'precipitation_total', type: 'precipitation', dataType: 'float' },
            { name: 'wind_speed_avg', type: 'wind', dataType: 'float' },
            { name: 'wind_direction', type: 'wind', dataType: 'int' }
          ]
        }
      ]
    }
  ];

  const getAttributeIcon = (type: string) => {
    switch (type) {
      case 'timestamp': return <Clock className="h-3 w-3" />;
      case 'location': return <MapPin className="h-3 w-3" />;
      case 'temperature': return <Thermometer className="h-3 w-3" />;
      case 'precipitation': return <Droplets className="h-3 w-3" />;
      case 'wind': return <Wind className="h-3 w-3" />;
      default: return <Database className="h-3 w-3" />;
    }
  };

  const getAttributeColor = (type: string) => {
    switch (type) {
      case 'timestamp': return 'text-blue-600 bg-blue-50';
      case 'location': return 'text-green-600 bg-green-50';
      case 'temperature': return 'text-red-600 bg-red-50';
      case 'precipitation': return 'text-cyan-600 bg-cyan-50';
      case 'wind': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const selectedDb = databases.find(db => db.name === selectedDatabase);

  const handleTableSelect = (tableName: string, checked: boolean) => {
    if (checked) {
      setSelectedTables([...selectedTables, tableName]);
    } else {
      setSelectedTables(selectedTables.filter(t => t !== tableName));
    }
  };

  return (
    <Card className="data-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          Database Filter & Selection
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Filter data by database, tables, timestamp, and location attributes
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Database Selection */}
        <div className="space-y-2">
          <Label htmlFor="database-select">Select Database</Label>
          <Select value={selectedDatabase} onValueChange={setSelectedDatabase}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a database..." />
            </SelectTrigger>
            <SelectContent>
              {databases.map((db) => (
                <SelectItem key={db.name} value={db.name}>
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    {db.name}
                    <Badge variant="outline" className="ml-2">
                      {db.tables.length} tables
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedDb && (
          <>
            <Separator />
            
            {/* Table Selection */}
            <div className="space-y-4">
              <Label>Select Tables</Label>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {selectedDb.tables.map((table) => (
                  <Card key={table.name} className="p-3">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id={table.name}
                        checked={selectedTables.includes(table.name)}
                        onCheckedChange={(checked) => 
                          handleTableSelect(table.name, checked as boolean)
                        }
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <Label 
                            htmlFor={table.name} 
                            className="text-sm font-medium cursor-pointer flex items-center gap-2"
                          >
                            <Table className="h-4 w-4" />
                            {table.name}
                          </Label>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline">
                              {table.recordCount.toLocaleString()} records
                            </Badge>
                            <span>{table.lastUpdated}</span>
                          </div>
                        </div>
                        
                        {/* Attributes */}
                        <div className="flex flex-wrap gap-1">
                          {table.attributes.map((attr) => (
                            <Badge 
                              key={attr.name} 
                              variant="outline" 
                              className={`text-xs ${getAttributeColor(attr.type)}`}
                            >
                              {getAttributeIcon(attr.type)}
                              <span className="ml-1">{attr.name}</span>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <Separator />

            {/* Date Range Filter */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="datetime-local"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="datetime-local"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                />
              </div>
            </div>

            {/* Location Filter */}
            <div className="space-y-2">
              <Label htmlFor="location-filter">Location Filter</Label>
              <Input
                id="location-filter"
                placeholder="Filter by location (e.g., RB01, SPEAR, etc.)"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button className="flex-1">
                <Calendar className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
              <Button variant="outline" onClick={() => {
                setSelectedTables([]);
                setDateRange({ start: '', end: '' });
                setLocationFilter('');
              }}>
                Clear All
              </Button>
            </div>

            {/* Selection Summary */}
            {selectedTables.length > 0 && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-3">
                  <div className="text-sm">
                    <strong>Selected:</strong> {selectedTables.length} table(s) from {selectedDatabase}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedTables.map(table => (
                      <Badge key={table} variant="secondary" className="text-xs">
                        {table}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DatabaseFilter;