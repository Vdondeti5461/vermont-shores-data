import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Analytics } from '@/components/Analytics';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

const RealTime = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 sm:mb-16">
              <Badge variant="outline" className="mb-4 text-xs sm:text-sm">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Real-time Data
              </Badge>
              <h1 className="scientific-heading text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 sm:mb-6 leading-tight">
                Live <span className="text-primary">Environmental</span>
                <br className="hidden xs:block" />Monitoring Dashboard
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto px-2 sm:px-4">
                Real-time environmental data from all monitoring stations across Vermont's Summit-to-Shore network.
              </p>
            </div>
          </div>
        </section>

        <section className="py-8 sm:py-12 md:py-16">
          <div className="container mx-auto px-4">
            <Analytics />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default RealTime;