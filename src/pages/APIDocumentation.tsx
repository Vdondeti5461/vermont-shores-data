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
      path: '/databases',
      description: 'Get all available databases',
      response: `{
  "databases": [
    {
      "key": "raw_data",
      "name": "CRRELS2S_VTClimateRepository",
      "displayName": "Raw Data",
      "description": "Raw data"
    },
    {
      "key": "initial_clean_data",
      "name": "CRRELS2S_VTClimateRepository_Processed",
      "displayName": "Initial Clean_data",
      "description": "Initial clean data"
    },
    {
      "key": "final_clean_data",
      "name": "CRRELS2S_ProcessedData",
      "displayName": "Final Clean_data",
      "description": "Final Clean Data"
    },
    {
      "key": "seasonal_clean_data",
      "name": "CRRELS2S_cleaned_data_seasons",
      "displayName": "Seasonal Clean_data",
      "description": "Season wise final clean data"
    }
  ]
}`
    },
    {
      method: 'GET',
      path: '/databases/:database/tables',
      description: 'Get all tables for a specific database',
      parameters: [
        { name: 'database', description: 'Database key (e.g., raw_data, final_clean_data, seasonal_clean_data)' }
      ],
      response: `{
  "database": "CRRELS2S_ProcessedData",
  "tables": [
    {
      "name": "table1",
      "displayName": "Primary Environmental Data",
      "description": "Primary environmental measurements including temperature, humidity, and soil data",
      "rowCount": 927399,
      "primaryAttributes": ["TIMESTAMP", "Location"]
    },
    {
      "name": "LocationMax",
      "displayName": "Location Max",
      "description": "Environmental data measurements",
      "rowCount": 44,
      "primaryAttributes": ["TIMESTAMP", "Location"]
    },
    {
      "name": "calibration_table",
      "displayName": "calibration_table",
      "description": "Environmental data measurements",
      "rowCount": 43,
      "primaryAttributes": ["TIMESTAMP", "Location"]
    }
  ]
}`
    },
    {
      method: 'GET',
      path: '/databases/:database/tables/:table/attributes',
      description: 'Get attributes/columns for a specific table',
      parameters: [
        { name: 'database', description: 'Database key' },
        { name: 'table', description: 'Table name' }
      ],
      response: `{
  "database": "CRRELS2S_ProcessedData",
  "table": "table1",
  "attributes": [
    {
      "name": "TIMESTAMP",
      "type": "datetime",
      "nullable": false,
      "category": "Time",
      "isPrimary": true
    },
    {
      "name": "Location",
      "type": "varchar",
      "nullable": false,
      "category": "Location",
      "isPrimary": true
    },
    {
      "name": "AirTC_Avg",
      "type": "float",
      "nullable": true,
      "category": "Temperature",
      "isPrimary": false
    },
    {
      "name": "RH",
      "type": "float",
      "nullable": true,
      "category": "Humidity",
      "isPrimary": false
    },
    {
      "name": "Soil_Moisture",
      "type": "float",
      "nullable": true,
      "category": "Soil",
      "isPrimary": false
    },
    {
      "name": "SWE",
      "type": "float",
      "nullable": true,
      "category": "Snow",
      "isPrimary": false
    },
    {
      "name": "SW_in",
      "type": "int",
      "nullable": true,
      "category": "Radiation",
      "isPrimary": false
    }
  ],
  "primaryAttributes": [
    {
      "name": "TIMESTAMP",
      "type": "datetime",
      "nullable": false,
      "category": "Time",
      "isPrimary": true
    },
    {
      "name": "Location",
      "type": "varchar",
      "nullable": false,
      "category": "Location",
      "isPrimary": true
    }
  ]
}`
    },
    {
      method: 'GET',
      path: '/databases/:database/locations',
      description: 'Get all unique locations for a database',
      parameters: [
        { name: 'database', description: 'Database key' },
        { name: 'tables', description: 'Optional: comma-separated table names to filter' }
      ],
      response: `[
  {
    "id": 1,
    "name": "Station_001",
    "latitude": 44.0,
    "longitude": -72.5,
    "elevation": 1000
  }
]`
    },
    {
      method: 'GET',
      path: '/databases/:database/data/:table',
      description: 'Get filtered data from a specific table',
      parameters: [
        { name: 'database', description: 'Database key' },
        { name: 'table', description: 'Table name' },
        { name: 'location', description: 'Filter by location name (optional)' },
        { name: 'start_date', description: 'Start date (ISO format, optional)' },
        { name: 'end_date', description: 'End date (ISO format, optional)' },
        { name: 'attributes', description: 'Comma-separated attribute names (optional)' },
        { name: 'limit', description: 'Maximum records to return (default: 1000)' }
      ],
      response: `{
  "database": "CRRELS2S_VTClimateRepository",
  "table": "table1",
  "data": [...],
  "count": 1000,
  "query_params": {
    "location": "Station_001",
    "start_date": "2024-01-01T00:00:00Z",
    "end_date": "2024-01-31T23:59:59Z"
  }
}`
    },
    {
      method: 'GET',
      path: '/databases/:database/download/:table',
      description: 'Download data as CSV file',
      parameters: [
        { name: 'database', description: 'Database key' },
        { name: 'table', description: 'Table name' },
        { name: 'location', description: 'Filter by location name (optional)' },
        { name: 'start_date', description: 'Start date (ISO format, optional)' },
        { name: 'end_date', description: 'End date (ISO format, optional)' },
        { name: 'attributes', description: 'Comma-separated attribute names (optional)' }
      ],
      response: 'CSV file download'
    }
  ];

  const exampleRequests = [
    {
      title: 'Get All Available Databases',
      url: `${baseUrl}/databases`,
      description: 'Fetch all available databases including raw, processed, and seasonal data'
    },
    {
      title: 'Get Final Clean Data Tables',
      url: `${baseUrl}/databases/final_clean_data/tables`,
      description: 'Get all tables available in the final clean data database'
    },
    {
      title: 'Get Table Attributes',
      url: `${baseUrl}/databases/final_clean_data/tables/table1/attributes`,
      description: 'Get all available attributes/columns for the primary environmental data table'
    },
    {
      title: 'Get Locations from Database',
      url: `${baseUrl}/databases/final_clean_data/locations`,
      description: 'Fetch all monitoring locations from the final clean data database'
    },
    {
      title: 'Get Temperature Data for Specific Location',
      url: `${baseUrl}/databases/final_clean_data/data/table1?location=Station_001&start_date=2024-01-01&attributes=TIMESTAMP,Location,AirTC_Avg,Soil_Temperature_C`,
      description: 'Get temperature data from a specific station for January 2024'
    },
    {
      title: 'Download Environmental Data CSV',
      url: `${baseUrl}/databases/final_clean_data/download/table1?start_date=2024-01-01&end_date=2024-01-31&attributes=TIMESTAMP,Location,AirTC_Avg,RH,SWE`,
      description: 'Download environmental data for January 2024 as CSV'
    },
    {
      title: 'Get Snow and Radiation Data',
      url: `${baseUrl}/databases/final_clean_data/data/table1?attributes=TIMESTAMP,Location,SWE,SW_in,SW_out,LW_in,LW_out&start_date=2024-01-01`,
      description: 'Get snow water equivalent and radiation measurements'
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
                        <code>{`// Fetch all available databases
const dbResponse = await fetch('${baseUrl}/databases');
const databases = await dbResponse.json();
console.log('Available databases:', databases.databases);

// Get tables from final clean data
const tablesResponse = await fetch('${baseUrl}/databases/final_clean_data/tables');
const tables = await tablesResponse.json();
console.log('Available tables:', tables.tables);

// Get locations from final clean data database
const locationsResponse = await fetch('${baseUrl}/databases/final_clean_data/locations');
const locations = await locationsResponse.json();

// Get environmental data with filters
const params = new URLSearchParams({
  location: 'Station_001',
  start_date: '2024-01-01T00:00:00Z',
  end_date: '2024-01-31T23:59:59Z',
  attributes: 'TIMESTAMP,Location,AirTC_Avg,RH,SWE,Soil_Temperature_C'
});

const dataResponse = await fetch(
  \`${baseUrl}/databases/final_clean_data/data/table1?\${params}\`
);
const data = await dataResponse.json();

// Download data as CSV
const downloadUrl = \`${baseUrl}/databases/final_clean_data/download/table1?\${params}\`;
window.open(downloadUrl, '_blank');`}</code>
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
                      <h4 className="font-semibold text-green-800 mb-2">Open Access</h4>
                      <p className="text-green-700 text-sm">
                        Currently, the API is open access and does not require authentication. 
                        All endpoints can be accessed without API keys or tokens.
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Future Plans</h4>
                      <p className="text-blue-700 text-sm">
                        We plan to implement API key authentication in the future for:
                      </p>
                      <ul className="text-blue-700 text-sm mt-2 list-disc list-inside">
                        <li>Rate limiting and usage tracking</li>
                        <li>Access to premium datasets</li>
                        <li>Bulk download capabilities</li>
                        <li>Real-time data streaming</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">Fair Use Policy & Contact</h4>
                      <p className="text-yellow-700 text-sm">
                        Please use the API responsibly:
                      </p>
                      <ul className="text-yellow-700 text-sm mt-2 list-disc list-inside">
                        <li>Limit requests to reasonable intervals</li>
                        <li>Use appropriate date ranges and limits</li>
                        <li>Cache responses when possible</li>
                        <li>For bulk downloads, use the request form</li>
                        <li>Contact s2s@uvm.edu for high-volume usage or questions</li>
                        <li>Phone: (802) 656-2215 for technical support</li>
                      </ul>
                      <div className="mt-3 p-2 bg-yellow-100 rounded">
                        <p className="text-yellow-800 text-sm font-medium">
                          🌐 Production API Base URL: https://vdondeti.w3.uvm.edu/api
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