import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, TrendingUp, GitCompare, AlertTriangle, Activity, Info } from 'lucide-react';

const AdvancedAnalytics = () => {
  const upcomingFeatures = [
    {
      title: 'Machine Learning Models',
      description: 'Predictive analytics for snow depth, temperature, and precipitation forecasting using LSTM and time series models',
      icon: Brain,
      status: 'In Development'
    },
    {
      title: 'Trend Analysis',
      description: 'Long-term climate pattern detection, seasonal trend identification, and climate change impact assessment',
      icon: TrendingUp,
      status: 'Planned'
    },
    {
      title: 'Correlation Analysis',
      description: 'Multi-variate analysis showing relationships between environmental attributes across elevation gradients',
      icon: GitCompare,
      status: 'Planned'
    },
    {
      title: 'Anomaly Detection',
      description: 'Automated detection of unusual patterns, sensor failures, and extreme weather events in real-time',
      icon: AlertTriangle,
      status: 'Planned'
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">
                <Brain className="w-4 h-4 mr-2" />
                Advanced Analytics
              </Badge>
              <h1 className="scientific-heading text-4xl md:text-6xl mb-6">
                Predictive <span className="text-primary">Analysis</span> & Machine Learning
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Advanced analytical tools and machine learning models for environmental data forecasting, 
                trend detection, and pattern recognition across Vermont's Summit-to-Shore monitoring network.
              </p>
            </div>

            <Alert className="max-w-4xl mx-auto mb-12">
              <Info className="h-5 w-5" />
              <AlertDescription className="text-base">
                <strong>Status:</strong> Machine learning features are currently under development. 
                While these advanced capabilities are being built, you can explore existing analytics 
                tools for data quality comparison and time series visualization.
              </AlertDescription>
            </Alert>

            <div className="max-w-4xl mx-auto">
              <Card className="border-2 border-primary/20 mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-6 w-6 text-primary" />
                    Upcoming Features
                  </CardTitle>
                  <CardDescription>
                    Advanced analytics capabilities in development for environmental data analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingFeatures.map((feature) => {
                    const Icon = feature.icon;
                    return (
                      <div
                        key={feature.title}
                        className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                      >
                        <Icon className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-base">{feature.title}</h3>
                            <Badge variant="outline" className="text-xs">
                              {feature.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Current Capabilities</CardTitle>
                  <CardDescription>
                    Available now while advanced features are being developed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Multi-Quality Data Comparison
                      </h3>
                      <p className="text-sm text-muted-foreground pl-4">
                        Compare time series data across raw, clean, QAQC, and seasonal quality levels 
                        to understand data processing impacts and quality improvements.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Four Observation Tables
                      </h3>
                      <p className="text-sm text-muted-foreground pl-4">
                        Analyze data from core environmental observations, wind measurements, 
                        snowpack temperature profiles, and precipitation observations.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Seasonal Analysis (2022-2025)
                      </h3>
                      <p className="text-sm text-muted-foreground pl-4">
                        Explore three complete seasons of quality-controlled environmental data 
                        with location-based filtering and attribute selection.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Data Export Tools
                      </h3>
                      <p className="text-sm text-muted-foreground pl-4">
                        Download environmental data in CSV and Excel formats with comprehensive 
                        metadata for your research and analysis needs.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AdvancedAnalytics;
