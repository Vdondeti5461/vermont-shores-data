import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Database, FileText, Globe, Key } from 'lucide-react';
import { API_BASE_URL } from '@/lib/apiConfig';

const APIDocumentation = () => {
  const baseUrl = `${API_BASE_URL}/api`;
  
  // API Authentication Info
  const authInfo = {
    currentAccess: 'Open Access - Seasonal QAQC Data Only',
    restrictedData: ['Raw Data Ingestion', 'Stage Clean Data', 'Stage QAQC Data'],
    requestProcess: 'Contact research team for bulk access to restricted datasets',
    contactEmail: 's2s@uvm.edu',
    contactPhone: '(802) 656-2215'
  };

  const endpoints = [
    {
      method: 'GET',
      path: '/health',
      description: 'Check API server health and availability',
      response: `{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0"
}`
    },
    {
      method: 'GET',
      path: '/databases',
      description: 'Get publicly accessible databases (currently restricted to seasonal QAQC data only)',
      response: `[
  {
    "id": "CRRELS2S_seasonal_qaqc_data",
    "key": "seasonal_qaqc_data",
    "name": "CRRELS2S_seasonal_qaqc_data",
    "displayName": "Seasonal QAQC Data",
    "description": "Quality-controlled seasonal environmental datasets",
    "category": "seasonal",
    "order": 4,
    "tables": []
  }
]`
    },
    {
      method: 'GET',
      path: '/seasonal/tables',
      description: 'Get all available seasonal tables from seasonal QAQC database',
      response: `[
  {
    "id": "season_2023_2024_qaqc",
    "name": "season_2023_2024_qaqc",
    "displayName": "Season 2023-2024",
    "rowCount": 125340,
    "description": "Quality-assured and quality-controlled seasonal data for Season 2023-2024"
  }
]`
    },
    {
      method: 'GET',
      path: '/seasonal/tables/:table/attributes',
      description: 'Get detailed attribute information for a specific seasonal table with unit metadata',
      parameters: [
        { name: 'table', description: 'Seasonal table name (e.g., season_2023_2024_qaqc)' }
      ],
      response: `{
  "table": "season_2023_2024_qaqc",
  "attributes": [
    {
      "name": "timestamp",
      "type": "datetime",
      "nullable": false,
      "description": "Date and time of observation (EST)",
      "category": "Time",
      "isPrimary": true,
      "unit": "DateTime",
      "measurementType": "Sample"
    },
    {
      "name": "location",
      "type": "varchar",
      "nullable": false,
      "description": "Logger site ID",
      "category": "Location",
      "isPrimary": true,
      "unit": "LOC",
      "measurementType": "Sample"
    },
    {
      "name": "panel_temperature_c",
      "type": "float",
      "nullable": true,
      "description": "Panel (enclosure) temperature",
      "category": "Temperature",
      "isPrimary": false,
      "unit": "°C",
      "measurementType": "Sample"
    }
  ]
}`
    },
    {
      method: 'GET',
      path: '/seasonal/tables/:table/locations',
      description: 'Get monitoring locations for a specific seasonal table with geographic metadata',
      parameters: [
        { name: 'table', description: 'Seasonal table name' }
      ],
      response: `[
  {
    "code": "SUMM",
    "name": "Mansfield Summit",
    "latitude": 44.5284,
    "longitude": -72.8147,
    "elevation": 1163
  },
  {
    "code": "RB-01",
    "name": "Ranch Brook Site #1",
    "latitude": 44.5232,
    "longitude": -72.8087,
    "elevation": 1072
  }
]`
    },
    {
      method: 'GET',
      path: '/seasonal/download/:table',
      description: 'Download seasonal environmental data as CSV with filtering options',
      parameters: [
        { name: 'table', description: 'Seasonal table name (required)' },
        { name: 'locations', description: 'Comma-separated location codes (optional)' },
        { name: 'start_date', description: 'Start date in format: YYYY-MM-DD HH:mm:ss (optional)' },
        { name: 'end_date', description: 'End date in format: YYYY-MM-DD HH:mm:ss (optional)' },
        { name: 'attributes', description: 'Comma-separated attribute names (optional)' }
      ],
      response: `CSV file download with properly formatted timestamps:
timestamp,location,panel_temperature_c,air_temperature_avg_c
2024-01-15 12:00:00,SUMM,-5.2,-8.1
2024-01-15 13:00:00,SUMM,-5.5,-8.3
...

Filename format: seasonal_qaqc_{table}_{date}.csv
Content-Type: text/csv
Content-Disposition: attachment`
    },
    {
      method: 'GET',
      path: '/databases/:database/tables',
      description: 'Get all tables for a specific database with metadata',
      parameters: [
        { name: 'database', description: 'Database key (e.g., raw_data, stage_clean_data, stage_qaqc_data, seasonal_qaqc_data)' }
      ],
      response: `{
  "database": "CRRELS2S_raw_data_ingestion",
  "tables": [
    {
      "name": "raw_env_core_observations",
      "displayName": "Core Environmental Observations",
      "description": "Temperature, humidity, radiation, soil, and snow measurements",
      "rowCount": 1247892,
      "primaryAttributes": ["timestamp", "location"]
    },
    {
      "name": "raw_env_wind_observations",
      "displayName": "Wind Observations",
      "description": "Wind speed and direction measurements",
      "rowCount": 1247892,
      "primaryAttributes": ["timestamp", "location"]
    },
    {
      "name": "raw_env_precipitation_observations",
      "displayName": "Precipitation Observations",
      "description": "Precipitation intensity and accumulation",
      "rowCount": 892415,
      "primaryAttributes": ["timestamp", "location"]
    },
    {
      "name": "raw_env_snowpack_temperature_profile",
      "displayName": "Snowpack Temperature Profile",
      "description": "Vertical temperature profile (0-290cm depths)",
      "rowCount": 745232,
      "primaryAttributes": ["timestamp", "location"]
    }
  ]
}`
    },
    {
      method: 'GET',
      path: '/databases/:database/tables/:table/attributes',
      description: 'Get detailed attribute/column information for a specific table',
      parameters: [
        { name: 'database', description: 'Database key' },
        { name: 'table', description: 'Table name' }
      ],
      response: `{
  "database": "CRRELS2S_raw_data_ingestion",
  "table": "raw_env_core_observations",
  "attributes": [
    {
      "name": "timestamp",
      "type": "datetime",
      "category": "timestamp",
      "isPrimary": true,
      "nullable": false,
      "comment": "Date and time of observation (EST)"
    },
    {
      "name": "location",
      "type": "varchar(50)",
      "category": "location",
      "isPrimary": true,
      "nullable": false,
      "comment": "Logger site ID (e.g., RB01, SUMM)"
    },
    {
      "name": "air_temperature_avg_c",
      "type": "float",
      "category": "temperature",
      "isPrimary": false,
      "nullable": true,
      "comment": "Average air temperature (°C)"
    },
    {
      "name": "RH",
      "type": "float",
      "category": "humidity",
      "isPrimary": false,
      "nullable": true,
      "comment": "Relative humidity (%)"
    },
    {
      "name": "SWE",
      "type": "float",
      "category": "snow",
      "isPrimary": false,
      "nullable": true,
      "comment": "Snow water equivalent (mm)"
    },
    {
      "name": "Soil_Temperature_C",
      "type": "float",
      "category": "temperature",
      "isPrimary": false,
      "nullable": true,
      "comment": "Soil temperature at 5cm depth (°C)"
    }
  ]
}`
    },
    {
      method: 'GET',
      path: '/databases/:database/locations',
      description: 'Get all monitoring locations with geographic information',
      parameters: [
        { name: 'database', description: 'Database key' },
        { name: 'tables', description: 'Optional: comma-separated table names to filter locations' }
      ],
      response: `[
  {
    "id": 1,
    "name": "Mansfield_Ridge",
    "display_name": "Mansfield Ridge Station",
    "latitude": 44.5267,
    "longitude": -72.8092,
    "elevation": 1339
  },
  {
    "id": 2,
    "name": "Shelburne_Farm",
    "display_name": "Shelburne Farms Research Station",
    "latitude": 44.4108,
    "longitude": -73.2267,
    "elevation": 95
  }
]`
    },
    {
      method: 'GET',
      path: '/databases/:database/data/:table',
      description: 'Retrieve filtered environmental data with comprehensive querying options',
      parameters: [
        { name: 'database', description: 'Database key (required)' },
        { name: 'table', description: 'Table name (required)' },
        { name: 'location', description: 'Filter by location name(s) - comma-separated for multiple (optional)' },
        { name: 'start_date', description: 'Start date in ISO format (YYYY-MM-DDTHH:mm:ssZ) (optional)' },
        { name: 'end_date', description: 'End date in ISO format (YYYY-MM-DDTHH:mm:ssZ) (optional)' },
        { name: 'attributes', description: 'Comma-separated attribute names to include (optional)' },
        { name: 'season', description: 'Filter by season: spring, summer, fall, winter (optional)' },
        { name: 'limit', description: 'Maximum records to return (default: 1000, max: 10000)' }
      ],
      response: `{
  "database": "final_clean_data",
  "table": "table1",
  "data": [
    {
      "TIMESTAMP": "2024-01-15T12:00:00Z",
      "Location": "Mansfield_Ridge",
      "AirTC_Avg": -5.2,
      "RH": 78.5,
      "SWE": 245.7
    }
  ],
  "count": 1000,
  "total_available": 125340,
  "query_params": {
    "location": "Mansfield_Ridge",
    "start_date": "2024-01-01T00:00:00Z",
    "end_date": "2024-01-31T23:59:59Z",
    "attributes": "TIMESTAMP,Location,AirTC_Avg,RH,SWE"
  }
}`
    },
    {
      method: 'GET',
      path: '/databases/:database/download/:table',
      description: 'Download filtered environmental data as CSV with intelligent chunking for large datasets',
      parameters: [
        { name: 'database', description: 'Database key (required)' },
        { name: 'table', description: 'Table name (required)' },
        { name: 'location', description: 'Filter by location name(s) - comma-separated for multiple (optional)' },
        { name: 'start_date', description: 'Start date in ISO format (optional)' },
        { name: 'end_date', description: 'End date in ISO format (optional)' },
        { name: 'attributes', description: 'Comma-separated attribute names to include (optional)' },
        { name: 'season', description: 'Filter by season: spring, summer, fall, winter (optional)' }
      ],
      response: `CSV file download with headers:
TIMESTAMP,Location,AirTC_Avg,RH,SWE
2024-01-15T12:00:00Z,Mansfield_Ridge,-5.2,78.5,245.7
...

Filename format: {database}_{table}_{locations}_{timestamp}.csv
Content-Type: text/csv
Content-Disposition: attachment`
    }
  ];

  const exampleRequests = [
    {
      title: 'Check API Health',
      url: `https://crrels2s.w3.uvm.edu/api/health`,
      description: 'Verify API server status and availability before making data requests'
    },
    {
      title: 'Get Available Database',
      url: `https://crrels2s.w3.uvm.edu/api/databases`,
      description: 'Retrieve publicly accessible database (Seasonal QAQC only)'
    },
    {
      title: 'Get Seasonal Tables',
      url: `https://crrels2s.w3.uvm.edu/api/seasonal/tables`,
      description: 'List all available seasonal periods in the QAQC database'
    },
    {
      title: 'Get Table Attributes with Units',
      url: `https://crrels2s.w3.uvm.edu/api/seasonal/tables/season_2023_2024_qaqc/attributes`,
      description: 'Retrieve complete attribute information including units and measurement types'
    },
    {
      title: 'Get Table Locations',
      url: `https://crrels2s.w3.uvm.edu/api/seasonal/tables/season_2023_2024_qaqc/locations`,
      description: 'Fetch all monitoring station locations with geographic coordinates'
    },
    {
      title: 'Download Multi-Location Data',
      url: `https://crrels2s.w3.uvm.edu/api/seasonal/download/season_2023_2024_qaqc?locations=SUMM,RB-01&attributes=timestamp,location,panel_temperature_c,air_temperature_avg_c&start_date=2024-01-01 00:00:00&end_date=2024-03-31 23:59:59`,
      description: 'Download winter temperature data from multiple monitoring locations'
    },
    {
      title: 'Download All Locations with Date Filter',
      url: `https://crrels2s.w3.uvm.edu/api/seasonal/download/season_2023_2024_qaqc?start_date=2024-01-01 00:00:00&end_date=2024-12-31 23:59:59`,
      description: 'Download full-year data from all locations'
    },
    {
      title: 'Download Specific Attributes Only',
      url: `https://crrels2s.w3.uvm.edu/api/seasonal/download/season_2023_2024_qaqc?attributes=timestamp,location,snow_water_equivalent_mm,snow_depth_cm`,
      description: 'Download only snow-related measurements for all time periods and locations'
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12 md:mb-16">
              <Badge variant="outline" className="mb-4">
                <Code className="w-4 h-4 mr-2" />
                API Documentation
              </Badge>
              <h1 className="scientific-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 sm:mb-6">
                <span className="text-primary">REST API</span>
                <br />Documentation
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto px-4">
                Complete API reference for accessing Summit-to-Shore environmental data programmatically. 
                Filter by database, location, timestamp, and specific attributes.
              </p>
            </div>
          </div>
        </section>

        {/* API Overview */}
        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              <Card>
                <CardHeader>
                  <Database className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Multi-Database Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Access data from multiple databases including raw, cleaned, and processed datasets
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Globe className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>RESTful Design</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Standard HTTP methods with JSON responses and proper status codes
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <FileText className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Flexible Filtering</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Filter data by timestamp, location, and specific attributes for precise data retrieval
                  </p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="endpoints" className="w-full">
              <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-2">
                <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
                <TabsTrigger value="examples">Usage Examples</TabsTrigger>
                <TabsTrigger value="authentication">Authentication</TabsTrigger>
              </TabsList>

              <TabsContent value="endpoints" className="mt-8">
                <div className="space-y-6">
                  {endpoints.map((endpoint, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                          <Badge variant={endpoint.method === 'GET' ? 'secondary' : 'default'}>
                            {endpoint.method}
                          </Badge>
                          <code className="text-base sm:text-lg font-mono break-all">{endpoint.path}</code>
                        </div>
                        <p className="text-muted-foreground">{endpoint.description}</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {endpoint.parameters && (
                          <div>
                            <h4 className="font-semibold mb-2">Parameters</h4>
                            <div className="space-y-2">
                              {endpoint.parameters.map((param, paramIndex) => (
                                <div key={paramIndex} className="flex items-start gap-3">
                                  <code className="text-sm bg-muted px-2 py-1 rounded">
                                    {param.name}
                                  </code>
                                  <span className="text-sm text-muted-foreground">
                                    {param.description}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div>
                          <h4 className="font-semibold mb-2">Response</h4>
                          <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                            <code>{endpoint.response}</code>
                          </pre>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="examples" className="mt-8">
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold mb-4">Usage Examples</h3>
                    <p className="text-muted-foreground">
                      Real-world examples of how to use the API endpoints
                    </p>
                  </div>
                  {exampleRequests.map((example, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle>{example.title}</CardTitle>
                        <p className="text-muted-foreground">{example.description}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                          <code className="text-sm break-all whitespace-pre-wrap">{example.url}</code>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <Card>
                    <CardHeader>
                      <CardTitle>JavaScript Example</CardTitle>
                      <p className="text-muted-foreground">
                        Example code for fetching data using JavaScript
                      </p>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                        <code>{`// Check API health first
const healthResponse = await fetch('${baseUrl}/health');
const isHealthy = healthResponse.ok;
console.log('API Status:', isHealthy ? 'Healthy' : 'Unavailable');

// Fetch all available databases with metadata
const dbResponse = await fetch('${baseUrl}/databases');
const { databases } = await dbResponse.json();
console.log('Available databases:', databases);

// Get tables and locations for raw data
const [tablesResponse, locationsResponse] = await Promise.all([
  fetch('${baseUrl}/databases/raw_data/tables'),
  fetch('${baseUrl}/databases/raw_data/locations')
]);

const tables = await tablesResponse.json();
const locations = await locationsResponse.json();

// Get table schema with attribute categories
const attributesResponse = await fetch(
  '${baseUrl}/databases/raw_data/tables/raw_env_core_observations/attributes'
);
const { attributes } = await attributesResponse.json();

// Build comprehensive data query
const params = new URLSearchParams({
  location: 'RB01,SUMM', // Multiple locations
  start_date: '2024-01-01T00:00:00Z',
  end_date: '2024-03-31T23:59:59Z',
  attributes: 'timestamp,location,air_temperature_avg_c,relative_humidity_percent,snow_depth_cm',
  season: 'winter'
});

// Preview data first (recommended for large queries)
const previewResponse = await fetch(
  \`${baseUrl}/databases/raw_data/data/raw_env_core_observations?\${params}&limit=10\`
);
const previewData = await previewResponse.json();
console.log('Data preview:', previewData);

// Download complete dataset as CSV
const downloadUrl = \`${baseUrl}/databases/raw_data/download/raw_env_core_observations?\${params}\`;

// Trigger download with proper error handling
try {
  const downloadResponse = await fetch(downloadUrl);
  if (!downloadResponse.ok) throw new Error('Download failed');
  
  const blob = await downloadResponse.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'environmental_data.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
} catch (error) {
  console.error('Download error:', error);
}`}</code>
                      </pre>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="authentication" className="mt-8">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Key className="h-8 w-8 text-primary" />
                      <div>
                        <CardTitle>Data Access & Availability</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Current access policies and restricted datasets
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2">Public Access</h3>
                      <Badge variant="secondary" className="text-base py-1">
                        {authInfo.currentAccess}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-2">
                        No API key required for accessing seasonal QAQC datasets. All endpoints are open for public use.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Restricted Datasets</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        The following datasets are currently restricted and require special authorization:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {authInfo.restrictedData.map((dataset, idx) => (
                          <Badge key={idx} variant="outline">
                            {dataset}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Request Access to Restricted Data</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {authInfo.requestProcess}
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Email</Badge>
                          <code className="text-sm">{authInfo.contactEmail}</code>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Phone</Badge>
                          <code className="text-sm">{authInfo.contactPhone}</code>
                        </div>
                      </div>
                    </div>

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        All API requests are subject to rate limiting to ensure fair usage. 
                        Please implement caching and avoid excessive concurrent requests.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">✅ Open Access: Seasonal QAQC Data</h4>
                      <p className="text-green-700 dark:text-green-300 text-sm mb-2">
                        The <strong>CRRELS2S_seasonal_qaqc_data</strong> database is openly accessible through our API and web interface for research and educational purposes.
                      </p>
                      <ul className="text-green-700 dark:text-green-300 text-sm list-disc list-inside space-y-1">
                        <li>No API key required</li>
                        <li>Direct download access via web interface</li>
                        <li>Programmatic access via REST API</li>
                        <li>Quality-assured seasonal datasets</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">🔒 Restricted Access: Request Required</h4>
                      <p className="text-amber-700 dark:text-amber-300 text-sm mb-2">
                        The following databases require a bulk download request for access:
                      </p>
                      <ul className="text-amber-700 dark:text-amber-300 text-sm list-disc list-inside space-y-1">
                        <li><strong>CRRELS2S_raw_data_ingestion:</strong> Unprocessed sensor data</li>
                        <li><strong>CRRELS2S_stage_clean_data:</strong> Intermediate QC-filtered data</li>
                        <li><strong>CRRELS2S_stage_qaqc_data:</strong> Advanced QAQC data</li>
                      </ul>
                      <p className="text-amber-700 dark:text-amber-300 text-sm mt-2">
                        <strong>How to request access:</strong>
                      </p>
                      <ul className="text-amber-700 dark:text-amber-300 text-sm list-disc list-inside space-y-1 mt-1">
                        <li>Submit a <a href="/bulk-request" className="underline font-medium">bulk download request form</a></li>
                        <li>Email: <a href="mailto:{authInfo.contactEmail}" className="underline font-medium">{authInfo.contactEmail}</a></li>
                        <li>Phone: {authInfo.contactPhone}</li>
                        <li>Typical processing time: 2-5 business days</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">🗄️ Database Architecture</h4>
                      <p className="text-blue-700 dark:text-blue-300 text-sm mb-3">
                        Four-tier architecture for comprehensive environmental data management:
                      </p>
                      
                      <div className="space-y-3">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded">
                          <h5 className="font-semibold text-blue-900 dark:text-blue-100 text-sm">1. CRRELS2S_raw_data_ingestion</h5>
                          <p className="text-blue-800 dark:text-blue-200 text-xs mt-1">
                            Raw sensor data directly from 22+ field loggers. Tables: raw_env_core_observations, raw_env_wind_observations, 
                            raw_env_precipitation_observations, raw_env_snowpack_temperature_profile
                          </p>
                          <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 text-xs rounded">Request Required</span>
                        </div>

                        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded">
                          <h5 className="font-semibold text-blue-900 dark:text-blue-100 text-sm">2. CRRELS2S_stage_clean_data</h5>
                          <p className="text-blue-800 dark:text-blue-200 text-xs mt-1">
                            Intermediate cleaned datasets using basic QC filters (range checks, spike detection, null filtering)
                          </p>
                          <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 text-xs rounded">Request Required</span>
                        </div>

                        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded">
                          <h5 className="font-semibold text-blue-900 dark:text-blue-100 text-sm">3. CRRELS2S_stage_qaqc_data</h5>
                          <p className="text-blue-800 dark:text-blue-200 text-xs mt-1">
                            Advanced QAQC with sensor calibration, temporal validation, and derived metrics
                          </p>
                          <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 text-xs rounded">Request Required</span>
                        </div>

              <TabsContent value="authentication" className="mt-8">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Key className="h-8 w-8 text-primary" />
                      <div>
                        <CardTitle>Data Access & Availability</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Current access policies and restricted datasets
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2">Public Access</h3>
                      <Badge variant="secondary" className="text-base py-1">
                        {authInfo.currentAccess}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-2">
                        No API key required for accessing seasonal QAQC datasets. All endpoints are open for public use.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Restricted Datasets</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        The following datasets are currently restricted and require special authorization:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {authInfo.restrictedData.map((dataset, idx) => (
                          <Badge key={idx} variant="outline">
                            {dataset}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Request Access to Restricted Data</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {authInfo.requestProcess}
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Email</Badge>
                          <code className="text-sm">{authInfo.contactEmail}</code>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Phone</Badge>
                          <code className="text-sm">{authInfo.contactPhone}</code>
                        </div>
                      </div>
                    </div>

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        All API requests are subject to rate limiting to ensure fair usage. 
                        Please implement caching and avoid excessive concurrent requests.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
                      <p className="text-indigo-700 dark:text-indigo-300 text-sm mb-2">
                        Research networks and collaborating institutions can request dedicated API access:
                      </p>
                      <ul className="text-indigo-700 dark:text-indigo-300 text-sm list-disc list-inside space-y-1">
                        <li>API keys for programmatic data integration</li>
                        <li>Access to all four database tiers</li>
                        <li>Real-time data streaming capabilities</li>
                        <li>Cross-network data harmonization</li>
                        <li>Custom endpoints for partner networks</li>
                      </ul>
                      <p className="text-indigo-700 dark:text-indigo-300 text-sm mt-2">
                        Contact <a href="mailto:s2s@uvm.edu" className="underline font-medium">s2s@uvm.edu</a> to discuss partnership opportunities.
                      </p>
                    </div>

                    <div className="p-4 bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800 rounded-lg">
                      <h4 className="font-semibold text-cyan-800 dark:text-cyan-200 mb-2">🚀 Planned Enhancements</h4>
                      <ul className="text-cyan-700 dark:text-cyan-300 text-sm list-disc list-inside space-y-1">
                        <li><strong>Authentication:</strong> OAuth2 and JWT for secure API access</li>
                        <li><strong>Real-time Streaming:</strong> WebSocket endpoints for live data</li>
                        <li><strong>Advanced Formats:</strong> NetCDF, Parquet, HDF5 exports</li>
                        <li><strong>Geospatial Queries:</strong> Bounding box and region filtering</li>
                        <li><strong>Rate Limiting:</strong> Fair-use policies and tiered access</li>
                        <li><strong>Metadata Standards:</strong> CF-compliant metadata and DOI integration</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                      <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">📚 Data Citation</h4>
                      <p className="text-purple-700 dark:text-purple-300 text-sm mb-2">
                        When using Summit-to-Shore data, please cite:
                      </p>
                      <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded text-purple-800 dark:text-purple-200 text-xs font-mono">
                        "Summit-to-Shore Environmental Observatory, University of Vermont. 
                        Accessed via API at https://crrels2s.w3.uvm.edu on {new Date().toISOString().split('T')[0]}."
                      </div>
                    </div>

                    <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">📋 Fair Use Guidelines</h4>
                      <ul className="text-yellow-700 dark:text-yellow-300 text-sm list-disc list-inside space-y-1">
                        <li>Check <code>/health</code> endpoint before bulk requests</li>
                        <li>Implement request timeouts and error handling</li>
                        <li>Cache responses to reduce repeated queries</li>
                        <li>Use <code>limit</code> parameter for data preview</li>
                        <li>Contact us for large bulk downloads: {authInfo.contactEmail}</li>
                      </ul>
                      <div className="mt-3 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded">
                        <p className="text-yellow-800 dark:text-yellow-200 text-sm font-medium">
                          🌐 Production API: <code className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">https://crrels2s.w3.uvm.edu/api</code>
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 rounded-lg">
                      <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">💬 Support & Contact</h4>
                      <ul className="text-slate-700 dark:text-slate-300 text-sm space-y-1">
                        <li>📧 Email: <a href="mailto:s2s@uvm.edu" className="underline font-medium">s2s@uvm.edu</a></li>
                        <li>📞 Phone: (802) 656-2215</li>
                        <li>🔗 <a href="/bulk-request" className="underline font-medium">Submit Bulk Download Request</a></li>
                        <li>🔗 <a href="/about" className="underline font-medium">Meet Our Team</a></li>
                        <li>🔗 <a href="/documentation" className="underline font-medium">Full Documentation</a></li>
                      </ul>
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

export default APIDocumentation;