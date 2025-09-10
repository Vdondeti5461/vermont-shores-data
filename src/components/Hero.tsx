import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, BarChart3 } from 'lucide-react';


const Hero = () => {
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
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-4 sm:mb-6 leading-tight animate-fade-in px-2">
            SUMMIT-TO-SHORE
            <br />
            <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-normal text-green-100 block mt-2">
              Snow Observatory Network
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed animate-fade-in px-4">
            Monitoring snowpack characteristics and meteorological variables across <span className="text-green-200 font-semibold">Vermont's</span> elevational gradients from valley floors to mountain peaks
          </p>
          
          {/* Description */}
          <p className="text-sm sm:text-base lg:text-lg text-white/80 mb-8 sm:mb-12 max-w-3xl mx-auto animate-fade-in px-4 leading-relaxed">
            22 monitoring stations from 45m (Potash Brook) to 1170m (Ranch Brook) elevation, including 12 dedicated sites 
            on Mount Mansfield. High-resolution data supports computational snowpack models in understudied 
            low-elevation montane environments. <span className="text-green-200 font-medium">Powered by University of Vermont research excellence.</span>
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-12 sm:mb-16 animate-fade-in px-4">
            <a href="/analytics" className="group w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover-scale px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg">
                <BarChart3 className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 group-hover:animate-pulse" />
                <span className="hidden sm:inline">Explore Live Data</span>
                <span className="sm:hidden">Live Data</span>
                <span className="ml-2 text-green-100">→</span>
              </Button>
            </a>
            <a href="/download" className="group w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-green-700/90 hover:bg-green-600 text-white border-2 border-green-500/50 backdrop-blur-sm font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover-scale px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg">
                <Download className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 group-hover:animate-pulse" />
                <span className="hidden sm:inline">Download Data</span>
                <span className="sm:hidden">Download</span>
                <span className="ml-2 text-green-100">→</span>
              </Button>
            </a>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;