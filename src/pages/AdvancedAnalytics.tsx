import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Download, Filter, TrendingUp, MapPin, Calendar, Database, Snowflake, BarChart3, LineChart, Zap } from 'lucide-react';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  ComposedChart,
  ScatterChart,
  Scatter
} from 'recharts';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdvancedAnalytics = () => {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedSeason, setSelectedSeason] = useState('2024-2025');
  const [dataType, setDataType] = useState('clean');
  const [showRealTime, setShowRealTime] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('snowDepth');

  // Location data with coordinates for mapping
  const locations = [
    { id: 'all', name: 'All Locations', elevation: 'Various' },
    { id: 'mansfield', name: 'Mount Mansfield Summit', elevation: '1,340m' },
    { id: 'killington', name: 'Killington Peak', elevation: '1,293m' },
    { id: 'champlain', name: 'Lake Champlain Shore', elevation: '95m' },
    { id: 'green_north', name: 'Green Mountains North', elevation: '850m' },
    { id: 'green_south', name: 'Green Mountains South', elevation: '720m' },
    { id: 'connecticut', name: 'Connecticut River Valley', elevation: '120m' },
    { id: 'winooski', name: 'Winooski River Basin', elevation: '200m' },
    { id: 'white_river', name: 'White River Junction', elevation: '180m' },
    { id: 'otter_creek', name: 'Otter Creek Valley', elevation: '150m' },
    { id: 'stowe', name: 'Stowe Valley', elevation: '520m' }
  ];

  // Season definitions (Nov to July)
  const seasons = [
    { id: '2024-2025', name: '2024-2025 Season', period: 'Nov 2024 - Jul 2025', status: 'Current' },
    { id: '2023-2024', name: '2023-2024 Season', period: 'Nov 2023 - Jul 2024', status: 'Complete' },
    { id: '2022-2023', name: '2022-2023 Season', period: 'Nov 2022 - Jul 2023', status: 'Complete' }
  ];

  // Generate detailed snow depth time series data
  const generateSnowDepthData = () => {
    const startDate = new Date('2024-11-01');
    const endDate = new Date('2025-07-31');
    const data = [];
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 7)) {
      const month = d.getMonth();
      const isWinter = month >= 11 || month <= 2; // Nov, Dec, Jan, Feb
      const isSpring = month >= 3 && month <= 6; // Mar, Apr, May, Jun, Jul
      
      let baseDepth = 0;
      if (isWinter) {
        baseDepth = 40 + Math.random() * 60; // 40-100cm in winter
      } else if (isSpring) {
        const springProgress = (month - 3) / 4; // 0 to 1
        baseDepth = Math.max(0, 60 * (1 - springProgress) + Math.random() * 20);
      }
      
      // Add elevation-based variation
      const elevationFactor = selectedLocation === 'mansfield' ? 1.5 : 
                             selectedLocation === 'killington' ? 1.4 :
                             selectedLocation === 'champlain' ? 0.3 : 1.0;
      
      const cleanDepth = Math.max(0, baseDepth * elevationFactor);
      const rawDepth = cleanDepth + (Math.random() - 0.5) * 10; // Add noise for raw data
      
      data.push({
        date: d.toISOString().split('T')[0],
        cleanData: Math.round(cleanDepth * 10) / 10,
        rawData: Math.round(rawDepth * 10) / 10,
        temperature: -5 + Math.random() * 15,
        precipitation: Math.random() * 20,
        formatted: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
    }
    
    return data;
  };

  const timeSeriesData = generateSnowDepthData();

  // Statistics for the selected data
  const calculateStats = () => {
    const depths = timeSeriesData.map(d => dataType === 'clean' ? d.cleanData : d.rawData);
    const maxDepth = Math.max(...depths);
    const avgDepth = depths.reduce((a, b) => a + b, 0) / depths.length;
    const currentDepth = depths[depths.length - 1];
    
    return {
      max: Math.round(maxDepth * 10) / 10,
      average: Math.round(avgDepth * 10) / 10,
      current: Math.round(currentDepth * 10) / 10,
      dataPoints: depths.length
    };
  };

  const stats = calculateStats();

  // Comparative analysis across seasons
  const generateSeasonComparison = () => {
    return seasons.map(season => ({
      season: season.name,
      maxDepth: 80 + Math.random() * 40,
      avgDepth: 35 + Math.random() * 25,
      peakDate: 'Feb 15',
      meltDate: season.status === 'Current' ? 'TBD' : 'May 20'
    }));
  };

  const seasonComparison = generateSeasonComparison();

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Main
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Advanced Snow Depth Analytics</h1>
                <p className="text-sm text-muted-foreground">Comprehensive time series analysis and seasonal comparisons</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Database className="h-3 w-3" />
                {dataType === 'clean' ? 'Clean Data' : 'Raw Data'}
              </Badge>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Controls Panel */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Analysis Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="space-y-2">
                <Label>Location</Label>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map(location => (
                      <SelectItem key={location.id} value={location.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{location.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">{location.elevation}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Season</Label>
                <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {seasons.map(season => (
                      <SelectItem key={season.id} value={season.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{season.name}</span>
                          <Badge variant={season.status === 'Current' ? 'default' : 'secondary'} className="ml-2">
                            {season.status}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Data Type</Label>
                <Select value={dataType} onValueChange={setDataType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clean">Clean Data</SelectItem>
                    <SelectItem value="raw">Raw Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="realtime" 
                    checked={showRealTime}
                    onCheckedChange={setShowRealTime}
                  />
                  <Label htmlFor="realtime" className="text-sm">Real-time Updates</Label>
                </div>
                {showRealTime && (
                  <div className="flex items-center gap-1 text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs">Live</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Quick Stats</Label>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Max Depth:</span>
                    <span className="font-medium">{stats.max}cm</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average:</span>
                    <span className="font-medium">{stats.average}cm</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current:</span>
                    <span className="font-medium">{stats.current}cm</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Analytics */}
        <Tabs defaultValue="timeseries" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="timeseries" className="flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              Time Series
            </TabsTrigger>
            <TabsTrigger value="seasonal" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Seasonal Compare
            </TabsTrigger>
            <TabsTrigger value="correlation" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Correlation
            </TabsTrigger>
            <TabsTrigger value="forecasting" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Forecasting
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeseries" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Time Series Chart */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Snowflake className="h-5 w-5 text-blue-500" />
                    Snow Depth Time Series - {selectedSeason}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <RechartsLineChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="formatted" />
                      <YAxis label={{ value: 'Depth (cm)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey={dataType === 'clean' ? 'cleanData' : 'rawData'} 
                        stroke="#2563eb" 
                        strokeWidth={2}
                        name="Snow Depth (cm)"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="temperature" 
                        stroke="#dc2626" 
                        strokeWidth={1}
                        name="Temperature (°C)"
                        yAxisId="temp"
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Statistics Panel */}
              <Card>
                <CardHeader>
                  <CardTitle>Analysis Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{stats.max}</div>
                      <div className="text-xs text-blue-600">Max Depth (cm)</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{stats.average}</div>
                      <div className="text-xs text-green-600">Season Avg (cm)</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{stats.current}</div>
                      <div className="text-xs text-orange-600">Current (cm)</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{stats.dataPoints}</div>
                      <div className="text-xs text-purple-600">Data Points</div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t">
                    <h4 className="font-medium">Location Details</h4>
                    <div className="text-sm space-y-2">
                      {locations.filter(l => l.id === selectedLocation).map(location => (
                        <div key={location.id}>
                          <div className="font-medium">{location.name}</div>
                          <div className="text-muted-foreground">Elevation: {location.elevation}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full" size="sm">
                    Generate Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="seasonal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Multi-Season Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={seasonComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="season" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="maxDepth" fill="#3b82f6" name="Maximum Depth (cm)" />
                    <Bar dataKey="avgDepth" fill="#10b981" name="Average Depth (cm)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="correlation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Snow Depth vs Temperature Correlation</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="temperature" name="Temperature (°C)" />
                    <YAxis dataKey={dataType === 'clean' ? 'cleanData' : 'rawData'} name="Snow Depth (cm)" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter 
                      dataKey={dataType === 'clean' ? 'cleanData' : 'rawData'} 
                      fill="#8884d8" 
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forecasting" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Snow Depth Forecasting Model</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-20">
                  <Zap className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
                  <h3 className="text-xl font-semibold mb-2">Advanced Forecasting</h3>
                  <p className="text-muted-foreground mb-6">
                    Machine learning models for snow depth prediction based on historical patterns,
                    weather forecasts, and elevation data.
                  </p>
                  <Button>
                    Run Forecasting Model
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;