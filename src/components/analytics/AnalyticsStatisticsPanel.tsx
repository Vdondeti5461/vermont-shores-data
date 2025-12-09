import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DatabaseType } from '@/services/realTimeAnalyticsService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Database, BarChart3, CheckCircle2, AlertTriangle } from 'lucide-react';

interface StatisticsData {
  mean: number;
  min: number;
  max: number;
  stdDev: number;
  count: number;
  completeness: number;
  isServerComputed?: boolean;
  totalRecords?: number;
}

interface AnalyticsStatisticsPanelProps {
  statistics: Record<DatabaseType, StatisticsData>;
  attributeInfo?: {
    label: string;
    unit: string;
    value: string;
  };
  locationName: string;
  visibleDatabases: Set<DatabaseType>;
  sampledPointsCount?: number;
}

const DATABASE_COLORS: Record<DatabaseType, string> = {
  'CRRELS2S_Analytics': 'hsl(270, 70%, 55%)',
  'CRRELS2S_raw_data_ingestion': 'hsl(0, 75%, 55%)',
  'CRRELS2S_stage_clean_data': 'hsl(217, 85%, 55%)',
  'CRRELS2S_stage_qaqc_data': 'hsl(142, 70%, 42%)',
  'CRRELS2S_seasonal_qaqc_data': 'hsl(280, 70%, 55%)',
};

const DATABASE_LABELS: Record<DatabaseType, string> = {
  'CRRELS2S_Analytics': 'Analytics',
  'CRRELS2S_raw_data_ingestion': 'Raw Data',
  'CRRELS2S_stage_clean_data': 'Clean Data',
  'CRRELS2S_stage_qaqc_data': 'QAQC Data',
  'CRRELS2S_seasonal_qaqc_data': 'Seasonal QAQC',
};

const DATABASE_ORDER: DatabaseType[] = [
  'CRRELS2S_raw_data_ingestion',
  'CRRELS2S_stage_clean_data',
  'CRRELS2S_stage_qaqc_data',
];

export const AnalyticsStatisticsPanel = ({
  statistics,
  attributeInfo,
  locationName,
  visibleDatabases,
  sampledPointsCount,
}: AnalyticsStatisticsPanelProps) => {
  const visibleDbs = DATABASE_ORDER.filter(db => visibleDatabases.has(db));
  
  // Calculate total records from server stats
  const totalServerRecords = visibleDbs.reduce((sum, db) => {
    const stats = statistics[db];
    return sum + (stats?.isServerComputed ? stats.count : 0);
  }, 0);
  
  const hasServerStats = visibleDbs.some(db => statistics[db]?.isServerComputed);

  // Prepare bar chart data
  const barChartData = visibleDbs.map(db => ({
    name: DATABASE_LABELS[db],
    database: db,
    mean: statistics[db]?.mean || 0,
    min: statistics[db]?.min || 0,
    max: statistics[db]?.max || 0,
    stdDev: statistics[db]?.stdDev || 0,
  }));

  // Calculate improvements between stages
  const getImprovement = (metric: 'mean' | 'stdDev', fromDb: DatabaseType, toDb: DatabaseType) => {
    const fromStats = statistics[fromDb];
    const toStats = statistics[toDb];
    if (!fromStats || !toStats) return null;

    if (metric === 'stdDev') {
      // Lower std dev is better
      const improvement = ((fromStats.stdDev - toStats.stdDev) / fromStats.stdDev) * 100;
      return isNaN(improvement) ? null : improvement;
    }
    return null;
  };

  const stdDevImprovement = getImprovement('stdDev', 'CRRELS2S_raw_data_ingestion', 'CRRELS2S_stage_qaqc_data');

  return (
    <div className="space-y-6">
      {/* Overview Header with Data Source Indicator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Statistical Summary
            {hasServerStats && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className="ml-2 gap-1 text-xs bg-green-50 text-green-700 border-green-200">
                      <CheckCircle2 className="w-3 h-3" />
                      Full Dataset
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Statistics computed from all {totalServerRecords.toLocaleString()} records</p>
                    <p className="text-xs text-muted-foreground">Not affected by chart sampling</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </CardTitle>
          <CardDescription className="flex items-center gap-2 flex-wrap">
            <span>{attributeInfo?.label} at {locationName} | {attributeInfo?.unit}</span>
            {sampledPointsCount && hasServerStats && (
              <span className="text-xs text-muted-foreground">
                (Chart shows {sampledPointsCount.toLocaleString()} sampled points)
              </span>
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {visibleDbs.map((db) => {
          const stats = statistics[db];
          if (!stats) return null;

          return (
            <Card key={db} className="relative overflow-hidden">
              <div 
                className="absolute top-0 left-0 w-full h-1"
                style={{ backgroundColor: DATABASE_COLORS[db] }}
              />
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4" style={{ color: DATABASE_COLORS[db] }} />
                    {DATABASE_LABELS[db]}
                  </div>
                  {stats.isServerComputed ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Computed from {stats.totalRecords?.toLocaleString()} records</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Computed from sampled data only</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Mean */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Mean</span>
                  <span className="font-mono font-semibold">
                    {stats.mean.toFixed(2)} {attributeInfo?.unit}
                  </span>
                </div>

                {/* Min / Max */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Range</span>
                  <span className="font-mono text-sm">
                    {stats.min.toFixed(2)} — {stats.max.toFixed(2)}
                  </span>
                </div>

                {/* Std Dev */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Std. Deviation</span>
                  <span className="font-mono text-sm">
                    ±{stats.stdDev.toFixed(2)}
                  </span>
                </div>

                {/* Data Count */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Data Points</span>
                  <Badge variant="secondary">{stats.count.toLocaleString()}</Badge>
                </div>

                {/* Completeness */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Completeness</span>
                    <span className="font-mono">{stats.completeness.toFixed(1)}%</span>
                  </div>
                  <Progress value={stats.completeness} className="h-2" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Comparison Bar Chart */}
      {barChartData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mean Value Comparison</CardTitle>
            <CardDescription>
              Compare average {attributeInfo?.label?.toLowerCase()} across data processing stages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  label={{ 
                    value: attributeInfo?.unit || '', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { fontSize: 12 }
                  }}
                />
                <RechartsTooltip 
                  formatter={(value: any) => [`${value.toFixed(2)} ${attributeInfo?.unit}`, 'Mean']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="mean" radius={[4, 4, 0, 0]}>
                  {barChartData.map((entry) => (
                    <Cell key={entry.database} fill={DATABASE_COLORS[entry.database]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Quality Improvement Insights */}
      {stdDevImprovement !== null && visibleDbs.length === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Data Quality Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {stdDevImprovement > 0 ? (
                    <TrendingDown className="w-4 h-4 text-green-500" />
                  ) : stdDevImprovement < 0 ? (
                    <TrendingUp className="w-4 h-4 text-red-500" />
                  ) : (
                    <Minus className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="font-medium">Variability Reduction</span>
                </div>
                <p className="text-2xl font-bold">
                  {Math.abs(stdDevImprovement).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {stdDevImprovement > 0 
                    ? 'Lower variability in QAQC data compared to raw'
                    : 'Higher variability in QAQC data (potential data removal)'
                  }
                </p>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4 text-primary" />
                  <span className="font-medium">Processing Summary</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Data progresses through three stages: Raw sensor data undergoes 
                  basic cleaning filters, then advanced QAQC with calibration and 
                  temporal consistency checks.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
