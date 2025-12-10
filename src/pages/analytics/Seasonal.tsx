import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SeasonalAnalyticsDashboard } from '@/components/SeasonalAnalyticsDashboard';
import { Badge } from '@/components/ui/badge';
import { Snowflake } from 'lucide-react';

const Seasonal = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 sm:mb-16">
              <Badge variant="outline" className="mb-4">
                <Snowflake className="w-4 h-4 mr-2" />
                Seasonal Analysis
              </Badge>
              <h1 className="scientific-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-6">
                Seasonal <span className="text-primary">Snow Depth</span>
                <br />Comparison
              </h1>
              <p className="text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto">
                Compare snow depth patterns across three winter seasons using quality-controlled QAQC data. 
                Analyze year-over-year trends and variations from Vermont's Summit-to-Shore monitoring network.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <SeasonalAnalyticsDashboard />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Seasonal;
