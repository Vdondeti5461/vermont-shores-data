import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Key, Copy, Trash2, Plus, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '@/lib/apiConfig';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface APIKey {
  id: string;
  name: string;
  key_prefix: string;
  description: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
  total_requests: number;
  rate_limit_per_hour: number;
  rate_limit_per_day: number;
  expires_at: string | null;
}

export default function APIKeys() {
  const navigate = useNavigate();
  const location = useLocation();
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewKey, setShowNewKey] = useState(false);
  const [newKeyValue, setNewKeyValue] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      navigate('/auth');
      return;
    }
    fetchAPIKeys();
  }, [navigate]);

  const fetchAPIKeys = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api-keys`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setApiKeys(data.keys || []);
      } else if (response.status === 401) {
        localStorage.removeItem('auth_token');
        navigate('/auth');
      }
    } catch (error) {
      toast.error('Failed to fetch API keys');
    } finally {
      setIsLoading(false);
    }
  };

  const createAPIKey = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCreating(true);
    const formData = new FormData(e.currentTarget);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api-keys`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.get('name'),
          description: formData.get('description'),
          rate_limit_per_hour: parseInt(formData.get('rate_limit_per_hour') as string) || 1000,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setNewKeyValue(data.api_key);
        setShowNewKey(true);
        fetchAPIKeys();
        toast.success('API key created successfully!');
      } else {
        toast.error(data.message || 'Failed to create API key');
      }
    } catch (error) {
      toast.error('Connection error');
    } finally {
      setIsCreating(false);
    }
  };

  const deleteAPIKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key?')) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api-keys/${keyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('API key revoked');
        fetchAPIKeys();
      } else {
        toast.error('Failed to revoke API key');
      }
    } catch (error) {
      toast.error('Connection error');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">API Key Management</h1>
            <p className="text-muted-foreground">
              Generate and manage API keys for programmatic data access
            </p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>

        <div className="grid gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New API Key
              </CardTitle>
              <CardDescription>
                Generate a new API key to access Summit2Shore data programmatically
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={createAPIKey} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Key Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="My Research Project"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rate_limit_per_hour">Hourly Rate Limit</Label>
                    <Input
                      id="rate_limit_per_hour"
                      name="rate_limit_per_hour"
                      type="number"
                      placeholder="1000"
                      defaultValue="1000"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    placeholder="Used for analyzing snow depth patterns in Vermont watersheds"
                  />
                </div>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? 'Generating...' : 'Generate API Key'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {showNewKey && newKeyValue && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="text-primary">Your New API Key</CardTitle>
                <CardDescription>
                  Copy this key now. You won't be able to see it again!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input value={newKeyValue} readOnly className="font-mono" />
                  <Button onClick={() => copyToClipboard(newKeyValue)} size="icon">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  onClick={() => setShowNewKey(false)}
                  variant="outline"
                  className="mt-4"
                >
                  I've Saved My Key
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Your API Keys
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground text-center py-8">Loading...</p>
            ) : apiKeys.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No API keys yet. Create one above to get started.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Key Prefix</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Rate Limits</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell className="font-medium">
                        {key.name}
                        {key.description && (
                          <p className="text-xs text-muted-foreground">{key.description}</p>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm">{key.key_prefix}...</TableCell>
                      <TableCell>
                        <Badge variant={key.is_active ? 'default' : 'secondary'}>
                          {key.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>{key.total_requests.toLocaleString()} requests</TableCell>
                      <TableCell className="text-sm">
                        {key.rate_limit_per_hour}/hr
                        <br />
                        {key.rate_limit_per_day}/day
                      </TableCell>
                      <TableCell className="text-sm">
                        {key.last_used_at
                          ? new Date(key.last_used_at).toLocaleDateString()
                          : 'Never'}
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => deleteAPIKey(key.id)}
                          variant="ghost"
                          size="icon"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Using Your API Key</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Authentication</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Include your API key in the <code className="bg-muted px-1 rounded">X-API-Key</code> header:
              </p>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                {`curl -H "X-API-Key: YOUR_API_KEY" \\
  ${API_BASE_URL}/api/databases`}
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Example: List All Databases</h3>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                {`curl -H "X-API-Key: YOUR_API_KEY" \\
  "${API_BASE_URL}/api/databases"`}
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Example: Download Seasonal Data</h3>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                {`curl -H "X-API-Key: YOUR_API_KEY" \\
  "${API_BASE_URL}/api/seasonal/download/seasonal_env_core_observations?locations=SUMM,RB01&start_date=2024-01-01&end_date=2024-12-31"`}
              </pre>
            </div>
            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2">Access Levels</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Without API Key:</strong> Access to seasonal_qaqc_data only (100 req/hr)</li>
                <li>• <strong>With API Key:</strong> Access to all 4 databases (1000 req/hr)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
