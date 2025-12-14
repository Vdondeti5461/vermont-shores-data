import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';


const Hero = () => {
  return (
    <section className="relative min-h-screen xs:min-h-[calc(100vh-3rem)] flex items-center justify-center overflow-hidden pt-14 xs:pt-12 md:pt-16" style={{ minHeight: 'calc(var(--vh, 1vh) * 100)' }}>
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/images/hero-mountain.png')`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 xs:px-3 py-8 xs:py-6 md:py-20 hero-content">
        <div className="max-w-6xl mx-auto text-center">
          
          {/* Badge */}
          <div className="mb-6 animate-fade-in">
            <Badge variant="outline" className="mb-4 bg-white/10 border-white/20 text-white backdrop-blur-sm hover-scale">
              <span className="text-green-200">University of Vermont</span> × CRREL Research Initiative
            </Badge>
          </div>
          
          {/* Main Title */}
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-white mb-3 xs:mb-4 md:mb-6 leading-tight animate-fade-in px-2">
            SUMMIT-TO-SHORE
            <br />
            <span className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-normal text-green-100 block mt-1 md:mt-2">
              Snow Observatory Network
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-4 xs:mb-6 md:mb-8 max-w-4xl mx-auto leading-relaxed animate-fade-in px-2">
            Monitoring snowpack characteristics and meteorological variables across <span className="text-green-200 font-semibold">Vermont's</span> elevational gradients from valley floors to mountain peaks
          </p>
          
          {/* Description */}
          <p className="text-xs xs:text-sm sm:text-base md:text-lg text-white/80 mb-6 xs:mb-8 md:mb-12 max-w-3xl mx-auto animate-fade-in px-2 leading-relaxed">
            22 monitoring stations from 45m (Potash Brook) to 1170m (Ranch Brook) elevation, including 12 dedicated sites 
            on Mount Mansfield. High-resolution data supports computational snowpack models in understudied 
            low-elevation montane environments. <span className="text-green-200 font-medium">Powered by University of Vermont research excellence.</span>
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col xs:flex-col sm:flex-row gap-3 xs:gap-4 md:gap-6 justify-center mb-8 xs:mb-12 md:mb-16 animate-fade-in px-2">
            <Link to="/analytics" className="group w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto btn-research font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover-scale touch:active:scale-95 px-4 xs:px-6 md:px-8 py-3 xs:py-4 text-sm xs:text-base md:text-lg min-h-[48px] xs:min-h-[52px]">
                <BarChart3 className="mr-2 xs:mr-3 h-4 w-4 xs:h-5 xs:w-5 md:h-6 md:w-6 group-hover:animate-pulse" />
                <span className="hidden xs:inline md:hidden">Live Data</span>
                <span className="xs:hidden md:inline">Explore Live Data</span>
                <span className="ml-2 text-primary-foreground/80">→</span>
              </Button>
            </Link>
            <Link to="/download" className="group w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border-2 border-white/20 backdrop-blur-sm font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover-scale touch:active:scale-95 px-4 xs:px-6 md:px-8 py-3 xs:py-4 text-sm xs:text-base md:text-lg min-h-[48px] xs:min-h-[52px]">
                <Download className="mr-2 xs:mr-3 h-4 w-4 xs:h-5 xs:w-5 md:h-6 md:w-6 group-hover:animate-pulse" />
                <span className="hidden xs:inline md:hidden">Download</span>
                <span className="xs:hidden md:inline">Download Data</span>
                <span className="ml-2 text-white/80">→</span>
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;