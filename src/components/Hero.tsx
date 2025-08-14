import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Thermometer, Cloud, Mountain, Download, BarChart3 } from 'lucide-react';

const Hero = () => {
  const networkStats = [
    { icon: MapPin, value: '22+', label: 'Monitoring Sites', color: 'text-blue-400' },
    { icon: Mountain, value: '1124m', label: 'Elevation Range', color: 'text-green-400' },
    { icon: Thermometer, value: '5min', label: 'Data Resolution', color: 'text-orange-400' },
    { icon: Cloud, value: '24/7', label: 'Real-time Data', color: 'text-purple-400' }
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
          <div className="mb-6 animate-fade-in">
            <Badge variant="outline" className="mb-4 bg-white/10 border-white/20 text-white backdrop-blur-sm hover-scale">
              <span className="text-green-200">University of Vermont</span> × CRREL Research Initiative
            </Badge>
          </div>
          
          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight animate-fade-in">
            SUMMIT-TO-SHORE
            <br />
            <span className="text-3xl md:text-4xl lg:text-5xl font-normal text-green-100">
              Snow Observatory Network
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-4xl mx-auto leading-relaxed animate-fade-in">
            A world-class network of environmental monitoring stations across <span className="text-green-200 font-semibold">Vermont's</span> elevational gradients
          </p>
          
          {/* Description */}
          <p className="text-lg text-white/80 mb-12 max-w-3xl mx-auto animate-fade-in">
            Monitoring snowpack characteristics and meteorological variables at high spatial and temporal 
            resolution to understand snowpack dynamics in low-elevation montane environments. 
            <span className="text-green-200 font-medium">Powered by University of Vermont research excellence.</span>
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 animate-fade-in">
            <a href="#analytics" className="group">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover-scale px-8 py-4 text-lg">
                <BarChart3 className="mr-3 h-6 w-6 group-hover:animate-pulse" />
                Explore Live Data
                <span className="ml-2 text-green-100">→</span>
              </Button>
            </a>
            <a href="#download" className="group">
              <Button size="lg" className="bg-green-700/90 hover:bg-green-600 text-white border-2 border-green-500/50 backdrop-blur-sm font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover-scale px-8 py-4 text-lg">
                <Download className="mr-3 h-6 w-6 group-hover:animate-pulse" />
                Download Data
                <span className="ml-2 text-green-100">→</span>
              </Button>
            </a>
          </div>

          {/* Network Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto animate-fade-in">
            {networkStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/15 transition-all duration-300 hover-scale group">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-green-600/20 rounded-full flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                      <Icon className={`h-6 w-6 ${stat.color} group-hover:scale-110 transition-transform`} />
                    </div>
                    <div className="text-2xl font-bold text-white mb-1 group-hover:text-green-100">{stat.value}</div>
                    <div className="text-sm text-white/80 group-hover:text-white">{stat.label}</div>
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