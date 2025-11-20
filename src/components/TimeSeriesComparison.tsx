import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DatabaseType, TimeSeriesDataPoint } from '@/services/realTimeAnalyticsService';
import { Loader2 } from 'lucide-react';

interface TimeSeriesComparisonProps {
  comparisonData: { database: DatabaseType; data: TimeSeriesDataPoint[] }[];
  selectedAttributes: string[];
  isLoading: boolean;
}

const DATABASE_COLORS: Record<DatabaseType, string> = {
  'CRRELS2S_raw_data_ingestion': '#ef4444',
  'CRRELS2S_stage_clean_data': '#3b82f6',
  'CRRELS2S_stage_qaqc_data': '#22c55e',
  'CRRELS2S_seasonal_qaqc_data': '#a855f7',
};

const DATABASE_LABELS: Record<DatabaseType, string> = {
  'CRRELS2S_raw_data_ingestion': 'Raw Data',
  'CRRELS2S_stage_clean_data': 'Clean Data',
  'CRRELS2S_stage_qaqc_data': 'QAQC Data',
  'CRRELS2S_seasonal_qaqc_data': 'Seasonal QAQC',
};

export const TimeSeriesComparison = ({ 
  comparisonData, 
  selectedAttributes, 
  isLoading 
}: TimeSeriesComparisonProps) => {
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!comparisonData || comparisonData.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <p className="text-muted-foreground">Select databases and attributes to compare</p>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for comparison chart
  const prepareComparisonData = (attribute: string) => {
    const allTimestamps = new Set<string>();
    comparisonData.forEach(({ data }) => {
      data.forEach((point) => allTimestamps.add(point.timestamp));
    });

    const sortedTimestamps = Array.from(allTimestamps).sort();
    
    return sortedTimestamps.map((timestamp) => {
      const point: any = { timestamp };
      
      comparisonData.forEach(({ database, data }) => {
        const dataPoint = data.find((d) => d.timestamp === timestamp);
        point[database] = dataPoint ? dataPoint[attribute] : null;
      });
      
      return point;
    });
  };

  return (
    <div className="space-y-6">
      {selectedAttributes.map((attribute) => {
        const chartData = prepareComparisonData(attribute);
        
        return (
          <Card key={attribute}>
            <CardHeader>
              <CardTitle className="capitalize">
                {attribute.replace(/_/g, ' ')} - Multi-Quality Comparison
              </CardTitle>
              <CardDescription>
                Comparing data quality levels for {attribute}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {comparisonData.map(({ database }) => (
                    <Line
                      key={database}
                      type="monotone"
                      dataKey={database}
                      name={DATABASE_LABELS[database]}
                      stroke={DATABASE_COLORS[database]}
                      strokeWidth={2}
                      dot={false}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
