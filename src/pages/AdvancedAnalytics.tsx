import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, TrendingUp, Activity, AlertCircle } from 'lucide-react';

const AdvancedAnalytics = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 sm:mb-16">
              <Badge variant="outline" className="mb-4 text-xs sm:text-sm">
                <Brain className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Machine Learning
              </Badge>
              <h1 className="scientific-heading text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 sm:mb-6 leading-tight">
                Advanced <span className="text-primary">Analytics</span>
                <br className="hidden xs:block" />& Machine Learning
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto px-2 sm:px-4">
                AI-powered predictions and insights from environmental monitoring data
              </p>
            </div>
          </div>
        </section>

        <section className="py-8 sm:py-12 md:py-16">
          <div className="container mx-auto px-4">
            <Alert className="mb-8">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Machine learning models are currently in development. This section will feature predictive analytics, 
                anomaly detection, and forecasting capabilities once models are trained and validated.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Forecasting Models
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Predict future environmental conditions based on historical patterns and trends.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Snow Depth Prediction</span>
                      <Badge variant="secondary">Planned</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Temperature Forecasting</span>
                      <Badge variant="secondary">Planned</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Anomaly Detection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Automatically identify unusual patterns and outliers in environmental data.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sensor Failure Detection</span>
                      <Badge variant="secondary">Planned</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Weather Event Detection</span>
                      <Badge variant="secondary">Planned</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    Pattern Recognition
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Discover hidden patterns and correlations in multi-variable environmental data.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Seasonal Pattern Analysis</span>
                      <Badge variant="secondary">Planned</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cross-Location Correlation</span>
                      <Badge variant="secondary">Planned</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Future Capabilities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Time Series Forecasting</h3>
                    <p className="text-sm text-muted-foreground">
                      Advanced LSTM and Transformer models for predicting environmental conditions up to 30 days ahead.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Climate Change Impact Analysis</h3>
                    <p className="text-sm text-muted-foreground">
                      Long-term trend analysis to assess climate change impacts on Vermont's ecosystems.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Real-time Alert System</h3>
                    <p className="text-sm text-muted-foreground">
                      Automated alerts for critical environmental conditions and sensor anomalies.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Multi-modal Analysis</h3>
                    <p className="text-sm text-muted-foreground">
                      Integration of satellite imagery, weather data, and ground sensors for comprehensive environmental modeling.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AdvancedAnalytics;
