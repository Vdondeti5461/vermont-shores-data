import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SnowAnalyticsDashboard } from '@/components/analytics/SnowAnalyticsDashboard';
import { Badge } from '@/components/ui/badge';
import { Snowflake, BarChart3 } from 'lucide-react';

const SnowAnalytics = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-12 sm:py-16 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <Badge variant="outline" className="mb-4 border-primary/30">
                <Snowflake className="w-4 h-4 mr-2" />
                Snow Analytics Platform
              </Badge>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
                Snow <span className="text-primary">Metrics</span> Analytics
              </h1>
              <p className="text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto">
                Compare snow depth, snow water equivalent, and density across raw, clean, 
                and quality-controlled data stages. Publication-ready visualizations with 
                interactive exploration capabilities.
              </p>
            </div>
            
            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <Badge variant="secondary" className="px-4 py-1.5">
                <BarChart3 className="w-3 h-3 mr-1.5" />
                Time Series Comparison
              </Badge>
              <Badge variant="secondary" className="px-4 py-1.5">
                3-Stage Quality Analysis
              </Badge>
              <Badge variant="secondary" className="px-4 py-1.5">
                22 Monitoring Locations
              </Badge>
              <Badge variant="secondary" className="px-4 py-1.5">
                Export Ready
              </Badge>
            </div>
          </div>
        </section>

        {/* Dashboard Section */}
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <SnowAnalyticsDashboard />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SnowAnalytics;
