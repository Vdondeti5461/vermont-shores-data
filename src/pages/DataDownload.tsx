import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DownloadInterface from '@/components/DownloadInterface';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, Database, Code, FileText, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const DataDownloadPage = () => {
  const downloadOptions = [
    {
      title: 'CSV Downloads',
      description: 'Export filtered datasets in CSV format',
      icon: FileText,
      features: ['Custom date ranges', 'Station selection', 'Parameter filtering']
    },
    {
      title: 'API Access',
      description: 'Programmatic access to real-time data',
      icon: Code,
      features: ['REST API endpoints', 'JSON responses', 'Rate limiting']
    },
    {
      title: 'Bulk Export',
      description: 'Download complete datasets',
      icon: Database,
      features: ['Full historical data', 'Multiple formats', 'Compressed archives']
    },
    {
      title: 'Real-time Feeds',
      description: 'Live data streaming and webhooks',
      icon: Zap,
      features: ['WebSocket connections', 'Push notifications', 'Real-time updates']
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">
                <Download className="w-4 h-4 mr-2" />
                Data Access
              </Badge>
              <h1 className="scientific-heading text-4xl md:text-6xl mb-6">
                <span className="text-primary">Download</span> Research
                <br />Data & APIs
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Access comprehensive environmental datasets from Vermont's Summit-to-Shore monitoring network. 
                Download filtered data, use our APIs, or access real-time data feeds.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {downloadOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Card key={option.title} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="text-center pb-3">
                      <Icon className="h-8 w-8 text-primary mx-auto mb-2" />
                      <CardTitle className="text-lg">{option.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">{option.description}</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {option.features.map((feature, index) => (
                          <li key={index}>• {feature}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Download Interface */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">
                Interactive Download
              </Badge>
              <h2 className="scientific-heading text-3xl md:text-4xl mb-6">
                Custom <span className="text-primary">Data Export</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Filter and download exactly the data you need for your research
              </p>
            </div>

            <DownloadInterface />
          </div>
        </section>

        {/* Data Access Methods */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">
                Access Methods
              </Badge>
              <h2 className="scientific-heading text-3xl md:text-4xl mb-6">
                Multiple <span className="text-primary">Access Options</span>
              </h2>
            </div>

            <Tabs defaultValue="browse" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="browse">Browse & Download</TabsTrigger>
                <TabsTrigger value="api">API Documentation</TabsTrigger>
                <TabsTrigger value="bulk">Bulk Downloads</TabsTrigger>
                <TabsTrigger value="feeds">Real-time Feeds</TabsTrigger>
              </TabsList>

              <TabsContent value="browse" className="mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Interactive Data Browser</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-6">
                      Use our web interface to explore, filter, and download data with custom parameters.
                    </p>
                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold mb-2">Station Selection</h4>
                        <p className="text-sm text-muted-foreground">Choose specific monitoring stations</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold mb-2">Date Filtering</h4>
                        <p className="text-sm text-muted-foreground">Select custom date ranges</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold mb-2">Parameter Selection</h4>
                        <p className="text-sm text-muted-foreground">Choose specific measurements</p>
                      </div>
                    </div>
                    <Button>Start Browsing Data</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="api" className="mt-8">
                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>RESTful API Endpoints</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">GET</Badge>
                            <code className="text-sm">/api/locations</code>
                          </div>
                          <p className="text-sm text-muted-foreground">Get all monitoring station locations</p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">GET</Badge>
                            <code className="text-sm">/api/data/:table</code>
                          </div>
                          <p className="text-sm text-muted-foreground">Get environmental data from specific tables</p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">GET</Badge>
                            <code className="text-sm">/api/analytics</code>
                          </div>
                          <p className="text-sm text-muted-foreground">Get analytics summaries and metrics</p>
                        </div>
                      </div>
                      <div className="mt-6">
                        <Button asChild>
                          <Link to="/documentation/api">View Full API Documentation</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="bulk" className="mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Bulk Data Downloads</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-6">
                      Download complete datasets for offline analysis and long-term storage.
                    </p>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">Available Datasets</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li>• Complete temperature records (2015-present)</li>
                          <li>• Wind and precipitation data</li>
                          <li>• Snow water equivalent measurements</li>
                          <li>• Soil moisture and temperature</li>
                          <li>• Solar radiation data</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3">Format Options</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li>• CSV (Comma-separated values)</li>
                          <li>• JSON (JavaScript Object Notation)</li>
                          <li>• NetCDF (Network Common Data Form)</li>
                          <li>• Compressed archives (ZIP, TAR.GZ)</li>
                        </ul>
                      </div>
                    </div>
                    <div className="mt-6">
                      <Button>Request Bulk Download</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="feeds" className="mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Real-time Data Feeds</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-6">
                      Subscribe to live data streams and get real-time updates as new measurements arrive.
                    </p>
                    <div className="grid gap-4">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold mb-2">WebSocket Streaming</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Real-time data streaming via WebSocket connections
                        </p>
                        <code className="text-xs bg-white p-2 rounded block">
                          wss://api.summit2shore.org/stream
                        </code>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold mb-2">Webhook Notifications</h4>
                        <p className="text-sm text-muted-foreground">
                          HTTP callbacks when new data arrives or thresholds are exceeded
                        </p>
                      </div>
                    </div>
                    <div className="mt-6">
                      <Button asChild>
                        <Link to="/documentation/feeds">Setup Real-time Feeds</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default DataDownloadPage;