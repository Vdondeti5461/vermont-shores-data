import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Download, 
  Calendar, 
  MapPin, 
  Database, 
  FileSpreadsheet, 
  Filter,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface Location {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  status?: string;
}

interface DownloadRequest {
  locations: number[];
  tables: string[];
  startDate: string;
  endDate: string;
  format: string;
  timeRange: string;
}

const DownloadInterface = () => {
  const { toast } = useToast();
  const [downloadRequest, setDownloadRequest] = useState<DownloadRequest>({
    locations: [],
    tables: [],
    startDate: '',
    endDate: '',
    format: 'csv',
    timeRange: 'last-month'
  });
  const [isDownloading, setIsDownloading] = useState(false);

  // Fetch locations
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
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const locations: Location[] = locationsData?.locations || [];

  const tables = [
    { id: 'precipitation', name: 'Precipitation Data', description: 'Rainfall and snowfall measurements' },
    { id: 'SnowpkTempProfile', name: 'Snow Pack Temperature', description: 'Temperature profiles in snow layers' },
    { id: 'table1', name: 'Environmental Sensors', description: 'General environmental measurements' },
    { id: 'Wind', name: 'Wind Data', description: 'Wind speed and direction measurements' }
  ];

  const timeRanges = [
    { value: 'last-week', label: 'Last 7 Days' },
    { value: 'last-month', label: 'Last 30 Days' },
    { value: 'last-quarter', label: 'Last 3 Months' },
    { value: 'last-year', label: 'Last 12 Months' },
    { value: 'custom', label: 'Custom Date Range' }
  ];

  const formats = [
    { value: 'csv', label: 'CSV', description: 'Excel compatible format' },
    { value: 'json', label: 'JSON', description: 'API/programming format' },
    { value: 'netcdf', label: 'NetCDF', description: 'Scientific data format' }
  ];

  const handleLocationToggle = (locationId: number) => {
    setDownloadRequest(prev => ({
      ...prev,
      locations: prev.locations.includes(locationId)
        ? prev.locations.filter(id => id !== locationId)
        : [...prev.locations, locationId]
    }));
  };

  const handleTableToggle = (tableId: string) => {
    setDownloadRequest(prev => ({
      ...prev,
      tables: prev.tables.includes(tableId)
        ? prev.tables.filter(id => id !== tableId)
        : [...prev.tables, tableId]
    }));
  };

  const handleDownload = async () => {
    if (downloadRequest.locations.length === 0) {
      toast({
        title: "Selection Required",
        description: "Please select at least one monitoring location.",
        variant: "destructive"
      });
      return;
    }

    if (downloadRequest.tables.length === 0) {
      toast({
        title: "Selection Required", 
        description: "Please select at least one data table.",
        variant: "destructive"
      });
      return;
    }

    setIsDownloading(true);
    
    try {
      // Simulate download preparation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Download Ready",
        description: `Dataset prepared with ${downloadRequest.locations.length} locations and ${downloadRequest.tables.length} data types.`,
      });
      
      // Here you would implement the actual download logic
      console.log('Download request:', downloadRequest);
      
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "There was an error preparing your dataset. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const selectedLocationNames = locations
    .filter(loc => downloadRequest.locations.includes(loc.id))
    .map(loc => loc.name);

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Selection Panel */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="data-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              Data Selection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Time Period Selection */}
            <div className="space-y-3">
              <Label className="data-label">Time Period</Label>
              <Select 
                value={downloadRequest.timeRange} 
                onValueChange={(value) => setDownloadRequest(prev => ({ ...prev, timeRange: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  {timeRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {downloadRequest.timeRange === 'custom' && (
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={downloadRequest.startDate}
                      onChange={(e) => setDownloadRequest(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={downloadRequest.endDate}
                      onChange={(e) => setDownloadRequest(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Location Selection */}
            <div className="space-y-3">
              <Label className="data-label">
                Monitoring Locations ({downloadRequest.locations.length} of {locations.length} selected)
              </Label>
              {locationsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading locations...</span>
                </div>
              ) : locationsError ? (
                <div className="flex items-center justify-center py-8 text-destructive">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <span className="text-sm">Failed to load locations</span>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-2 border rounded-md">
                  {locations.map((location) => (
                    <div key={location.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`location-${location.id}`}
                        checked={downloadRequest.locations.includes(location.id)}
                        onCheckedChange={() => handleLocationToggle(location.id)}
                      />
                      <label
                        htmlFor={`location-${location.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {location.name}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Data Table Selection */}
            <div className="space-y-3">
              <Label className="data-label">
                Data Tables ({downloadRequest.tables.length} of {tables.length} selected)
              </Label>
              <div className="space-y-3">
                {tables.map((table) => (
                  <Card 
                    key={table.id} 
                    className={`cursor-pointer transition-all duration-200 ${
                      downloadRequest.tables.includes(table.id) 
                        ? 'border-green-600 bg-green-50' 
                        : 'hover:border-green-400'
                    }`}
                    onClick={() => handleTableToggle(table.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={downloadRequest.tables.includes(table.id)}
                          onChange={() => handleTableToggle(table.id)}
                        />
                        <div className="flex-1">
                          <div className="font-medium">{table.name}</div>
                          <div className="text-sm text-muted-foreground">{table.description}</div>
                        </div>
                        <Database className="h-4 w-4 text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Format Selection */}
            <div className="space-y-3">
              <Label className="data-label">Output Format</Label>
              <Select 
                value={downloadRequest.format} 
                onValueChange={(value) => setDownloadRequest(prev => ({ ...prev, format: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  {formats.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      <div>
                        <div>{format.label}</div>
                        <div className="text-xs text-muted-foreground">{format.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary and Download Panel */}
      <div className="space-y-6">
        <Card className="data-card">
          <CardHeader>
            <CardTitle className="text-lg">Download Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Time Period</span>
                <Badge variant="outline">
                  {timeRanges.find(r => r.value === downloadRequest.timeRange)?.label || 'Not selected'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Locations</span>
                <Badge variant="outline">
                  {downloadRequest.locations.length} sites
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Data Tables</span>
                <Badge variant="outline">
                  {downloadRequest.tables.length} tables
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Format</span>
                <Badge variant="outline">
                  {downloadRequest.format.toUpperCase()}
                </Badge>
              </div>
            </div>

            {selectedLocationNames.length > 0 && (
              <div className="pt-3 border-t">
                <div className="text-sm font-medium mb-2">Selected Locations:</div>
                <div className="text-xs text-muted-foreground space-y-1">
                  {selectedLocationNames.slice(0, 3).map((name, i) => (
                    <div key={i}>• {name}</div>
                  ))}
                  {selectedLocationNames.length > 3 && (
                    <div>• +{selectedLocationNames.length - 3} more...</div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-semibold mb-2 text-green-800">Ready to Download?</h3>
            <p className="text-sm text-green-700 mb-4">
              Generate your custom <span className="font-semibold text-green-800">University of Vermont</span> environmental dataset
            </p>
            <Button 
              className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200" 
              onClick={handleDownload}
              disabled={isDownloading || downloadRequest.locations.length === 0 || downloadRequest.tables.length === 0}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Preparing Dataset...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Generate UVM Dataset
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Quick Downloads */}
        <Card className="data-card">
          <CardHeader>
            <CardTitle className="text-lg">Quick Downloads</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Latest Weekly Summary
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="mr-2 h-4 w-4" />
              2024 Complete Dataset
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <MapPin className="mr-2 h-4 w-4" />
              Site Locations (KML)
            </Button>
          </CardContent>
        </Card>

        {/* Data Guidelines */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <h4 className="font-medium mb-2 text-sm flex items-center text-green-800">
              <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
              <span className="text-green-700">University of Vermont</span> Usage Guidelines
            </h4>
            <ul className="text-xs text-green-700 space-y-1">
              <li>• Data is freely available under CC BY 4.0 license</li>
              <li>• Please cite <span className="font-semibold">University of Vermont</span> Summit 2 Shore in publications</li>
              <li>• Check metadata for data quality flags</li>
              <li>• Contact <span className="text-green-800 font-semibold">UVM</span> team for large-scale research requests</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DownloadInterface;