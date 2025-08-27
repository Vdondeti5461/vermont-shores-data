import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MultiDatabaseDownload from '@/components/MultiDatabaseDownload';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, Database, Code, FileText, Zap, BookOpen } from 'lucide-react';
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
                Multi-Database Access
              </Badge>
              <h2 className="scientific-heading text-3xl md:text-4xl mb-6">
                Dynamic <span className="text-primary">Data Export</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Access data from multiple databases with timestamp and location-based filtering
              </p>
            </div>

            <MultiDatabaseDownload />
          </div>
        </section>

        {/* Data Access Methods */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              Access Methods & Bulk Downloads
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
                    Use our web interface to explore, filter, and download data with custom parameters based on 
                    TIMESTAMP and Location as primary filtering criteria.
                  </p>
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold mb-2">Database Selection</h4>
                      <p className="text-sm text-muted-foreground">Choose from raw, cleaned, or processed databases</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold mb-2">Location & Time Filtering</h4>
                      <p className="text-sm text-muted-foreground">Filter by specific locations and date ranges</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold mb-2">Attribute Selection</h4>
                      <p className="text-sm text-muted-foreground">Choose specific environmental measurements</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    <strong>Data Age:</strong> 3 Years of comprehensive environmental monitoring data available.
                  </p>
                  <Button>Start Browsing Data</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="api" className="mt-8">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Industry-Standard RESTful API</CardTitle>
                    <p className="text-muted-foreground">
                      Professional-grade API with comprehensive documentation, error handling, and data validation.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">GET</Badge>
                          <code className="text-sm">/api/databases</code>
                        </div>
                        <p className="text-sm text-muted-foreground">Get all available databases with metadata</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">GET</Badge>
                          <code className="text-sm">/api/databases/:db/tables</code>
                        </div>
                        <p className="text-sm text-muted-foreground">Get tables with performance optimization</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">GET</Badge>
                          <code className="text-sm">/api/databases/:db/locations</code>
                        </div>
                        <p className="text-sm text-muted-foreground">Get locations with accurate coordinates and elevation</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">GET</Badge>
                          <code className="text-sm">/api/databases/:db/download/:table</code>
                        </div>
                        <p className="text-sm text-muted-foreground">Download filtered data with proper timestamp formatting (YYYY-MM-DD HH:mm:ss)</p>
                      </div>
                    </div>
                    <div className="mt-6 space-y-4">
                      <div className="p-4 bg-primary/5 rounded-lg">
                        <h4 className="font-semibold mb-2">Primary Filtering Parameters</h4>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p><code>location</code> - Filter by specific location code (RB01, SUMM, etc.)</p>
                          <p><code>start_date</code> - ISO date string for start of date range</p>
                          <p><code>end_date</code> - ISO date string for end of date range</p>
                          <p><code>attributes</code> - Comma-separated list of specific attributes</p>
                          <p><code>limit</code> - Maximum number of records (performance optimization)</p>
                        </div>
                      </div>
                      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                        <h4 className="font-semibold mb-2">New Metadata Endpoints</h4>
                        <div className="text-sm space-y-1">
                          <p><code>GET /api/metadata/locations</code> - Complete location information</p>
                          <p><code>GET /api/metadata/tables/:table</code> - Detailed table attribute descriptions</p>
                        </div>
                      </div>
                      <Button asChild>
                        <Link to="/documentation">
                          <BookOpen className="w-4 h-4 mr-2" />
                          View Complete API Documentation
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="bulk" className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Bulk Data Request System</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">
                    Request complete datasets for offline analysis and research. All requests are processed by our team 
                    and require user details for data sharing compliance.
                  </p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Available for Bulk Download</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Complete environmental records (3 years of data)</li>
                        <li>• Multi-database exports (raw, cleaned, processed)</li>
                        <li>• Wind and precipitation historical data</li>
                        <li>• Snow water equivalent and temperature profiles</li>
                        <li>• Soil moisture and radiation measurements</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Request Requirements</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Full name and email address</li>
                        <li>• Organization/Institution affiliation</li>
                        <li>• Research purpose and description</li>
                        <li>• Specific datasets and date ranges</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      <strong>Note:</strong> NetCDF format is not currently available but may be provided upon special request. 
                      All requests are routed to s2s@uvm.edu for processing.
                    </p>
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
                    Subscribe to live data streams and get real-time updates as new measurements arrive from our 22 monitoring stations.
                  </p>
                  <div className="grid gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold mb-2">WebSocket Streaming</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Real-time data streaming via WebSocket connections
                      </p>
                      <code className="text-xs bg-white dark:bg-muted p-2 rounded block">
                        wss://api.summit2shore.org/stream
                      </code>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold mb-2">Webhook Notifications</h4>
                      <p className="text-sm text-muted-foreground">
                        HTTP callbacks when new data arrives or environmental thresholds are exceeded
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