import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Analytics from '@/components/Analytics';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

const RealTime = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">
                <Clock className="w-4 h-4 mr-2" />
                Real-time Data
              </Badge>
              <h1 className="scientific-heading text-4xl md:text-6xl mb-6">
                Live <span className="text-primary">Environmental</span>
                <br />Monitoring Dashboard
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Real-time environmental data from all monitoring stations across Vermont's Summit-to-Shore network.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
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