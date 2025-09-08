import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wind } from 'lucide-react';

interface WindData {
  speed: number;
  direction: number;
  gust: number;
  average: number;
}

const WindGauge = () => {
  const [windData, setWindData] = useState<WindData>({
    speed: 48.7,
    direction: 280,
    gust: 55,
    average: 42
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setWindData(prev => ({
        speed: prev.speed + (Math.random() - 0.5) * 4,
        direction: (prev.direction + (Math.random() - 0.5) * 10 + 360) % 360,
        gust: prev.speed + Math.random() * 10,
        average: prev.speed * 0.8 + Math.random() * 5
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getWindDirection = (degrees: number) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return directions[Math.round(degrees / 22.5) % 16];
  };

  const getSpeedColor = (speed: number) => {
    if (speed < 10) return '#22c55e'; // Green
    if (speed < 25) return '#eab308'; // Yellow
    if (speed < 40) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  // Create gauge marks
  const createGaugeMarks = () => {
    const marks = [];
    for (let i = 0; i <= 100; i += 10) {
      const angle = (i / 100) * 180 - 90;
      const x1 = 50 + 35 * Math.cos((angle * Math.PI) / 180);
      const y1 = 50 + 35 * Math.sin((angle * Math.PI) / 180);
      const x2 = 50 + 30 * Math.cos((angle * Math.PI) / 180);
      const y2 = 50 + 30 * Math.sin((angle * Math.PI) / 180);
      
      marks.push(
        <line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#64748b"
          strokeWidth={i % 20 === 0 ? 2 : 1}
        />
      );
      
      if (i % 20 === 0) {
        const x3 = 50 + 25 * Math.cos((angle * Math.PI) / 180);
        const y3 = 50 + 25 * Math.sin((angle * Math.PI) / 180);
        marks.push(
          <text
            key={`text-${i}`}
            x={x3}
            y={y3}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="8"
            fill="#64748b"
          >
            {i}
          </text>
        );
      }
    }
    return marks;
  };

  const needleAngle = (windData.speed / 100) * 180 - 90;
  const needleX = 50 + 25 * Math.cos((needleAngle * Math.PI) / 180);
  const needleY = 50 + 25 * Math.sin((needleAngle * Math.PI) / 180);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wind className="h-5 w-5" />
          Wind Speed Average, 10-Minute Max/Min, 24-Hour Gust (MPH)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          {/* Wind Speed Gauge */}
          <div className="relative w-64 h-32 mb-4">
            <svg viewBox="0 0 100 50" className="w-full h-full">
              {/* Gauge background */}
              <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="8"
                strokeLinecap="round"
              />
              
              {/* Gauge progress */}
              <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke={getSpeedColor(windData.speed)}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(windData.speed / 100) * 126} 126`}
                className="transition-all duration-500"
              />
              
              {/* Gauge marks and numbers */}
              {createGaugeMarks()}
              
              {/* Needle */}
              <line
                x1="50"
                y1="50"
                x2={needleX}
                y2={needleY}
                stroke="#1e293b"
                strokeWidth="2"
                strokeLinecap="round"
                className="transition-all duration-500"
              />
              <circle cx="50" cy="50" r="3" fill="#1e293b" />
            </svg>
            
            {/* Current Speed Display */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center">
              <div className="text-3xl font-bold" style={{ color: getSpeedColor(windData.speed) }}>
                {windData.speed.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">MPH</div>
            </div>
          </div>

          {/* Wind Direction Compass */}
          <div className="relative w-24 h-24 mb-4">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Compass circle */}
              <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="2" />
              
              {/* Cardinal directions */}
              <text x="50" y="15" textAnchor="middle" fontSize="12" fill="#64748b" fontWeight="bold">N</text>
              <text x="85" y="55" textAnchor="middle" fontSize="12" fill="#64748b" fontWeight="bold">E</text>
              <text x="50" y="90" textAnchor="middle" fontSize="12" fill="#64748b" fontWeight="bold">S</text>
              <text x="15" y="55" textAnchor="middle" fontSize="12" fill="#64748b" fontWeight="bold">W</text>
              
              {/* Wind arrow */}
              <g transform={`rotate(${windData.direction} 50 50)`}>
                <polygon
                  points="50,20 45,35 55,35"
                  fill="#ef4444"
                  className="transition-all duration-500"
                />
                <line x1="50" y1="35" x2="50" y2="70" stroke="#ef4444" strokeWidth="3" />
              </g>
            </svg>
          </div>

          {/* Wind Statistics */}
          <div className="grid grid-cols-2 gap-4 w-full text-center">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="text-lg font-bold text-blue-600">
                {getWindDirection(windData.direction)} ({windData.direction.toFixed(0)}°)
              </div>
              <div className="text-sm text-muted-foreground">Direction</div>
            </div>
            
            <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
              <div className="text-lg font-bold text-red-600">
                {windData.gust.toFixed(0)} mph
              </div>
              <div className="text-sm text-muted-foreground">Gust</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WindGauge;