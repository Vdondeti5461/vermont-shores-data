import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Thermometer, Wind, Droplets, Gauge, CloudSnow } from 'lucide-react';
import { useOptimizedAnalytics } from '@/hooks/useOptimizedAnalytics';

interface CurrentConditions {
  location: string;
  timestamp: string;
  temperature: number;
  snowDepth: number;
  windSpeed: number;
  windDirection: number;
  humidity: number;
  pressure: number;
  conditions: string;
}

const RealTimeConditions = () => {
  const { analyticsData, selectedLocation, locations } = useOptimizedAnalytics();
  const [currentConditions, setCurrentConditions] = useState<CurrentConditions | null>(null);

  useEffect(() => {
    if (analyticsData.length > 0) {
      const latest = analyticsData[analyticsData.length - 1];
      const location = locations.find(l => l.id === latest.location_id);
      
      setCurrentConditions({
        location: location?.name || 'Unknown Location',
        timestamp: new Date().toLocaleString(),
        temperature: latest.temperature,
        snowDepth: latest.snow_depth_clean,
        windSpeed: latest.wind_speed,
        windDirection: Math.floor(Math.random() * 360), // Mock wind direction
        humidity: latest.humidity,
        pressure: 29.5 + Math.random() * 2, // Mock pressure in inHg
        conditions: latest.snow_depth_clean > 0 ? 'Snow Cover' : 'Clear'
      });
    }
  }, [analyticsData, locations]);

  if (!currentConditions) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Current Conditions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            Loading current conditions...
          </div>
        </CardContent>
      </Card>
    );
  }

  const getWindDirection = (degrees: number) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return directions[Math.round(degrees / 22.5) % 16];
  };

  const getTemperatureColor = (temp: number) => {
    if (temp <= 0) return 'text-blue-500';
    if (temp <= 32) return 'text-cyan-500';
    if (temp <= 60) return 'text-green-500';
    if (temp <= 80) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Current Conditions - {currentConditions.location}
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Last Updated: {currentConditions.timestamp}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Temperature */}
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-lg">
            <Thermometer className={`h-6 w-6 mx-auto mb-2 ${getTemperatureColor(currentConditions.temperature)}`} />
            <div className={`text-2xl font-bold ${getTemperatureColor(currentConditions.temperature)}`}>
              {currentConditions.temperature.toFixed(1)}°F
            </div>
            <p className="text-xs text-muted-foreground">Temperature</p>
          </div>

          {/* Snow Depth */}
          <div className="text-center p-4 bg-gradient-to-br from-white to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 rounded-lg">
            <CloudSnow className="h-6 w-6 mx-auto mb-2 text-white" />
            <div className="text-2xl font-bold text-white">
              {currentConditions.snowDepth.toFixed(1)}"
            </div>
            <p className="text-xs text-muted-foreground">Snow Depth</p>
          </div>

          {/* Wind Speed */}
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-lg">
            <Wind className="h-6 w-6 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-600">
              {currentConditions.windSpeed.toFixed(0)} mph
            </div>
            <p className="text-xs text-muted-foreground">Wind Speed</p>
          </div>

          {/* Wind Direction */}
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 rounded-lg">
            <div className="w-6 h-6 mx-auto mb-2 relative">
              <div 
                className="w-1 h-3 bg-purple-600 absolute top-0 left-1/2 transform -translate-x-1/2 origin-bottom"
                style={{ transform: `translate(-50%, 0) rotate(${currentConditions.windDirection}deg)` }}
              />
              <div className="w-6 h-6 border-2 border-purple-600 rounded-full" />
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {getWindDirection(currentConditions.windDirection)}
            </div>
            <p className="text-xs text-muted-foreground">{currentConditions.windDirection}°</p>
          </div>

          {/* Humidity */}
          <div className="text-center p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950/20 dark:to-cyan-900/20 rounded-lg">
            <Droplets className="h-6 w-6 mx-auto mb-2 text-cyan-600" />
            <div className="text-2xl font-bold text-cyan-600">
              {currentConditions.humidity.toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">Humidity</p>
          </div>

          {/* Pressure */}
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 rounded-lg">
            <Gauge className="h-6 w-6 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold text-orange-600">
              {currentConditions.pressure.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">inHg</p>
          </div>
        </div>

        {/* Current Weather Condition */}
        <div className="mt-4 text-center">
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {currentConditions.conditions}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default RealTimeConditions;