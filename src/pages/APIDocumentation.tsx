import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Database, FileText, Globe, Key } from 'lucide-react';
import { API_BASE_URL } from '@/lib/apiConfig';

const APIDocumentation = () => {
  const baseUrl = `${API_BASE_URL}/api`;

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
      description: 'Get all available databases with metadata',
      response: `{
  "databases": [
    {
      "key": "raw_data",
      "name": "CRRELS2S_raw_data_ingestion",
      "display_name": "Raw Data Ingestion",
      "description": "Raw sensor data directly from field loggers, unprocessed",
      "category": "raw",
      "order": 1
    },
    {
      "key": "stage_clean_data",
      "name": "CRRELS2S_stage_clean_data",
      "display_name": "Stage Clean Data",
      "description": "Intermediate cleaned datasets using basic quality control (QC) filters",
      "category": "cleaned",
      "order": 2
    },
    {
      "key": "stage_qaqc_data",
      "name": "CRRELS2S_stage_qaqc_data",
      "display_name": "Stage QAQC Data",
      "description": "Advanced QAQC with calibration, temporal checks, and derived values",
      "category": "qaqc",
      "order": 3
    },
    {
      "key": "seasonal_qaqc_data",
      "name": "CRRELS2S_seasonal_qaqc_data",
      "display_name": "Seasonal QAQC Data",
      "description": "Seasonal datasets after QAQC, designed for time-bounded analysis",
      "category": "seasonal",
      "order": 4
    }
  ]
}`
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
      "display_name": "Core Environmental Observations",
      "description": "Primary environmental measurements including temperature, humidity, radiation, and snow metrics",
      "row_count": 1247892,
      "columns": ["timestamp", "location", "air_temperature_avg_c", "relative_humidity_percent", "snow_depth_cm", "snow_water_equivalent_mm"]
    },
    {
      "name": "raw_env_wind_observations",
      "display_name": "Wind Observations",
      "description": "Wind speed and direction measurements from weather stations",
      "row_count": 1247892,
      "columns": ["timestamp", "location", "wind_speed_avg_ms", "wind_direction_deg", "wind_speed_max_ms"]
    },
    {
      "name": "raw_env_precipitation_observations",
      "display_name": "Precipitation Observations",
      "description": "Precipitation intensity and accumulation measurements",
      "row_count": 892415,
      "columns": ["timestamp", "location", "precip_intensity_rt_mm_min", "precip_accum_rt_nrt_mm", "bucket_precip_rt_mm"]
    },
    {
      "name": "raw_env_snowpack_temperature_profile",
      "display_name": "Snowpack Temperature Profile",
      "description": "Vertical temperature profile measurements through snowpack (0-290cm depths)",
      "row_count": 1247892,
      "columns": ["timestamp", "location", "snow_temp_0cm_avg", "snow_temp_10cm_avg", "snow_temp_290cm_avg"]
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
      title: 'Get All Available Databases',
      url: `https://crrels2s.w3.uvm.edu/api/databases`,
      description: 'Retrieve all environmental databases with metadata and processing levels'
    },
    {
      title: 'Get Raw Data Tables',
      url: `https://crrels2s.w3.uvm.edu/api/databases/raw_data/tables`,
      description: 'List all data tables in the raw environmental dataset'
    },
    {
      title: 'Get Monitoring Station Locations',
      url: `https://crrels2s.w3.uvm.edu/api/databases/raw_data/locations`,
      description: 'Fetch all monitoring station locations with coordinates and elevation data'
    },
    {
      title: 'Get Detailed Table Schema',
      url: `https://crrels2s.w3.uvm.edu/api/databases/raw_data/tables/raw_env_core_observations/attributes`,
      description: 'Retrieve complete attribute information including data types and categories'
    },
    {
      title: 'Get Winter Temperature Data',
      url: `https://crrels2s.w3.uvm.edu/api/databases/raw_data/data/raw_env_core_observations?location=RB01&season=winter&attributes=timestamp,location,air_temperature_avg_c,soil_temperature_c`,
      description: 'Retrieve winter temperature measurements from RB01 monitoring station'
    },
    {
      title: 'Get Multi-Location Snow Data',
      url: `https://crrels2s.w3.uvm.edu/api/databases/raw_data/data/raw_env_core_observations?location=RB01,SUMM&attributes=timestamp,location,snow_water_equivalent_mm,snow_depth_cm&start_date=2024-01-01&end_date=2024-03-31`,
      description: 'Compare snow measurements between multiple monitoring locations for winter season'
    },
    {
      title: 'Download Complete Weather Dataset',
      url: `https://crrels2s.w3.uvm.edu/api/databases/raw_data/download/raw_env_core_observations?start_date=2024-01-01&end_date=2024-12-31&attributes=timestamp,location,air_temperature_avg_c,relative_humidity_percent,wind_speed_avg_ms`,
      description: 'Download full-year weather data including temperature, humidity, and wind'
    },
    {
      title: 'Preview Wind Data Sample',
      url: `https://crrels2s.w3.uvm.edu/api/databases/raw_data/data/raw_env_wind_observations?attributes=timestamp,location,wind_speed_avg_ms,wind_direction_deg&limit=100`,
      description: 'Preview first 100 records of wind monitoring data for data exploration'
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
                    <Key className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Authentication</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Current Access Policy</h4>
                      <p className="text-green-700 text-sm">
                        The Summit-to-Shore API is currently open access for research and educational purposes. 
                        Full authentication and access control systems are under development to support 
                        secure data sharing with partner networks and research institutions.
                      </p>
                    </div>
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <h4 className="font-semibold text-amber-800 mb-2">Upcoming: Restricted Access & API Keys</h4>
                      <p className="text-amber-700 text-sm mb-2">
                        Access control is being implemented to ensure data security and quality:
                      </p>
                      <ul className="text-amber-700 text-sm list-disc list-inside space-y-1">
                        <li><strong>Authenticated API Access:</strong> API keys will be required for data access</li>
                        <li><strong>Network Collaboration:</strong> Dedicated endpoints for partner networks (e.g., Whiteface Mountain, Mount Washington Observatory)</li>
                        <li><strong>Role-Based Access:</strong> Different permission levels for public, researchers, and network partners</li>
                        <li><strong>Data Quality Gates:</strong> QA/QC filtered data with documented quality assurance levels</li>
                        <li><strong>Usage Monitoring:</strong> API usage tracking and rate limiting by user/organization</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                      <h4 className="font-semibold text-indigo-800 mb-2">Network API Access</h4>
                      <p className="text-indigo-700 text-sm mb-2">
                        Collaborative networks will receive dedicated API access with:
                      </p>
                      <ul className="text-indigo-700 text-sm list-disc list-inside space-y-1">
                        <li>Programmatic data pull capabilities for automated integration</li>
                        <li>Access to all four database tiers (raw, clean, QAQC, seasonal)</li>
                        <li>Real-time data streaming for operational monitoring</li>
                        <li>Bidirectional data exchange protocols</li>
                        <li>Cross-network data harmonization standards</li>
                      </ul>
                      <p className="text-indigo-700 text-sm mt-2">
                        Contact <a href="mailto:summit2shore@uvm.edu" className="underline font-medium">summit2shore@uvm.edu</a> to request network partnership and API credentials.
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Database Architecture Overview</h4>
                      <p className="text-blue-700 text-sm mb-2">
                        Four-tier database architecture for comprehensive data management:
                      </p>
                      <ul className="text-blue-700 text-sm list-disc list-inside space-y-1">
                        <li><strong>CRRELS2S_raw_data_ingestion:</strong> Unprocessed sensor data from 22+ field stations</li>
                        <li><strong>CRRELS2S_stage_clean_data:</strong> Basic QC-filtered data with range checks and nullification</li>
                        <li><strong>CRRELS2S_stage_qaqc_data:</strong> Advanced QA/QC with calibration and temporal validation</li>
                        <li><strong>CRRELS2S_seasonal_qaqc_data:</strong> Season-bounded datasets optimized for analysis</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
                      <h4 className="font-semibold text-cyan-800 mb-2">Future API Enhancements</h4>
                      <p className="text-cyan-700 text-sm mb-2">
                        Planned improvements and expansions:
                      </p>
                      <ul className="text-cyan-700 text-sm list-disc list-inside space-y-1">
                        <li>OAuth2 and JWT authentication for secure API access</li>
                        <li>WebSocket connections for real-time data streaming</li>
                        <li>GraphQL endpoint for flexible data queries</li>
                        <li>Geospatial querying with bounding box and region filters</li>
                        <li>Multi-format export (NetCDF, Parquet, GeoJSON, HDF5)</li>
                        <li>Metadata catalog with DOI integration and data versioning</li>
                        <li>Cross-network data federation and harmonization</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                      <h4 className="font-semibold text-indigo-800 mb-2">Data Attribution & Citation</h4>
                      <p className="text-indigo-700 text-sm mb-2">
                        When using Summit-to-Shore data in publications or presentations, please cite:
                      </p>
                      <div className="bg-indigo-100 p-3 rounded text-indigo-800 text-xs font-mono">
                        "Summit-to-Shore Environmental Observatory, University of Vermont. 
                        Accessed via API at {window.location.origin} on {new Date().toISOString().split('T')[0]}."
                      </div>
                    </div>

                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">Support & Collaboration</h4>
                      <p className="text-purple-700 text-sm mb-2">
                        Get help or discuss collaboration opportunities:
                      </p>
                      <ul className="text-purple-700 text-sm list-disc list-inside space-y-1">
                        <li>Technical Support: <a href="mailto:summit2shore@uvm.edu" className="underline font-medium">summit2shore@uvm.edu</a></li>
                        <li>Research Collaboration: <a href="/about" className="underline font-medium">Meet Our Team</a></li>
                        <li>Documentation: <a href="/documentation" className="underline font-medium">Complete Project Docs</a></li>
                        <li>Data Portal: <a href="/download" className="underline font-medium">Interactive Data Browser</a></li>
                      </ul>
                    </div>

                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">Fair Use Policy & Production API</h4>
                      <p className="text-yellow-700 text-sm mb-2">
                        Please use the API responsibly for research and educational purposes:
                      </p>
                      <ul className="text-yellow-700 text-sm list-disc list-inside space-y-1">
                        <li>Use <code>/health</code> endpoint to check server availability</li>
                        <li>Implement appropriate request timeouts and error handling</li>
                        <li>Cache responses when possible to reduce repeated queries</li>
                        <li>Use data preview with <code>limit</code> parameter for exploration</li>
                        <li>Contact us for bulk data needs: <a href="mailto:s2s@uvm.edu" className="underline">s2s@uvm.edu</a></li>
                        <li>Phone support: (802) 656-2215 for technical assistance</li>
                      </ul>
                      <div className="mt-3 p-2 bg-yellow-100 rounded">
                        <p className="text-yellow-800 text-sm font-medium">
                          🌐 Production API Base: <code className="bg-yellow-200 px-1 rounded">https://vdondeti.w3.uvm.edu/api</code>
                        </p>
                      </div>
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