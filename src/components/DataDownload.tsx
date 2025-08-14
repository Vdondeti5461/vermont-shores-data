import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileSpreadsheet, Database, Calendar, MapPin, Filter } from 'lucide-react';

const DataDownload = () => {
  const seasons = [
    { value: 'spring-2024', label: 'Spring 2024' },
    { value: 'winter-2024', label: 'Winter 2023-2024' },
    { value: 'fall-2023', label: 'Fall 2023' },
    { value: 'summer-2023', label: 'Summer 2023' }
  ];

  const locations = [
    'Mount Mansfield Summit', 'Burlington Lakefront', 'Green Mountain Forest',
    'Champlain Valley', 'Northeast Kingdom', 'Connecticut River Valley',
    'Stowe Valley', 'White River Junction', 'Brattleboro', 'St. Johnsbury'
  ];

  const dataTypes = [
    { id: 'temperature', label: 'Temperature (Air & Soil)' },
    { id: 'precipitation', label: 'Precipitation Data' },
    { id: 'wind', label: 'Wind Speed & Direction' },
    { id: 'humidity', label: 'Relative Humidity' },
    { id: 'pressure', label: 'Atmospheric Pressure' },
    { id: 'solar', label: 'Solar Radiation' },
    { id: 'soil', label: 'Soil Moisture' },
    { id: 'air-quality', label: 'Air Quality Parameters' }
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
                  <Select>
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
                  <label className="data-label mb-3 block">Monitoring Locations</label>
                  <div className="grid md:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                    {locations.map((location, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Checkbox id={`location-${index}`} />
                        <label 
                          htmlFor={`location-${index}`} 
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {location}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Data Type Selection */}
                <div>
                  <label className="data-label mb-3 block">Environmental Parameters</label>
                  <div className="grid md:grid-cols-2 gap-3">
                    {dataTypes.map((type) => (
                      <div key={type.id} className="flex items-center space-x-2">
                        <Checkbox id={type.id} />
                        <label 
                          htmlFor={type.id} 
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {type.label}
                        </label>
                      </div>
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
                            <Checkbox id={format.id} />
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
                  <Badge variant="outline">0 sites</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Data Parameters</span>
                  <Badge variant="outline">0 types</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Estimated Size</span>
                  <Badge variant="outline">-- MB</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">File Format</span>
                  <Badge variant="outline">Not selected</Badge>
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