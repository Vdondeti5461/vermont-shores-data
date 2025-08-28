import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLocalDatabaseOverview, useLocalHealthCheck } from '@/hooks/useLocalDatabase';
import { RefreshCw, Database, AlertCircle, CheckCircle } from 'lucide-react';
import { API_BASE_URL } from '@/lib/apiConfig';

const DatabaseStatus = () => {
  const { data: isHealthy, isLoading, refetch } = useLocalHealthCheck();
  const { locations, analytics } = useLocalDatabaseOverview();

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Local Database Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
              ) : isHealthy ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <Badge 
                variant={isHealthy ? "default" : "destructive"}
                className={isHealthy ? "bg-green-100 text-green-800" : ""}
              >
                {isLoading ? 'Checking...' : isHealthy ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
            
            {isHealthy && (
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>{locations.length} locations</span>
                <span>API: localhost:3001</span>
              </div>
            )}
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Test Connection
          </Button>
        </div>
        
        {!isHealthy && !isLoading && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-red-700">
              Unable to connect to local database. Make sure your server is running on localhost:3001
            </p>
            <p className="text-xs text-red-600 mt-1">
              Run: <code>cd server && npm run dev</code>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DatabaseStatus;