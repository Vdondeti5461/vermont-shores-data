import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Database, TrendingUp, Download } from 'lucide-react';
import heroImage from '@/assets/vermont-hero.jpg';

const Hero = () => {
  const stats = [
    { label: 'Data Collection Sites', value: '22', icon: MapPin },
    { label: 'Environmental Parameters', value: '15+', icon: Database },
    { label: 'Years of Data', value: '5+', icon: TrendingUp },
    { label: 'Data Points Collected', value: '2.4M+', icon: Database },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <Badge variant="secondary" className="mb-6 bg-secondary/90 text-secondary-foreground">
            Environmental Research • University of Vermont
          </Badge>

          {/* Main Heading */}
          <h1 className="scientific-heading text-5xl md:text-7xl mb-6">
            Summit <span className="text-secondary">2</span> Shore
          </h1>
          <h2 className="text-xl md:text-2xl font-medium mb-6 text-gray-200">
            Vermont Environmental & Climate Data Research Portal
          </h2>
          
          {/* Description */}
          <p className="text-lg md:text-xl leading-relaxed mb-8 max-w-3xl mx-auto text-gray-300">
            Comprehensive environmental and climatic data collection across 22 strategic locations throughout Vermont. 
            From mountain summits to lake shores, advancing climate research and environmental understanding.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="btn-research px-8 py-3 text-lg">
              <MapPin className="mr-2 h-5 w-5" />
              Explore Data Map
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="btn-data border-white/30 hover:bg-white/10 text-white hover:text-white px-8 py-3 text-lg"
            >
              <Download className="mr-2 h-5 w-5" />
              Download Dataset
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="data-card p-6 text-center bg-white/10 backdrop-blur-sm border-white/20">
                  <Icon className="h-8 w-8 mx-auto mb-3 text-secondary" />
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-300">{stat.label}</div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;