import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Radio, RefreshCw, MapPin, Thermometer, Droplets, Wind, Snowflake, AlertTriangle, Clock } from 'lucide-react';
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

const LiveData = () => {
  const [stations, setStations] = useState<StationMeta[]>([]);
  const [latestData, setLatestData] = useState<LatestStation[]>([]);
  const [selectedTable, setSelectedTable] = useState('core_observations_2024_2025_qaqc');
  const [tables, setTables] = useState<Array<{ id: string; name: string; displayName: string }>>([]);
  const [window, setWindow] = useState('7d');
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch station metadata
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/metadata/stations`)
      .then(r => r.json())
      .then(d => { if (d.stations) setStations(d.stations); })
      .catch(() => {});
  }, []);

  // Fetch seasonal tables
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/seasonal/tables`)
      .then(r => r.json())
      .then(d => {
        const t = Array.isArray(d) ? d : d.tables || [];
        setTables(t);
        if (t.length > 0 && !t.find((x: { id: string }) => x.id === selectedTable)) {
          setSelectedTable(t[0].id);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch latest data
  const fetchLatest = useCallback(async () => {
    if (!selectedTable) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/realtime/latest/seasonal_qaqc_data/${selectedTable}?window=${window}`
      );
      const data: LatestResponse = await res.json();
      if (data.success) {
        setLatestData(data.stations);
        setLastRefresh(data.meta.fetched_at);
      } else {
        setError('Failed to fetch data');
      }
    } catch {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  }, [selectedTable, window]);

  useEffect(() => { fetchLatest(); }, [fetchLatest]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchLatest, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchLatest]);

  // Find color for station
  const getStationColor = (code: string) => {
    const s = stations.find(st => st.code === code);
    return s?.color || '#6b7280';
  };

  const getStationMeta = (code: string) => {
    return stations.find(st => st.code === code);
  };

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
        <section className="py-12 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <Badge variant="outline" className="mb-4">
                <Radio className="w-4 h-4 mr-2 animate-pulse" />
                Live Data
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Real-Time <span className="text-primary">Station Status</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Latest readings from all monitoring stations. Data refreshes automatically every 5 minutes.
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Season:</span>
                <Select value={selectedTable} onValueChange={setSelectedTable}>
                  <SelectTrigger className="w-[260px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tables.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.displayName || t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Window:</span>
                <Select value={window} onValueChange={setWindow}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">1 hour</SelectItem>
                    <SelectItem value="6h">6 hours</SelectItem>
                    <SelectItem value="24h">24 hours</SelectItem>
                    <SelectItem value="7d">7 days</SelectItem>
                    <SelectItem value="30d">30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={fetchLatest} disabled={loading} variant="outline" size="sm">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {/* Status Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{activeStations.length}</div>
                  <div className="text-sm text-muted-foreground">Active Stations</div>
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
                  <div className="text-xs font-medium text-muted-foreground">
                    <Clock className="h-3 w-3 inline mr-1" />
                    Last refresh
                  </div>
                  <div className="text-sm font-mono mt-1">
                    {lastRefresh ? new Date(lastRefresh).toLocaleTimeString() : '--'}
                  </div>
                </CardContent>
              </Card>
            </div>

            {error && (
              <div className="text-center text-red-500 mb-4">{error}</div>
            )}

            {latestData.length === 0 && !loading && !error && (
              <div className="text-center text-muted-foreground py-12">
                <Radio className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No data found within the selected time window. Try a wider window (e.g., 30 days).</p>
              </div>
            )}

            {/* Station Cards */}
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
                      className={`relative overflow-hidden transition-all hover:shadow-lg ${station.is_stale ? 'opacity-60' : ''}`}
                    >
                      <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: color }} />
                      <CardHeader className="pb-2 pl-5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                            <CardTitle className="text-sm font-bold">{station.station}</CardTitle>
                          </div>
                          {station.is_stale ? (
                            <Badge variant="secondary" className="text-yellow-700 bg-yellow-100 text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />Stale
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-green-700 bg-green-100 text-xs">
                              Active
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground pl-5">
                          {meta?.publicName || station.name}
                        </p>
                      </CardHeader>
                      <CardContent className="pl-5 pb-3 space-y-2">
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {station.elevation ? `${station.elevation}m` : '--'}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {station.minutes_since_report !== null
                              ? station.minutes_since_report < 60
                                ? `${station.minutes_since_report}m ago`
                                : `${Math.floor(station.minutes_since_report / 60)}h ago`
                              : '--'}
                          </div>
                          <div className="flex items-center gap-1">
                            <Thermometer className="h-3 w-3 text-red-500" />
                            <span>{getValue(d, 'air_temperature_avg_c')}°C</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Droplets className="h-3 w-3 text-blue-500" />
                            <span>{getValue(d, 'relative_humidity_percent')}%</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Snowflake className="h-3 w-3 text-cyan-500" />
                            <span>{getValue(d, 'snow_depth_cm')}cm</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Wind className="h-3 w-3 text-gray-500" />
                            <span>{getValue(d, 'soil_temperature_c')}°C soil</span>
                          </div>
                        </div>
                        {station.last_reported_at && (
                          <div className="text-[10px] text-muted-foreground pt-1 border-t">
                            Last: {station.last_reported_at}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default LiveData;
