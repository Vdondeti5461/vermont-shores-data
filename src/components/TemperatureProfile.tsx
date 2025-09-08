import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Thermometer } from 'lucide-react';

interface ElevationData {
  elevation: string;
  temperature: number;
  color: string;
}

const TemperatureProfile = () => {
  // Mock elevation temperature data similar to Mount Washington Observatory
  const elevationData: ElevationData[] = [
    { elevation: '6288\'', temperature: -6.7, color: '#ef4444' },
    { elevation: '5300\'', temperature: 1.4, color: '#f97316' },
    { elevation: '4300\'', temperature: 8.0, color: '#eab308' },
    { elevation: '4000\'', temperature: 12.3, color: '#84cc16' },
    { elevation: '3300\'', temperature: 18.1, color: '#22c55e' },
    { elevation: '2300\'', temperature: 24.4, color: '#06b6d4' },
    { elevation: '1600\'', temperature: 28.6, color: '#3b82f6' },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{`Elevation: ${label}`}</p>
          <p className="text-blue-600">
            {`Temperature: ${payload[0].value.toFixed(1)}°F`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Thermometer className="h-5 w-5" />
          Vertical Temperature Profile (°F)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={elevationData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="elevation" 
              angle={-45}
              textAnchor="end"
              height={60}
              fontSize={12}
            />
            <YAxis 
              domain={[-10, 30]}
              tickFormatter={(value) => `${value}°F`}
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="temperature" 
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Temperature decreases with elevation - showing significant gradient across Vermont's peaks
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TemperatureProfile;