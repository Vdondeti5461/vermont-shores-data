import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Database, BarChart3, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DatabaseAnalyticsComparison from '@/components/DatabaseAnalyticsComparison';

const DataComparison = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/analytics')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Analytics
            </Button>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold">Database Comparison</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              Advanced Data Analytics
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              Multi-Database <span className="text-primary">Comparison</span> Analytics
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
              Compare environmental data quality and metrics across raw, clean, and processed databases. 
              Analyze data processing improvements, seasonal variations, and quality enhancements across 
              Vermont's environmental monitoring network.
            </p>
            
            {/* Feature highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <Card className="text-center">
                <CardContent className="p-4">
                  <Database className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Multi-Database Access</h3>
                  <p className="text-sm text-muted-foreground">Raw, Clean & Processed Data</p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-4">
                  <BarChart3 className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Quality Comparison</h3>
                  <p className="text-sm text-muted-foreground">Data Processing Improvements</p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-4">
                  <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Seasonal Analysis</h3>
                  <p className="text-sm text-muted-foreground">Multi-Season Data Insights</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Main Comparison Component */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <DatabaseAnalyticsComparison />
        </div>
      </section>

      {/* Information Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">
              Understanding <span className="text-primary">Data Processing</span> Levels
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    Raw Data
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Direct sensor readings without any processing or validation. May contain outliers, 
                    sensor errors, and missing values.
                  </p>
                  <Badge variant="outline">Unprocessed</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    Clean Data
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Quality-controlled data with outlier removal, basic validation, and gap filling. 
                    Suitable for most research applications.
                  </p>
                  <Badge variant="secondary">Quality Controlled</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    Processed Data
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Fully processed data with advanced corrections, calibrations, and derived variables. 
                    Research-ready with highest quality assurance.
                  </p>
                  <Badge variant="default">Research Ready</Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DataComparison;