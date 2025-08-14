import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Thermometer, Cloud, Mountain, Download, BarChart3 } from 'lucide-react';

const Hero = () => {
  const networkStats = [
    { icon: MapPin, value: '22+', label: 'Monitoring Sites', color: 'text-blue-600' },
    { icon: Mountain, value: '1124m', label: 'Elevation Range', color: 'text-green-600' },
    { icon: Thermometer, value: '5min', label: 'Data Resolution', color: 'text-orange-600' },
    { icon: Cloud, value: '24/7', label: 'Real-time Data', color: 'text-purple-600' }
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/lovable-uploads/9d5d35d8-43d8-4c2d-a89e-7522213fc836.png')`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto text-center">
          
          {/* Badge */}
          <Badge variant="outline" className="mb-6 bg-white/10 border-white/20 text-white backdrop-blur-sm">
            University of Vermont × CRREL Research Initiative
          </Badge>
          
          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight">
            SUMMIT-TO-SHORE
            <br />
            <span className="text-3xl md:text-4xl lg:text-5xl font-normal text-white/90">
              Snow Observatory Network
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-4xl mx-auto leading-relaxed">
            A world-class network of environmental monitoring stations across Vermont's elevational gradients
          </p>
          
          {/* Description */}
          <p className="text-lg text-white/80 mb-12 max-w-3xl mx-auto">
            Monitoring snowpack characteristics and meteorological variables at high spatial and temporal 
            resolution to understand snowpack dynamics in low-elevation montane environments.
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <a href="#analytics">
              <Button size="lg" className="bg-white text-black hover:bg-white/90 font-semibold">
                <BarChart3 className="mr-2 h-5 w-5" />
                Explore Live Data
              </Button>
            </a>
            <a href="#download">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm">
                <Download className="mr-2 h-5 w-5" />
                Download Data
              </Button>
            </a>
          </div>

          {/* Network Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {networkStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/15 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <Icon className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
                    <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-sm text-white/80">{stat.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;