import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SnowDepthChart from '@/components/SnowDepthChart';
import SnowDepthMap from '@/components/SnowDepthMap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Snowflake, BarChart3, Map, Download, Calendar, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const SnowAnalytics = () => {
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  const analyticsFeatures = [
    {
      title: 'Time Series Analysis',
      description: 'Compare raw vs cleaned snow depth measurements over time',
      icon: TrendingUp,
      color: 'bg-blue-500'
    },
    {
      title: 'Spatial Distribution',
      description: 'Interactive map showing snow depth across monitoring stations',
      icon: Map,
      color: 'bg-green-500'
    },
    {
      title: 'Data Quality Metrics',
      description: 'Quality assessment and improvement statistics',
      icon: BarChart3,
      color: 'bg-purple-500'
    },
    {
      title: 'Export & Download',
      description: 'Export processed data and visualizations',
      icon: Download,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-12 md:py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">
                <Snowflake className="w-4 h-4 mr-2" />
                Snow Depth Analytics
              </Badge>
              <h1 className="scientific-heading text-3xl md:text-5xl lg:text-6xl mb-6">
                Snow Depth <span className="text-primary">Time Series</span>
                <br />Analysis Platform
              </h1>
              <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
                Comprehensive visualization and analysis of DBTCDT (snow depth) measurements 
                from Vermont's environmental monitoring network with data quality comparisons.
              </p>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {analyticsFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card key={feature.title} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardHeader className="pb-3">
                      <div className={`w-10 h-10 rounded-lg ${feature.color} flex items-center justify-center mb-3`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Main Analytics Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8 md:mb-12">
              <Badge variant="outline" className="mb-4">
                <BarChart3 className="w-4 h-4 mr-2" />
                Interactive Dashboard
              </Badge>
              <h2 className="scientific-heading text-2xl md:text-3xl lg:text-4xl mb-4 md:mb-6">
                Snow Depth <span className="text-primary">Visualization</span>
              </h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                Explore time series data, spatial patterns, and data quality improvements 
                across all monitoring stations
              </p>
            </div>

            <Tabs defaultValue="timeseries" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-4 h-auto gap-1 p-1">
                <TabsTrigger value="timeseries" className="flex items-center gap-2 px-3 py-2 text-xs md:text-sm">
                  <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Time Series</span>
                  <span className="sm:hidden">Chart</span>
                </TabsTrigger>
                <TabsTrigger value="map" className="flex items-center gap-2 px-3 py-2 text-xs md:text-sm">
                  <Map className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Spatial Map</span>
                  <span className="sm:hidden">Map</span>
                </TabsTrigger>
                <TabsTrigger value="comparison" className="flex items-center gap-2 px-3 py-2 text-xs md:text-sm">
                  <BarChart3 className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Data Quality</span>
                  <span className="sm:hidden">Quality</span>
                </TabsTrigger>
                <TabsTrigger value="export" className="flex items-center gap-2 px-3 py-2 text-xs md:text-sm">
                  <Download className="h-3 w-3 md:h-4 md:w-4" />
                  Export
                </TabsTrigger>
              </TabsList>

              <TabsContent value="timeseries" className="mt-6">
                <SnowDepthChart className="w-full" />
              </TabsContent>

              <TabsContent value="map" className="mt-6">
                <SnowDepthMap 
                  className="w-full" 
                  onLocationSelect={setSelectedLocation}
                />
                {selectedLocation && (
                  <div className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Station Details: {selectedLocation}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <SnowDepthChart className="w-full" />
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="comparison" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Data Processing Impact
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">Raw Data</div>
                          <p className="text-sm text-muted-foreground">Direct sensor readings</p>
                          <p className="text-xs text-muted-foreground mt-1">Higher variance</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">Cleaned Data</div>
                          <p className="text-sm text-muted-foreground">Quality controlled</p>
                          <p className="text-xs text-muted-foreground mt-1">Reduced noise</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Data Quality Score</span>
                          <Badge variant="secondary">85% → 96%</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Variance Reduction</span>
                          <Badge variant="secondary">-23%</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Outlier Detection</span>
                          <Badge variant="secondary">12 removed</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Processing Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm">Total Measurements</span>
                          <span className="font-semibold">24,567</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Quality Flagged</span>
                          <span className="font-semibold text-orange-600">1,234 (5%)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Corrected Values</span>
                          <span className="font-semibold text-blue-600">456 (2%)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Validated Records</span>
                          <span className="font-semibold text-green-600">23,877 (97%)</span>
                        </div>
                      </div>
                      
                      <div className="pt-3 border-t">
                        <p className="text-xs text-muted-foreground">
                          Quality control process includes outlier detection, 
                          temporal consistency checks, and physical range validation.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="export" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="h-5 w-5" />
                      Data Export & Download
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                        <div className="flex items-center gap-2">
                          <Download className="h-4 w-4" />
                          <span className="font-medium">CSV Export</span>
                        </div>
                        <span className="text-xs text-muted-foreground text-left">
                          Download raw time series data
                        </span>
                      </Button>
                      
                      <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4" />
                          <span className="font-medium">Chart Images</span>
                        </div>
                        <span className="text-xs text-muted-foreground text-left">
                          Export charts as PNG/SVG
                        </span>
                      </Button>
                      
                      <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                        <div className="flex items-center gap-2">
                          <Map className="h-4 w-4" />
                          <span className="font-medium">GIS Data</span>
                        </div>
                        <span className="text-xs text-muted-foreground text-left">
                          Spatial data in Shapefile format
                        </span>
                      </Button>
                    </div>
                    
                    <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <strong>Note:</strong> Data exports include metadata, quality flags, 
                        and processing history. All timestamps are in UTC format.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-12 md:py-16 bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="container mx-auto px-4 text-center">
            <h2 className="scientific-heading text-2xl md:text-3xl mb-4">
              Need <span className="text-primary">Advanced</span> Analytics?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Access machine learning models, forecasting capabilities, and custom analysis tools 
              for deeper insights into snow depth patterns and climate trends.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="px-8">
                <Link to="/analytics/advanced">Advanced Analytics</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8">
                <Link to="/documentation">View Documentation</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default SnowAnalytics;