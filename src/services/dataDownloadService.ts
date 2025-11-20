import { API_BASE_URL } from '@/lib/apiConfig';

export interface DatabaseInfo {
  id: string;
  name: string;
  database_name: string;
  description?: string;
  category?: string;
  order?: number;
}

export interface TableInfo {
  name: string;
  displayName?: string;
  description?: string;
  rowCount?: number;
}

export interface LocationInfo {
  id: number;
  name: string;
  displayName?: string;
  latitude?: number;
  longitude?: number;
  elevation?: number;
}

export interface AttributeInfo {
  name: string;
  type: string;
  category?: string;
  isPrimary?: boolean;
  nullable?: boolean;
  comment?: string;
}

export interface DownloadFilters {
  database: string;
  table: string;
  locations?: string[];
  attributes?: string[];
  startDate?: string;
  endDate?: string;
  season?: string;
  limit?: number;
}

export class DataDownloadService {
  private static get baseUrl() {
    return API_BASE_URL;
  }

  // Get all available databases
  static async getDatabases(): Promise<DatabaseInfo[]> {
    try {
      console.log('📊 Fetching databases from:', `${this.baseUrl}/api/databases`);
      const response = await fetch(`${this.baseUrl}/api/databases`);
      console.log('📊 Database response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('📊 Database fetch error:', errorText);
        throw new Error(`Failed to fetch databases: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📊 Raw database response:', data);
      
      // Handle both array response and object with databases array
      const rawDatabases = Array.isArray(data) ? data : (data.databases || []);
      console.log('📊 Processed databases:', rawDatabases);
      
      // Transform the response to match our interface
      const databases: DatabaseInfo[] = rawDatabases.map((db: any, index: number) => ({
        id: db.key || db.id || `db_${index}`,
        name: db.displayName || db.display_name || db.name || db.key || `Database ${index + 1}`,
        database_name: db.name || db.database_name || db.key,
        description: db.description,
        category: db.category,
        order: db.order || index
      }));

      console.log('📊 Transformed databases:', databases);
      return databases.sort((a, b) => (a.order || 0) - (b.order || 0));
    } catch (error) {
      console.error('📊 Error fetching databases:', error);
      throw new Error('Failed to load available databases');
    }
  }

  // Get tables for a specific database
  static async getTables(databaseId: string): Promise<TableInfo[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/databases/${databaseId}/tables`);
      if (!response.ok) {
        throw new Error(`Failed to fetch tables: ${response.statusText}`);
      }
      
      const data = await response.json();
      const tables = Array.isArray(data) ? data : data.tables || [];
      
      return tables.map((table: any) => ({
        name: table.name || table,
        displayName: table.display_name || table.displayName || table.name || table,
        description: table.description || `Data table from ${databaseId}`,
        rowCount: table.row_count || table.rowCount
      }));
    } catch (error) {
      console.error(`Error fetching tables for ${databaseId}:`, error);
      throw new Error(`Failed to load tables for ${databaseId}`);
    }
  }

  // Get locations for a specific database
  static async getLocations(databaseId: string): Promise<LocationInfo[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/databases/${databaseId}/locations`);
      if (!response.ok) {
        throw new Error(`Failed to fetch locations: ${response.statusText}`);
      }
      
      const data = await response.json();
      const locations = Array.isArray(data) ? data : data.locations || [];
      
      return locations.map((location: any) => ({
        id: location.id,
        name: location.name,
        displayName: location.display_name || location.displayName || location.name,
        latitude: location.latitude,
        longitude: location.longitude,
        elevation: location.elevation
      }));
    } catch (error) {
      console.error(`Error fetching locations for ${databaseId}:`, error);
      throw new Error(`Failed to load locations for ${databaseId}`);
    }
  }

  // Get attributes/columns for a specific table
  static async getTableAttributes(databaseId: string, tableName: string): Promise<AttributeInfo[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/databases/${databaseId}/tables/${tableName}/attributes`);
      if (!response.ok) {
        throw new Error(`Failed to fetch attributes: ${response.statusText}`);
      }
      
      const data = await response.json();
      const attributes = Array.isArray(data) ? data : data.attributes || data.columns || [];
      
      return attributes.map((attr: any) => ({
        name: attr.name || attr.column_name,
        type: attr.type || attr.data_type || 'unknown',
        category: this.categorizeAttribute(attr.name || attr.column_name),
        isPrimary: attr.is_primary || attr.isPrimary || ['TIMESTAMP', 'Location', 'Record'].includes(attr.name),
        nullable: attr.nullable !== false,
        comment: attr.comment || attr.description
      }));
    } catch (error) {
      console.error(`Error fetching attributes for ${databaseId}.${tableName}:`, error);
      throw new Error(`Failed to load attributes for ${tableName}`);
    }
  }

  // Categorize attributes based on name patterns
  private static categorizeAttribute(name: string): string {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('timestamp') || lowerName.includes('time') || lowerName.includes('date')) {
      return 'timestamp';
    }
    if (lowerName.includes('location') || lowerName.includes('site') || lowerName.includes('station')) {
      return 'location';
    }
    if (lowerName.includes('temp') || lowerName.includes('temperature')) {
      return 'temperature';
    }
    if (lowerName.includes('precip') || lowerName.includes('rain') || lowerName.includes('precipitation')) {
      return 'precipitation';
    }
    if (lowerName.includes('wind') || lowerName.includes('speed') || lowerName.includes('direction')) {
      return 'wind';
    }
    if (lowerName.includes('humidity') || lowerName.includes('rh')) {
      return 'humidity';
    }
    if (lowerName.includes('pressure') || lowerName.includes('bar')) {
      return 'pressure';
    }
    if (lowerName.includes('snow') || lowerName.includes('swe')) {
      return 'snow';
    }
    
    return 'other';
  }

  // Download filtered data
  static async downloadData(filters: DownloadFilters, format: 'csv' | 'excel' = 'csv'): Promise<void> {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      
      if (filters.locations && filters.locations.length > 0) {
        params.append('location', filters.locations.join(','));
      }
      if (filters.startDate) {
        params.append('start_date', filters.startDate);
      }
      if (filters.endDate) {
        params.append('end_date', filters.endDate);
      }
      if (filters.season) {
        params.append('season', filters.season);
      }
      if (filters.attributes && filters.attributes.length > 0) {
        params.append('attributes', filters.attributes.join(','));
      }
      if (filters.limit) {
        params.append('limit', filters.limit.toString());
      }
      
      // Add format parameter
      params.append('format', format);

      const url = `${this.baseUrl}/api/databases/${filters.database}/download/${filters.table}?${params.toString()}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      // Create and trigger download
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Generate descriptive filename
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
      const locationStr = filters.locations && filters.locations.length > 0 
        ? `_${filters.locations.slice(0, 3).join('-')}${filters.locations.length > 3 ? '-etc' : ''}`
        : '';
      
      const extension = format === 'excel' ? 'xlsx' : 'csv';
      link.download = `${filters.database}_${filters.table}${locationStr}_${timestamp}.${extension}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
      
    } catch (error) {
      console.error('Download error:', error);
      throw new Error(error instanceof Error ? error.message : 'Download failed');
    }
  }

  // Preview data before downloading
  static async previewData(filters: DownloadFilters, previewLimit: number = 100): Promise<any[]> {
    try {
      const previewFilters = { ...filters, limit: previewLimit };
      const params = new URLSearchParams();
      
      if (previewFilters.locations && previewFilters.locations.length > 0) {
        params.append('location', previewFilters.locations[0]); // Just first location for preview
      }
      if (previewFilters.startDate) {
        params.append('start_date', previewFilters.startDate);
      }
      if (previewFilters.endDate) {
        params.append('end_date', previewFilters.endDate);
      }
      if (previewFilters.attributes && previewFilters.attributes.length > 0) {
        params.append('attributes', previewFilters.attributes.join(','));
      }
      params.append('limit', previewLimit.toString());

      const response = await fetch(
        `${this.baseUrl}/api/databases/${filters.database}/data/${filters.table}?${params.toString()}`
      );
      
      if (!response.ok) {
        throw new Error(`Preview failed: ${response.statusText}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : data.data || [];
    } catch (error) {
      console.error('Preview error:', error);
      throw new Error('Failed to preview data');
    }
  }

  // Health check
  static async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}