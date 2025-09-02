import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { CalendarDays, Snowflake, TrendingUp, BarChart3, Download } from 'lucide-react';
import { LocalDatabaseService } from '@/services/localDatabaseService';
import { Skeleton } from '@/components/ui/skeleton';

interface SeasonalData {
  season: string;
  year: string;
  rawMean: number;
  cleanMean: number;
  rawMax: number;
  cleanMax: number;
  improvement: number;
  dataPoints: number;
  qualityScore: number;
}

interface SeasonalCleanDataAnalysisProps {
  className?: string;
}

const SeasonalCleanDataAnalysis: React.FC<SeasonalCleanDataAnalysisProps> = ({ className = '' }) => {
  const [data, setData] = useState<SeasonalData[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedSeason, setSelectedSeason] = useState<string>('2023-2024');
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'comparison' | 'improvement'>('comparison');

  // Snow seasons run from Aug-July (e.g., 2022-2023 = Aug 2022 - July 2023)
  const availableSeasons = [
    { key: '2022-2023', label: '2022-2023', startDate: '2022-08-01', endDate: '2023-07-31' },
    { key: '2023-2024', label: '2023-2024', startDate: '2023-08-01', endDate: '2024-07-31' },
    { key: '2024-2025', label: '2024-2025', startDate: '2024-08-01', endDate: '2025-07-31' }
  ];
  
  const monthlyPeriods = [
    { key: 'aug-sep', label: 'Early Fall', months: 'Aug-Sep', color: '#ef4444', start: 8, end: 9 },
    { key: 'oct-nov', label: 'Late Fall', months: 'Oct-Nov', color: '#f59e0b', start: 10, end: 11 },
    { key: 'dec-feb', label: 'Winter', months: 'Dec-Feb', color: '#3b82f6', start: 12, end: 2 },
    { key: 'mar-may', label: 'Spring', months: 'Mar-May', color: '#10b981', start: 3, end: 5 },
    { key: 'jun-jul', label: 'Early Summer', months: 'Jun-Jul', color: '#8b5cf6', start: 6, end: 7 }
  ];

  // Load locations
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const locationsData = await LocalDatabaseService.getLocations('rawdata');
        setLocations(locationsData);
        if (locationsData.length > 0) {
          setSelectedLocation(locationsData[0].name);
        }
      } catch (error) {
        console.error('Failed to load locations:', error);
      }
    };
    loadInitialData();
  }, []);

  // Load seasonal data with proper snow season handling
  useEffect(() => {
    if (!selectedLocation || !selectedSeason) return;

    const loadSeasonalData = async () => {
      try {
        setLoading(true);
        
        const seasonInfo = availableSeasons.find(s => s.key === selectedSeason);
        if (!seasonInfo) return;
        
        const seasonalResults: SeasonalData[] = [];
        
        // Load data for each monthly period within the snow season
        const periodPromises = monthlyPeriods.map(async (period) => {
          try {
            // Calculate date ranges for the period within the snow season
            const seasonStartYear = parseInt(seasonInfo.startDate.split('-')[0]);
            const seasonEndYear = parseInt(seasonInfo.endDate.split('-')[0]);
            
            let startDate: string;
            let endDate: string;
            
            if (period.start <= 7) {
              // Period is in the second calendar year (Jan-Jul)
              startDate = `${seasonEndYear}-${period.start.toString().padStart(2, '0')}-01`;
              if (period.end === 2) {
                // Handle February end date
                const isLeapYear = seasonEndYear % 4 === 0;
                endDate = `${seasonEndYear}-02-${isLeapYear ? '29' : '28'}`;
              } else if (period.end <= 7) {
                endDate = `${seasonEndYear}-${period.end.toString().padStart(2, '0')}-${period.end === 2 ? '28' : '30'}`;
              } else {
                endDate = `${seasonEndYear}-07-31`;
              }
            } else {
              // Period is in the first calendar year (Aug-Dec)
              startDate = `${seasonStartYear}-${period.start.toString().padStart(2, '0')}-01`;
              if (period.end === 2) {
                // Cross-year period (Dec-Feb)
                startDate = `${seasonStartYear}-12-01`;
                endDate = `${seasonEndYear}-02-28`;
              } else {
                endDate = `${seasonStartYear}-${Math.min(period.end, 12).toString().padStart(2, '0')}-31`;
              }
            }

            const [rawData, cleanData] = await Promise.all([
              LocalDatabaseService.getSnowDepthTimeSeries(
                'rawdata',
                selectedLocation,
                startDate,
                endDate,
                'all',
                seasonStartYear.toString(),
                'both'
              ),
              LocalDatabaseService.getSnowDepthTimeSeries(
                'finalcleandata',
                selectedLocation,
                startDate,
                endDate,
                'all',
                seasonStartYear.toString(),
                'both'
              )
            ]);

            const rawValues = rawData.map(d => d.dbtcdt || 0).filter(v => v > 0);
            const cleanValues = cleanData.map(d => d.dbtcdt || 0).filter(v => v > 0);

            if (rawValues.length === 0 && cleanValues.length === 0) {
              return null; // Skip periods with no data
            }

            const rawMean = rawValues.length > 0 ? rawValues.reduce((sum, val) => sum + val, 0) / rawValues.length : 0;
            const cleanMean = cleanValues.length > 0 ? cleanValues.reduce((sum, val) => sum + val, 0) / cleanValues.length : 0;
            const rawMax = rawValues.length > 0 ? Math.max(...rawValues) : 0;
            const cleanMax = cleanValues.length > 0 ? Math.max(...cleanValues) : 0;

            // Calculate variance reduction as quality improvement
            const rawVariance = rawValues.length > 0 ? 
              rawValues.reduce((sum, val) => sum + Math.pow(val - rawMean, 2), 0) / rawValues.length : 0;
            const cleanVariance = cleanValues.length > 0 ? 
              cleanValues.reduce((sum, val) => sum + Math.pow(val - cleanMean, 2), 0) / cleanValues.length : 0;
            
            const improvement = rawVariance > 0 ? ((rawVariance - cleanVariance) / rawVariance) * 100 : 0;
            const qualityScore = Math.min(85 + improvement, 100);

            return {
              season: period.label,
              year: selectedSeason,
              rawMean,
              cleanMean,
              rawMax,
              cleanMax,
              improvement,
              dataPoints: Math.max(rawValues.length, cleanValues.length),
              qualityScore
            };
          } catch (error) {
            console.warn(`Failed to load data for ${period.label}:`, error);
            return null;
          }
        });

        const results = await Promise.all(periodPromises);
        const validResults = results.filter(result => result !== null) as SeasonalData[];
        
        setData(validResults);
      } catch (error) {
        console.error('Failed to load seasonal data:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadSeasonalData();
  }, [selectedLocation, selectedSeason]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border">
          <p className="font-medium mb-2">{`Season: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.name}: ${entry.value.toFixed(2)}${entry.dataKey.includes('improvement') ? '%' : ' cm'}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header and Controls */}
      <div className="text-center mb-8">
        <Badge variant="outline" className="mb-4">
          <Snowflake className="w-4 h-4 mr-2" />
          Seasonal Clean Data Analysis
        </Badge>
        <h2 className="scientific-heading text-3xl md:text-4xl mb-4">
          Seasonal <span className="text-primary">Data Quality</span> Analysis
        </h2>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          Compare raw and cleaned snow depth data quality improvements across seasons
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Select Location" />
          </SelectTrigger>
          <SelectContent>
            {locations.map((location) => (
              <SelectItem key={location.id} value={location.name}>
                {location.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedSeason} onValueChange={setSelectedSeason}>
          <SelectTrigger className="w-full sm:w-40">
            <CalendarDays className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableSeasons.map((season) => (
              <SelectItem key={season.key} value={season.key}>
                {season.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button 
          variant="outline" 
          onClick={() => {
            setSelectedSeason('2023-2024');
            setViewType('comparison');
          }}
        >
          Reset
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {monthlyPeriods.map((period, index) => {
          const periodData = data.find(d => d.season === period.label);
          return (
            <Card key={period.key} className="relative overflow-hidden hover:shadow-md transition-shadow">
              <div 
                className="absolute top-0 left-0 right-0 h-1" 
                style={{ backgroundColor: period.color }}
              />
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">{period.label}</CardTitle>
                <p className="text-xs text-muted-foreground">{period.months}</p>
              </CardHeader>
              <CardContent>
                {periodData ? (
                  <div className="space-y-2">
                    <div className="text-lg font-bold text-primary">
                      {periodData.cleanMean.toFixed(1)} cm
                    </div>
                    <div className="text-xs text-green-600 font-medium">
                      Quality: +{periodData.improvement.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {periodData.dataPoints} measurements
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No data</div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <Tabs value={viewType} onValueChange={(value) => setViewType(value as any)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="comparison" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Data Comparison
          </TabsTrigger>
          <TabsTrigger value="improvement" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Quality Improvement
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Seasonal Snow Depth Comparison</CardTitle>
              <p className="text-sm text-muted-foreground">
                Mean snow depth values comparing raw and cleaned data by season
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="season" />
                    <YAxis label={{ value: 'Snow Depth (cm)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="rawMean" fill="hsl(220 70% 50%)" name="Raw Data" />
                    <Bar dataKey="cleanMean" fill="hsl(142 76% 36%)" name="Cleaned Data" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="improvement" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Quality Improvement by Season</CardTitle>
              <p className="text-sm text-muted-foreground">
                Percentage improvement in data quality through cleaning process
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="season" />
                    <YAxis label={{ value: 'Improvement (%)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="improvement" 
                      stroke="hsl(142 76% 36%)" 
                      strokeWidth={3}
                      name="Quality Improvement"
                      dot={{ r: 6 }}
                      activeDot={{ r: 8 }}
                    />
                    <ReferenceLine y={0} stroke="#666" strokeDasharray="2 2" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Seasonal Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Best Performing Season</CardTitle>
              </CardHeader>
              <CardContent>
                {data.length > 0 && (
                  <div className="space-y-3">
                    {data
                      .sort((a, b) => b.improvement - a.improvement)
                      .slice(0, 2)
                      .map((season, index) => (
                        <div key={season.season} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                          <div>
                            <div className="font-semibold">{season.season}</div>
                            <div className="text-sm text-muted-foreground">
                              {season.dataPoints} measurements
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">
                              +{season.improvement.toFixed(1)}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                              improvement
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Data Processing Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Seasons:</span>
                    <span className="font-semibold">{data.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg Improvement:</span>
                    <span className="font-semibold text-green-600">
                      +{data.length > 0 ? (data.reduce((sum, d) => sum + d.improvement, 0) / data.length).toFixed(1) : '0'}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Data Points:</span>
                    <span className="font-semibold">
                      {data.reduce((sum, d) => sum + d.dataPoints, 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Quality Score:</span>
                    <span className="font-semibold text-blue-600">
                      {data.length > 0 ? (data.reduce((sum, d) => sum + d.qualityScore, 0) / data.length).toFixed(0) : '0'}%
                    </span>
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

export default SeasonalCleanDataAnalysis;