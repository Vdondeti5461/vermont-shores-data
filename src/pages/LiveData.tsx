import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Radio, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LiveData = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full shadow-xl">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="flex justify-center">
            <div className="relative">
              <Radio className="h-20 w-20 text-primary animate-pulse" />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            </div>
          </div>
          <CardTitle className="text-3xl md:text-4xl font-bold">
            Real-Time Data Streaming
          </CardTitle>
          <CardDescription className="text-lg">
            Coming Soon
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-6 space-y-4">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Live Environmental Data</h3>
                <p className="text-muted-foreground">
                  We're working on bringing you real-time environmental data streaming from our network of sensors. 
                  Monitor snow depth, temperature, humidity, and other metrics as they happen.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-center text-muted-foreground">
              Stay tuned for updates!
            </h4>
            <p className="text-sm text-center text-muted-foreground">
              In the meantime, you can explore our historical data through the Data Download section.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              className="flex-1 gap-2"
            >
              <Home className="h-4 w-4" />
              Go Home
            </Button>
            <Button 
              onClick={() => navigate('/download')}
              className="flex-1"
            >
              Explore Data Download
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveData;
