import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Radio, RefreshCw, MapPin, Thermometer, Droplets, Wind, Snowflake, AlertTriangle, Clock, Database, Activity } from 'lucide-react';
import { API_BASE_URL } from '@/lib/apiConfig';

interface StationMeta {
  code: string;
  name: string;
  publicName: string;
  latitude: number;
  longitude: number;
  elevation: number;
  network: string;
  zone: string;
  color: string;
}

interface LatestStation {
  station: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  elevation: number | null;
  last_reported_at: string | null;
  minutes_since_report: number | null;
  is_stale: boolean;
  data: Record<string, unknown>;
}

interface LatestResponse {
  success: boolean;
  version: string;
  window: string;
  stations: LatestStation[];
  meta: { count: number; fetched_at: string };
}

// Data sources: analytics DB has combined tables (public, no auth needed)
// raw_data DB has individual tables (requires API key)
const DATA_SOURCES = [
  { db: 'analytics', table: 'raw_env_combined_observations', label: 'Raw Sensor Data (Live)', description: 'Latest unprocessed readings from all sensors' },
  { db: 'analytics', table: 'clean_env_combined_observations', label: 'Cleaned Data (QC Applied)', description: 'Data with basic quality control filters applied' },
];

const TIME_WINDOWS = [
  { value: '1h', label: '1 Hour' },
  { value: '6h', label: '6 Hours' },
  { value: '24h', label: '24 Hours' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
];

const LiveData = () => {
  const [stations, setStations] = useState<StationMeta[]>([]);
  const [latestData, setLatestData] = useState<LatestStation[]>([]);
  const [sourceIndex, setSourceIndex] = useState(0);
  const [timeWindow, setTimeWindow] = useState('7d');
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentSource = DATA_SOURCES[sourceIndex];

  // Fetch station metadata (public endpoint)
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/metadata/stations`)
      .then(r => r.json())
      .then(d => { if (d.stations) setStations(d.stations); })
      .catch(() => {});
  }, []);

  // Fetch latest data from the selected source
  const fetchLatest = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { db, table } = currentSource;
      const res = await fetch(
        `${API_BASE_URL}/api/realtime/latest/${db}/${table}?window=${timeWindow}`
      );
      const data: LatestResponse = await res.json();
      if (data.success) {
        setLatestData(data.stations);
        setLastRefresh(data.meta.fetched_at);
      } else {
        setError(data.stations?.length === 0 ? 'No data in this time window' : 'Failed to fetch data');
        setLatestData([]);
      }
    } catch {
      setError('Connection error — check if the API server is running');
      setLatestData([]);
    } finally {
      setLoading(false);
    }
  }, [currentSource, timeWindow]);

  useEffect(() => { fetchLatest(); }, [fetchLatest]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchLatest, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchLatest]);

  const getStationMeta = (code: string) => stations.find(st => st.code === code);
  const getStationColor = (code: string) => getStationMeta(code)?.color || '#6b7280';

  const getValue = (data: Record<string, unknown>, key: string): string => {
    const v = data[key];
    if (v === null || v === undefined) return '--';
    if (typeof v === 'number') return v.toFixed(1);
    return String(v);
  };

  const activeStations = latestData.filter(s => !s.is_stale);
  const staleStations = latestData.filter(s => s.is_stale);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        {/* Hero */}
        <section className="py-10 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <Badge variant="outline" className="mb-4">
                <Radio className="w-4 h-4 mr-2 animate-pulse" />
                Live Sensor Feed
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Real-Time <span className="text-primary">Station Monitor</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Live environmental readings from 22 monitoring stations across Vermont.
                Data streams from field sensors via the ingestion pipeline into the raw database,
                then through quality control stages. Select a data source to see the latest readings.
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <Select value={String(sourceIndex)} onValueChange={(v) => setSourceIndex(Number(v))}>
                  <SelectTrigger className="w-[280px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DATA_SOURCES.map((src, i) => (
                      <SelectItem key={i} value={String(i)}>{src.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Select value={timeWindow} onValueChange={setTimeWindow}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_WINDOWS.map(w => (
                      <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={fetchLatest} disabled={loading} variant="outline" size="sm">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground mb-8">
              {currentSource.description} &middot; Auto-refreshes every 5 minutes
            </p>

            {/* Status Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{activeStations.length}</div>
                  <div className="text-sm text-muted-foreground">Active</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{staleStations.length}</div>
                  <div className="text-sm text-muted-foreground">Stale / Offline</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{latestData.length}</div>
                  <div className="text-sm text-muted-foreground">Total Reporting</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-xs text-muted-foreground mb-1">Last Refresh</div>
                  <div className="text-sm font-mono">
                    {lastRefresh ? new Date(lastRefresh).toLocaleTimeString() : '--'}
                  </div>
                </CardContent>
              </Card>
            </div>

            {error && (
              <div className="text-center text-yellow-600 bg-yellow-50 rounded-lg p-4 mb-6">
                <AlertTriangle className="h-5 w-5 inline mr-2" />
                {error}. Try a wider time window.
              </div>
            )}

            {latestData.length === 0 && !loading && !error && (
              <div className="text-center text-muted-foreground py-12">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No data found within the {timeWindow} window. Try a wider window (7d or 30d).</p>
              </div>
            )}

            {/* Station Views */}
            <Tabs defaultValue="grid">
              <TabsList className="mb-6">
                <TabsTrigger value="grid">Station Cards</TabsTrigger>
                <TabsTrigger value="table">Data Table</TabsTrigger>
              </TabsList>

              {/* Grid View */}
              <TabsContent value="grid">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {latestData
                    .sort((a, b) => (b.elevation || 0) - (a.elevation || 0))
                    .map(station => {
                      const meta = getStationMeta(station.station);
                      const color = getStationColor(station.station);
                      const d = station.data || {};
                      return (
                        <Card
                          key={station.station}
                          className={`relative overflow-hidden transition-all hover:shadow-lg ${station.is_stale ? 'opacity-50' : ''}`}
                        >
                          <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: color }} />
                          <CardHeader className="pb-2 pl-5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full border border-white shadow-sm" style={{ backgroundColor: color }} />
                                <CardTitle className="text-sm font-bold font-mono">{station.station}</CardTitle>
                              </div>
                              {station.is_stale ? (
                                <Badge variant="secondary" className="text-yellow-700 bg-yellow-100 text-xs">
                                  <AlertTriangle className="h-3 w-3 mr-1" />Offline
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-green-700 bg-green-100 text-xs">
                                  <Activity className="h-3 w-3 mr-1" />Live
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground pl-5">
                              {meta?.publicName || station.name}
                            </p>
                          </CardHeader>
                          <CardContent className="pl-5 pb-3 space-y-2">
                            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                {station.elevation ? `${station.elevation}m` : '--'}
                                {meta?.zone && <span className="text-[10px]">({meta.zone})</span>}
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {station.minutes_since_report !== null
                                  ? station.minutes_since_report < 60
                                    ? `${station.minutes_since_report}m ago`
                                    : station.minutes_since_report < 1440
                                      ? `${Math.floor(station.minutes_since_report / 60)}h ago`
                                      : `${Math.floor(station.minutes_since_report / 1440)}d ago`
                                  : '--'}
                              </div>
                              <div className="flex items-center gap-1">
                                <Thermometer className="h-3 w-3 text-red-500" />
                                <span className="font-medium">{getValue(d, 'air_temperature_avg_c')}°C</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Droplets className="h-3 w-3 text-blue-500" />
                                <span>{getValue(d, 'relative_humidity_percent')}%</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Snowflake className="h-3 w-3 text-cyan-500" />
                                <span>{getValue(d, 'snow_depth_cm')}cm snow</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Wind className="h-3 w-3 text-gray-500" />
                                <span>{getValue(d, 'wind_speed_avg_ms')}m/s</span>
                              </div>
                            </div>
                            {station.last_reported_at && (
                              <div className="text-[10px] text-muted-foreground pt-1 border-t font-mono">
                                {station.last_reported_at}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              </TabsContent>

              {/* Table View */}
              <TabsContent value="table">
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="text-left p-3 font-medium">Station</th>
                            <th className="text-left p-3 font-medium">Name</th>
                            <th className="text-right p-3 font-medium">Elev (m)</th>
                            <th className="text-right p-3 font-medium">Temp (°C)</th>
                            <th className="text-right p-3 font-medium">RH (%)</th>
                            <th className="text-right p-3 font-medium">Snow (cm)</th>
                            <th className="text-right p-3 font-medium">Wind (m/s)</th>
                            <th className="text-left p-3 font-medium">Status</th>
                            <th className="text-left p-3 font-medium">Last Report</th>
                          </tr>
                        </thead>
                        <tbody>
                          {latestData
                            .sort((a, b) => (b.elevation || 0) - (a.elevation || 0))
                            .map(station => {
                              const meta = getStationMeta(station.station);
                              const color = getStationColor(station.station);
                              const d = station.data || {};
                              return (
                                <tr key={station.station} className={`border-b hover:bg-muted/30 ${station.is_stale ? 'opacity-50' : ''}`}>
                                  <td className="p-3">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                                      <span className="font-mono font-medium">{station.station}</span>
                                    </div>
                                  </td>
                                  <td className="p-3 text-muted-foreground">{meta?.publicName || station.name}</td>
                                  <td className="p-3 text-right">{station.elevation || '--'}</td>
                                  <td className="p-3 text-right font-medium">{getValue(d, 'air_temperature_avg_c')}</td>
                                  <td className="p-3 text-right">{getValue(d, 'relative_humidity_percent')}</td>
                                  <td className="p-3 text-right">{getValue(d, 'snow_depth_cm')}</td>
                                  <td className="p-3 text-right">{getValue(d, 'wind_speed_avg_ms')}</td>
                                  <td className="p-3">
                                    {station.is_stale
                                      ? <Badge variant="secondary" className="text-yellow-700 bg-yellow-100 text-xs">Offline</Badge>
                                      : <Badge variant="secondary" className="text-green-700 bg-green-100 text-xs">Live</Badge>
                                    }
                                  </td>
                                  <td className="p-3 text-xs font-mono text-muted-foreground">{station.last_reported_at || '--'}</td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Data Pipeline Info */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Data Pipeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
                  <Badge variant="outline" className="py-1.5">Field Sensors</Badge>
                  <span className="text-muted-foreground">→</span>
                  <Badge variant="outline" className="py-1.5 border-red-300 text-red-700">Raw Data Ingestion</Badge>
                  <span className="text-muted-foreground">→</span>
                  <Badge variant="outline" className="py-1.5 border-yellow-300 text-yellow-700">Stage Clean (QC)</Badge>
                  <span className="text-muted-foreground">→</span>
                  <Badge variant="outline" className="py-1.5 border-blue-300 text-blue-700">Stage QAQC</Badge>
                  <span className="text-muted-foreground">→</span>
                  <Badge variant="outline" className="py-1.5 border-green-300 text-green-700">Seasonal QAQC</Badge>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  This page shows data from the <strong>Analytics</strong> database — a unified view of raw and cleaned observations optimized for real-time queries.
                  Raw data arrives from field loggers, flows through quality control stages, and is available here within minutes.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default LiveData;
