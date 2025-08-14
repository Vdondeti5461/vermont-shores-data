import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileSpreadsheet, Database, Calendar, MapPin, Filter, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface Location {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  status?: string;
}

const DataDownload = () => {
  const { toast } = useToast();
  const [selectedLocations, setSelectedLocations] = useState<number[]>([]);
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>('');

  // Fetch locations from MySQL database
  const { data: locationsData, isLoading: locationsLoading, error: locationsError } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const response = await fetch('/functions/v1/get-locations', {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch locations');
      }
      return response.json();
    },
  });

  const locations: Location[] = locationsData?.locations || [];

  const seasons = [
    { value: 'spring-2024', label: 'Spring 2024' },
    { value: 'winter-2024', label: 'Winter 2023-2024' },
    { value: 'fall-2023', label: 'Fall 2023' },
    { value: 'summer-2023', label: 'Summer 2023' },
    { value: 'all-2024', label: 'All 2024 Data' },
    { value: 'custom', label: 'Custom Date Range' }
  ];

  // Data types based on your actual MySQL tables
  const dataTypes = [
    { id: 'precipitation', label: 'Precipitation Data (mm)', description: 'From precipitation table' },
    { id: 'SnowpkTempProfile', label: 'Snow Pack Temperature Profile', description: 'Temperature data from snow pack sensors' },
    { id: 'table1', label: 'General Environmental Data', description: 'Primary environmental measurements' },
    { id: 'Wind', label: 'Wind Data (Speed & Direction)', description: 'Wind measurements in m/s and degrees' }
  ];

  const formats = [
    { id: 'csv', label: 'CSV', description: 'Comma-separated values for Excel/R/Python' },
    { id: 'json', label: 'JSON', description: 'JavaScript Object Notation for APIs' },
    { id: 'netcdf', label: 'NetCDF', description: 'Network Common Data Form for scientific computing' },
    { id: 'hdf5', label: 'HDF5', description: 'Hierarchical Data Format for large datasets' }
  ];

  return (
    <section id="download" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Open Data Access
          </Badge>
          <h2 className="scientific-heading text-4xl md:text-5xl mb-6">
            <span className="text-primary">Download</span> Research Data
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Access comprehensive environmental datasets from Vermont's Summit 2 Shore monitoring network. 
            Filter by location, season, and data type to get exactly what you need for your research.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Data Selection Panel */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="data-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-primary" />
                  Data Selection Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Season Selection */}
                <div>
                  <label className="data-label mb-3 block">Select Season/Time Period</label>
                  <Select onValueChange={setSelectedSeason} value={selectedSeason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a time period" />
                    </SelectTrigger>
                    <SelectContent>
                      {seasons.map((season) => (
                        <SelectItem key={season.value} value={season.value}>
                          {season.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location Selection */}
                <div>
                  <label className="data-label mb-3 block">Monitoring Locations ({locations.length} sites)</label>
                  {locationsLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                      <p className="text-sm text-muted-foreground mt-2">Loading locations...</p>
                    </div>
                  ) : locationsError ? (
                    <div className="text-center py-4">
                      <AlertCircle className="h-6 w-6 mx-auto mb-2 text-destructive" />
                      <p className="text-sm text-destructive">Failed to load locations</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                      {locations.map((location) => (
                        <div key={location.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`location-${location.id}`}
                            checked={selectedLocations.includes(location.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedLocations([...selectedLocations, location.id]);
                              } else {
                                setSelectedLocations(selectedLocations.filter(id => id !== location.id));
                              }
                            }}
                          />
                          <label 
                            htmlFor={`location-${location.id}`} 
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {location.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Data Type Selection */}
                <div>
                  <label className="data-label mb-3 block">Environmental Parameters (Database Tables)</label>
                  <div className="space-y-3">
                    {dataTypes.map((type) => (
                      <Card key={type.id} className="cursor-pointer hover:bg-primary/5 transition-colors border-2 border-transparent hover:border-primary/20">
                        <CardContent className="p-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <Checkbox 
                              id={type.id}
                              checked={selectedDataTypes.includes(type.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedDataTypes([...selectedDataTypes, type.id]);
                                } else {
                                  setSelectedDataTypes(selectedDataTypes.filter(id => id !== type.id));
                                }
                              }}
                            />
                            <label 
                              htmlFor={type.id} 
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {type.label}
                            </label>
                          </div>
                          <p className="text-xs text-muted-foreground">{type.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* File Format Selection */}
                <div>
                  <label className="data-label mb-3 block">Output Format</label>
                  <div className="grid md:grid-cols-2 gap-4">
                    {formats.map((format) => (
                      <Card key={format.id} className="cursor-pointer hover:bg-primary/5 transition-colors border-2 border-transparent hover:border-primary/20">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Checkbox 
                              id={format.id}
                              checked={selectedFormats.includes(format.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedFormats([...selectedFormats, format.id]);
                                } else {
                                  setSelectedFormats(selectedFormats.filter(id => id !== format.id));
                                }
                              }}
                            />
                            <label htmlFor={format.id} className="font-medium">
                              {format.label}
                            </label>
                          </div>
                          <p className="text-xs text-muted-foreground">{format.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Download Summary */}
          <div className="space-y-6">
            <Card className="data-card">
              <CardHeader>
                <CardTitle className="text-lg">Download Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Selected Locations</span>
                  <Badge variant="outline">
                    {selectedLocations.length} of {locations.length} sites
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Data Tables</span>
                  <Badge variant="outline">
                    {selectedDataTypes.length} of {dataTypes.length} tables
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Time Period</span>
                  <Badge variant="outline">
                    {selectedSeason ? seasons.find(s => s.value === selectedSeason)?.label : 'Not selected'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">File Formats</span>
                  <Badge variant="outline">
                    {selectedFormats.length > 0 ? `${selectedFormats.length} selected` : 'Not selected'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="data-card bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <Download className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">Ready to Download?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Generate your custom dataset based on the selected parameters
                </p>
                <Button className="w-full btn-research">
                  <Download className="mr-2 h-4 w-4" />
                  Generate Dataset
                </Button>
              </CardContent>
            </Card>

            <Card className="data-card">
              <CardHeader>
                <CardTitle className="text-lg">Quick Downloads</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Latest Monthly Summary
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Database className="mr-2 h-4 w-4" />
                  Complete 2024 Dataset
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  Seasonal Comparisons
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MapPin className="mr-2 h-4 w-4" />
                  Site Metadata
                </Button>
              </CardContent>
            </Card>

            <Card className="data-card bg-muted/50">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2 text-sm">Data Usage Guidelines</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Please cite the Summit 2 Shore project in publications</li>
                  <li>• Data is provided under Creative Commons license</li>
                  <li>• For large datasets, consider contacting our team</li>
                  <li>• Check data quality flags before analysis</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DataDownload;