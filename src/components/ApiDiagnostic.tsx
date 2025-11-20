import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/lib/apiConfig';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2, RefreshCw } from 'lucide-react';

export const ApiDiagnostic = () => {
  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [message, setMessage] = useState('');
  const [databases, setDatabases] = useState<any[]>([]);

  const testConnection = async () => {
    setStatus('checking');
    setMessage('Testing API connection...');
    
    try {
      console.log('🔍 Testing API connection to:', API_BASE_URL);
      
      // Test health endpoint first
      const healthResponse = await fetch(`${API_BASE_URL}/api/health`);
      console.log('Health check response:', healthResponse.status);
      
      if (!healthResponse.ok) {
        throw new Error(`Health check failed: ${healthResponse.status}`);
      }
      
      const healthData = await healthResponse.json();
      console.log('Health data:', healthData);
      
      // Test databases endpoint
      const dbResponse = await fetch(`${API_BASE_URL}/api/databases`);
      console.log('Databases response:', dbResponse.status);
      
      if (!dbResponse.ok) {
        const errorText = await dbResponse.text();
        throw new Error(`Databases fetch failed: ${dbResponse.status} - ${errorText}`);
      }
      
      const dbData = await dbResponse.json();
      console.log('Databases data:', dbData);
      
      setDatabases(dbData);
      setStatus('success');
      setMessage(`Successfully connected! Found ${dbData.length} databases.`);
      
    } catch (error: any) {
      console.error('API connection test failed:', error);
      setStatus('error');
      setMessage(`Connection failed: ${error.message}`);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          API Connection Diagnostic
          {status === 'checking' && <Loader2 className="h-4 w-4 animate-spin" />}
          {status === 'success' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
          {status === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
        </CardTitle>
        <CardDescription>
          Testing connection to backend API server
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm">
            <span className="font-medium">API Base URL:</span>{' '}
            <code className="bg-muted px-2 py-1 rounded text-xs">{API_BASE_URL}</code>
          </div>
          
          <div className="text-sm">
            <span className="font-medium">Status:</span>{' '}
            <Badge variant={status === 'success' ? 'default' : status === 'error' ? 'destructive' : 'secondary'}>
              {message}
            </Badge>
          </div>
        </div>

        {status === 'error' && (
          <Button onClick={testConnection} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Connection
          </Button>
        )}

        {databases.length > 0 && (
          <div className="mt-4">
            <div className="text-sm font-medium mb-2">Databases Found:</div>
            <div className="space-y-1">
              {databases.map((db) => (
                <div key={db.id} className="text-xs bg-muted p-2 rounded">
                  <div className="font-medium">{db.displayName || db.name}</div>
                  <div className="text-muted-foreground">{db.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
