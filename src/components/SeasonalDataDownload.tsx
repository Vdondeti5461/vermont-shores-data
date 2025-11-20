import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CalendarIcon, Download, MapPin, Filter, Loader2, Info, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { API_BASE_URL, DOWNLOADABLE_DATABASE } from '@/lib/apiConfig';
import { cn } from '@/lib/utils';

interface AttributeInfo {
  name: string;
  type: string;
  nullable: boolean;
  category: string;
  isPrimary: boolean;
  comment: string;
}

interface LocationInfo {
  code: string;
  name: string;
  latitude: number;
  longitude: number;
  elevation: number;
}

const SeasonalDataDownload = () => {
  const { toast } = useToast();
  
  // State
  const [attributes, setAttributes] = useState<AttributeInfo[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [tableName, setTableName] = useState<string>('');
  
  // Selections
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Initialize - fetch table, attributes, and locations
  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Initializing data download with API_BASE_URL:', API_BASE_URL);
      console.log('🔍 DOWNLOADABLE_DATABASE:', DOWNLOADABLE_DATABASE);
      
      // Fetch the single table from seasonal_qaqc_data
      const tablesUrl = `${API_BASE_URL}/api/databases/${DOWNLOADABLE_DATABASE}/tables`;
      console.log('📋 Fetching tables from:', tablesUrl);
      
      const tablesResponse = await fetch(tablesUrl);
      console.log('📋 Tables response status:', tablesResponse.status);
      
      if (!tablesResponse.ok) {
        const errorText = await tablesResponse.text();
        console.error('❌ Tables fetch failed:', errorText);
        throw new Error('Failed to fetch table');
      }
      
      const tablesData = await tablesResponse.json();
      console.log('📋 Tables data:', tablesData);
      const table = tablesData.tables?.[0];
      
      if (table) {
        console.log('✅ Found table:', table.name);
        setTableName(table.name);
        
        const attributesUrl = `${API_BASE_URL}/api/databases/${DOWNLOADABLE_DATABASE}/tables/${table.name}/attributes`;
        const locationsUrl = `${API_BASE_URL}/api/databases/${DOWNLOADABLE_DATABASE}/tables/${table.name}/locations`;
        
        console.log('📊 Fetching attributes from:', attributesUrl);
        console.log('📍 Fetching locations from:', locationsUrl);
        
        // Fetch attributes and locations in parallel
        const [attributesResponse, locationsResponse] = await Promise.all([
          fetch(attributesUrl),
          fetch(locationsUrl)
        ]);
        
        console.log('📊 Attributes response status:', attributesResponse.status);
        console.log('📍 Locations response status:', locationsResponse.status);
        
        if (attributesResponse.ok) {
          const attributesData = await attributesResponse.json();
          console.log('📊 Attributes data:', attributesData);
          setAttributes(attributesData.attributes || []);
        } else {
          console.error('❌ Attributes fetch failed:', attributesResponse.status, attributesResponse.statusText);
        }
        
        if (locationsResponse.ok) {
          const locationsData = await locationsResponse.json();
          console.log('📍 Locations response:', locationsData);
          // Backend returns plain array, not wrapped object
          const locationsList = Array.isArray(locationsData) ? locationsData : (locationsData.locations || []);
          console.log('📍 Processed locations:', locationsList);
          setLocations(locationsList);
        } else {
          console.error('❌ Locations fetch failed:', locationsResponse.status, locationsResponse.statusText);
        }
      } else {
        console.error('❌ No table found in response');
      }
    } catch (error) {
      console.error('❌ Initialization error:', error);
      toast({
        title: "Initialization Error",
        description: error instanceof Error ? error.message : "Failed to load data options. Please refresh the page.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!startDate || !endDate || selectedLocations.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select date range and at least one location",
        variant: "destructive"
      });
      return;
    }

    setIsDownloading(true);
    try {
      const params = new URLSearchParams({
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        locations: selectedLocations.join(','),
        format: 'csv',
        ...(selectedAttributes.length > 0 && { attributes: selectedAttributes.join(',') })
      });

      const url = `${API_BASE_URL}/api/databases/${DOWNLOADABLE_DATABASE}/download/${tableName}?${params.toString()}`;
      const link = document.createElement('a');
      link.href = url;
      link.download = `seasonal_qaqc_${format(startDate, 'yyyy-MM-dd')}_to_${format(endDate, 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download Started",
        description: "Your CSV export has begun",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to download data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const groupedAttributes = attributes.reduce((groups, attr) => {
    const category = attr.category || 'Other';
    if (!groups[category]) groups[category] = [];
    groups[category].push(attr);
    return groups;
  }, {} as Record<string, AttributeInfo[]>);

  const canDownload = selectedLocations.length > 0 && !!startDate && !!endDate;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Download quality-controlled seasonal environmental data from Vermont's Summit 2 Shore monitoring network. 
          Select your date range, locations, and specific attributes to customize your dataset.
        </AlertDescription>
      </Alert>

      {/* Date Range Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Date Range
          </CardTitle>
          <CardDescription>Select the time period for your data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const today = new Date();
                const lastWeek = new Date(today);
                lastWeek.setDate(today.getDate() - 7);
                setStartDate(lastWeek);
                setEndDate(today);
              }}
            >
              Last 7 Days
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const today = new Date();
                const lastMonth = new Date(today);
                lastMonth.setMonth(today.getMonth() - 1);
                setStartDate(lastMonth);
                setEndDate(today);
              }}
            >
              Last Month
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const today = new Date();
                const lastYear = new Date(today);
                lastYear.setFullYear(today.getFullYear() - 1);
                setStartDate(lastYear);
                setEndDate(today);
              }}
            >
              Last Year
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Location Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Monitoring Locations
              </CardTitle>
              <CardDescription>Select one or more locations (Required)</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedLocations(locations)}
              >
                Select All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedLocations([])}
              >
                Clear
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {locations.map((location) => (
              <div key={location} className="flex items-center space-x-2">
                <Checkbox
                  id={`location-${location}`}
                  checked={selectedLocations.includes(location)}
                  onCheckedChange={() => {
                    setSelectedLocations(prev => 
                      prev.includes(location)
                        ? prev.filter(loc => loc !== location)
                        : [...prev, location]
                    );
                  }}
                />
                <Label 
                  htmlFor={`location-${location}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {location}
                </Label>
              </div>
            ))}
          </div>
          {selectedLocations.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <Badge variant="secondary" className="mr-2">
                {selectedLocations.length} location{selectedLocations.length !== 1 ? 's' : ''} selected
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attribute Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Data Attributes
              </CardTitle>
              <CardDescription>Select specific attributes (Optional - defaults to all)</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedAttributes(attributes.map(a => a.name))}
              >
                Select All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedAttributes([])}
              >
                Clear
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(groupedAttributes).map(([category, attrs]) => (
            <div key={category} className="space-y-3">
              <h4 className="text-sm font-semibold text-primary">{category}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {attrs.map((attr) => (
                  <div key={attr.name} className="flex items-start space-x-2">
                    <Checkbox
                      id={`attr-${attr.name}`}
                      checked={selectedAttributes.includes(attr.name)}
                      onCheckedChange={() => {
                        setSelectedAttributes(prev => 
                          prev.includes(attr.name)
                            ? prev.filter(a => a !== attr.name)
                            : [...prev, attr.name]
                        );
                      }}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label 
                        htmlFor={`attr-${attr.name}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {attr.name}
                        {attr.isPrimary && (
                          <Badge variant="outline" className="ml-2 text-xs">Primary</Badge>
                        )}
                      </Label>
                      {attr.comment && (
                        <p className="text-xs text-muted-foreground">{attr.comment}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {category !== Object.keys(groupedAttributes)[Object.keys(groupedAttributes).length - 1] && (
                <Separator className="mt-4" />
              )}
            </div>
          ))}
          {selectedAttributes.length > 0 && (
            <div className="pt-4 border-t">
              <Badge variant="secondary">
                {selectedAttributes.length} attribute{selectedAttributes.length !== 1 ? 's' : ''} selected
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Download Button */}
      <Card className={cn(
        "border-2 transition-colors",
        canDownload ? "border-primary bg-primary/5" : "border-muted"
      )}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold flex items-center gap-2">
                {canDownload ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    Ready to Download
                  </>
                ) : (
                  <>
                    <Info className="h-5 w-5 text-muted-foreground" />
                    Complete Required Fields
                  </>
                )}
              </h3>
              <p className="text-sm text-muted-foreground">
                {canDownload 
                  ? `Download data for ${selectedLocations.length} location${selectedLocations.length !== 1 ? 's' : ''} from ${startDate ? format(startDate, 'MMM d, yyyy') : ''} to ${endDate ? format(endDate, 'MMM d, yyyy') : ''}`
                  : 'Please select date range and at least one location to enable download'
                }
              </p>
            </div>
            <Button 
              size="lg"
              onClick={handleDownload}
              disabled={!canDownload || isDownloading}
              className="gap-2"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  Download CSV
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SeasonalDataDownload;
