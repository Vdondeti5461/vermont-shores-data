import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '@/lib/apiConfig';

interface HealthStatus {
  status: 'checking' | 'healthy' | 'unhealthy';
  message: string;
  lastChecked?: Date;
  details?: any;
}

const DatabaseHealthChecker = () => {
  const [health, setHealth] = useState<HealthStatus>({
    status: 'checking',
    message: 'Checking API connection...'
  });

  const checkHealth = async () => {
    setHealth({ status: 'checking', message: 'Checking API connection...' });
    
    try {
      console.log(`[Health Check] Testing connection to: ${API_BASE_URL}/api/health`);
      
      const response = await fetch(`${API_BASE_URL}/api/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      console.log(`[Health Check] Response status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`[Health Check] Response data:`, data);
        
        setHealth({
          status: 'healthy',
          message: 'API connection successful',
          lastChecked: new Date(),
          details: data
        });
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('[Health Check] Failed:', error);
      
      setHealth({
        status: 'unhealthy',
        message: 'Unable to connect to API server',
        lastChecked: new Date(),
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const getIcon = () => {
    switch (health.status) {
      case 'checking':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'healthy':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'unhealthy':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getAlertClass = () => {
    switch (health.status) {
      case 'healthy':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950';
      case 'unhealthy':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950';
      default:
        return '';
    }
  };

  return (
    <Alert className={getAlertClass()}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getIcon()}
          <div>
            <AlertDescription>
              <strong>API Status:</strong> {health.message}
              {health.lastChecked && (
                <span className="text-sm text-muted-foreground ml-2">
                  (Last checked: {health.lastChecked.toLocaleTimeString()})
                </span>
              )}
            </AlertDescription>
            {health.status === 'unhealthy' && (
              <AlertDescription className="mt-1 text-sm">
                <strong>Details:</strong> {health.details}
                <br />
                <strong>API URL:</strong> {API_BASE_URL}
                <br />
                <em>Make sure the production server is running and accessible.</em>
              </AlertDescription>
            )}
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={checkHealth}
          disabled={health.status === 'checking'}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  );
};

export default DatabaseHealthChecker;