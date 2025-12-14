import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { RealTimeAnalytics } from '@/components/RealTimeAnalytics';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';

const RealTime = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 sm:mb-16">
              <Badge variant="outline" className="mb-4">
                <Activity className="w-4 h-4 mr-2" />
                Live Monitoring
              </Badge>
              <h1 className="scientific-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-6">
                Real-Time <span className="text-primary">Environmental</span>
                <br />Monitoring
              </h1>
              <p className="text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto">
                Monitor live environmental data from Vermont's Summit-to-Shore sensor network. 
                Data streams every 10 minutes, comparing raw sensor readings with cleaned datasets.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <RealTimeAnalytics />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default RealTime;
