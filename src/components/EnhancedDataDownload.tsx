import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CalendarIcon, Download, Database, Table, MapPin, CheckCircle2, Circle, Loader2, ChevronRight, ChevronLeft, Filter, FileDown, FileSpreadsheet, FileText, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { API_BASE_URL } from '@/lib/apiConfig';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DatabaseInfo {
  key: string;
  name: string;
  displayName: string;
  description: string;
}

interface TableInfo {
  name: string;
  displayName: string;
  description: string;
  rowCount: number;
}

interface AttributeInfo {
  name: string;
  type: string;
  nullable: boolean;
  category: string;
  isPrimary: boolean;
  comment: string;
}

const STEPS = [
  { id: 1, name: 'Database', icon: Database },
  { id: 2, name: 'Table', icon: Table },
  { id: 3, name: 'Filters', icon: Filter },
  { id: 4, name: 'Download', icon: FileDown }
];

const EnhancedDataDownload = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  
  // Core state
  const [databases, setDatabases] = useState<DatabaseInfo[]>([]);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [attributes, setAttributes] = useState<AttributeInfo[]>([]);
  const [locationValues, setLocationValues] = useState<string[]>([]);
  
  // Selections
  const [selectedDatabase, setSelectedDatabase] = useState<string>('');
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [downloadFormat, setDownloadFormat] = useState<'csv' | 'excel'>('csv');
  
  // Loading states
  const [isLoadingDatabases, setIsLoadingDatabases] = useState(false);
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [isLoadingAttributes, setIsLoadingAttributes] = useState(false);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    fetchDatabases();
  }, []);

  useEffect(() => {
    if (selectedDatabase) {
      fetchTables(selectedDatabase);
      setSelectedTable('');
    }
  }, [selectedDatabase]);

  useEffect(() => {
    if (selectedDatabase && selectedTable) {
      fetchAttributes(selectedDatabase, selectedTable);
      fetchLocationValues(selectedDatabase, selectedTable);
      setSelectedAttributes([]);
    }
  }, [selectedDatabase, selectedTable]);

  const fetchDatabases = async () => {
    setIsLoadingDatabases(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/databases`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setDatabases(data.databases || []);
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Failed to fetch databases",
        variant: "destructive"
      });
    } finally {
      setIsLoadingDatabases(false);
    }
  };

  const fetchTables = async (database: string) => {
    setIsLoadingTables(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/databases/${database}/tables`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setTables(data.tables || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch tables",
        variant: "destructive"
      });
    } finally {
      setIsLoadingTables(false);
    }
  };

  const fetchAttributes = async (database: string, table: string) => {
    setIsLoadingAttributes(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/databases/${database}/tables/${table}/attributes`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setAttributes(data.attributes || []);
    } catch (error) {
      console.error('Error fetching attributes:', error);
    } finally {
      setIsLoadingAttributes(false);
    }
  };

  const fetchLocationValues = async (database: string, table: string) => {
    setIsLoadingLocations(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/databases/${database}/tables/${table}/locations`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setLocationValues(data.locations || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setIsLoadingLocations(false);
    }
  };

  const handleDownload = async () => {
    if (!selectedDatabase || !selectedTable || !startDate || !endDate || selectedLocations.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please complete all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsDownloading(true);
    try {
      const params = new URLSearchParams({
        database: selectedDatabase,
        table: selectedTable,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        locations: selectedLocations.join(','),
        format: downloadFormat,
        ...(selectedAttributes.length > 0 && { attributes: selectedAttributes.join(',') })
      });

      const url = `${API_BASE_URL}/api/databases/${selectedDatabase}/download/${selectedTable}?${params.toString()}`;
      const link = document.createElement('a');
      link.href = url;
      const extension = downloadFormat === 'excel' ? 'xlsx' : 'csv';
      link.download = `${selectedDatabase}_${selectedTable}_${format(startDate, 'yyyy-MM-dd')}_to_${format(endDate, 'yyyy-MM-dd')}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download Started",
        description: `Your ${downloadFormat.toUpperCase()} export has begun`,
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

  const canProceedToStep = (step: number): boolean => {
    switch (step) {
      case 2: return !!selectedDatabase;
      case 3: return !!selectedDatabase && !!selectedTable;
      case 4: return !!selectedDatabase && !!selectedTable && selectedLocations.length > 0 && !!startDate && !!endDate;
      default: return true;
    }
  };

  const progressPercentage = (currentStep / STEPS.length) * 100;

  const groupedAttributes = attributes.reduce((groups, attr) => {
    const category = attr.category || 'Other';
    if (!groups[category]) groups[category] = [];
    groups[category].push(attr);
    return groups;
  }, {} as Record<string, AttributeInfo[]>);

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          
          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                    isCompleted && "bg-primary text-primary-foreground",
                    isCurrent && "bg-primary/20 border-2 border-primary text-primary",
                    !isCurrent && !isCompleted && "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <Icon className="h-6 w-6" />
                  )}
                </div>
                <span className={cn(
                  "text-sm mt-2 font-medium",
                  isCurrent && "text-primary",
                  !isCurrent && "text-muted-foreground"
                )}>
                  {step.name}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={cn(
                  "flex-1 h-0.5 mx-4 transition-all",
                  currentStep > step.id ? "bg-primary" : "bg-muted"
                )} />
              )}
            </div>
          );
        })}
      </div>
      <Progress value={progressPercentage} className="h-2" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Progress Indicator */}
      {renderStepIndicator()}

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {STEPS[currentStep - 1] && (
              <>
                {React.createElement(STEPS[currentStep - 1].icon, { className: "h-5 w-5" })}
                {STEPS[currentStep - 1].name}
              </>
            )}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && "Select the database containing your research data"}
            {currentStep === 2 && "Choose the specific table you want to export"}
            {currentStep === 3 && "Filter your data by location and date range"}
            {currentStep === 4 && "Review your selections and download"}
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[400px]">
          {/* Step 1: Database Selection */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <Select 
                value={selectedDatabase} 
                onValueChange={setSelectedDatabase}
                disabled={isLoadingDatabases}
              >
                <SelectTrigger className="w-full h-12">
                  <SelectValue placeholder="Select a database..." />
                </SelectTrigger>
                <SelectContent>
                  {databases.map((db) => (
                    <SelectItem key={db.key} value={db.key}>
                      <div className="py-2">
                        <div className="font-medium">{db.displayName}</div>
                        <div className="text-sm text-muted-foreground">{db.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isLoadingDatabases && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading databases...
                </div>
              )}
            </div>
          )}

          {/* Step 2: Table Selection */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <Select 
                value={selectedTable} 
                onValueChange={setSelectedTable}
                disabled={isLoadingTables}
              >
                <SelectTrigger className="w-full h-12">
                  <SelectValue placeholder="Select a table..." />
                </SelectTrigger>
                <SelectContent>
                  {tables.map((table) => (
                    <SelectItem key={table.name} value={table.name}>
                      <div className="py-2">
                        <div className="font-medium">{table.displayName}</div>
                        <div className="text-sm text-muted-foreground">
                          {table.description} • {table.rowCount.toLocaleString()} records
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isLoadingTables && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading tables...
                </div>
              )}
            </div>
          )}

          {/* Step 3: Filters */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Date Range */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Date Range *</Label>
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
              </div>

              <Separator />

              {/* Locations */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Locations *</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedLocations(locationValues)}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[200px] overflow-y-auto border rounded-lg p-4">
                  {locationValues.map((location) => (
                    <div key={location} className="flex items-center space-x-2">
                      <Checkbox
                        id={`location-${location}`}
                        checked={selectedLocations.includes(location)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedLocations([...selectedLocations, location]);
                          } else {
                            setSelectedLocations(selectedLocations.filter(l => l !== location));
                          }
                        }}
                      />
                      <label
                        htmlFor={`location-${location}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {location}
                      </label>
                    </div>
                  ))}
                </div>
                {isLoadingLocations && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading locations...
                  </div>
                )}
              </div>

              <Separator />

              {/* Optional Attributes */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Attributes (Optional)</Label>
                  <Badge variant="outline">Leave empty for all attributes</Badge>
                </div>
                <div className="space-y-4 max-h-[200px] overflow-y-auto border rounded-lg p-4">
                  {Object.entries(groupedAttributes).map(([category, attrs]) => (
                    <div key={category} className="space-y-2">
                      <div className="font-medium text-sm text-muted-foreground">{category}</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4">
                        {attrs.map((attr) => (
                          <div key={attr.name} className="flex items-center space-x-2">
                            <Checkbox
                              id={`attr-${attr.name}`}
                              checked={selectedAttributes.includes(attr.name)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedAttributes([...selectedAttributes, attr.name]);
                                } else {
                                  setSelectedAttributes(selectedAttributes.filter(a => a !== attr.name));
                                }
                              }}
                            />
                            <label
                              htmlFor={`attr-${attr.name}`}
                              className="text-sm leading-none cursor-pointer"
                            >
                              {attr.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review & Download */}
          {currentStep === 4 && (
            <div className="space-y-6">
              {/* Format Selection */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Export Format *</Label>
                <RadioGroup value={downloadFormat} onValueChange={(value: 'csv' | 'excel') => setDownloadFormat(value)}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div 
                      className={cn(
                        "flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                        downloadFormat === 'csv' ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                      )}
                      onClick={() => setDownloadFormat('csv')}
                    >
                      <RadioGroupItem value="csv" id="format-csv" className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          <Label htmlFor="format-csv" className="font-semibold cursor-pointer">CSV Format</Label>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Comma-separated values. Compatible with Excel, R, Python, and most data tools.
                        </p>
                      </div>
                    </div>
                    <div 
                      className={cn(
                        "flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                        downloadFormat === 'excel' ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                      )}
                      onClick={() => setDownloadFormat('excel')}
                    >
                      <RadioGroupItem value="excel" id="format-excel" className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="h-5 w-5" />
                          <Label htmlFor="format-excel" className="font-semibold cursor-pointer">Excel Format</Label>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          .xlsx file with metadata sheet. Better for direct Excel usage and includes data dictionary.
                        </p>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  Export Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Database</Label>
                    <p className="font-medium mt-1">
                      {databases.find(d => d.key === selectedDatabase)?.displayName}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Table</Label>
                    <p className="font-medium mt-1">
                      {tables.find(t => t.name === selectedTable)?.displayName}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Date Range</Label>
                    <p className="font-medium mt-1">
                      {startDate && endDate && 
                        `${format(startDate, 'PP')} - ${format(endDate, 'PP')}`
                      }
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Locations</Label>
                    <p className="font-medium mt-1">
                      {selectedLocations.length} selected
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Attributes</Label>
                    <p className="font-medium mt-1">
                      {selectedAttributes.length > 0 
                        ? `${selectedAttributes.length} selected` 
                        : 'All attributes'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Format</Label>
                    <p className="font-medium mt-1 uppercase">{downloadFormat}</p>
                  </div>
                </div>

                {/* Metadata Information */}
                {downloadFormat === 'excel' && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-md">
                          <p className="text-sm flex items-start gap-2">
                            <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                            <span>
                              Excel export includes a metadata sheet with export details, date range, locations, and a data dictionary.
                            </span>
                          </p>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <p>The metadata sheet provides context for your data including database info, export parameters, and column descriptions to help with data analysis.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>

              <Button
                onClick={handleDownload}
                disabled={isDownloading}
                size="lg"
                className="w-full"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-5 w-5" />
                    Download {downloadFormat.toUpperCase()}
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button
          onClick={() => setCurrentStep(Math.min(STEPS.length, currentStep + 1))}
          disabled={currentStep === STEPS.length || !canProceedToStep(currentStep + 1)}
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default EnhancedDataDownload;
