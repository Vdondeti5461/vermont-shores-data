import * as XLSX from 'xlsx';

export interface ExportOptions {
  filename: string;
  sheetName?: string;
  includeMetadata?: boolean;
  metadata?: {
    database: string;
    table: string;
    dateRange?: string;
    locations?: string[];
    exportDate?: string;
    totalRecords?: number;
  };
}

/**
 * Export data to Excel format with optional metadata sheet
 */
export const exportToExcel = (data: any[], options: ExportOptions): void => {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  const workbook = XLSX.utils.book_new();

  // Add metadata sheet if requested
  if (options.includeMetadata && options.metadata) {
    const metadataRows = [
      ['Summit2Shore Environmental Data Export'],
      [''],
      ['Export Information'],
      ['Database', options.metadata.database],
      ['Table', options.metadata.table],
      ['Export Date', options.metadata.exportDate || new Date().toISOString()],
      ['Total Records', options.metadata.totalRecords || data.length],
      [''],
    ];

    if (options.metadata.dateRange) {
      metadataRows.push(['Date Range', options.metadata.dateRange]);
    }

    if (options.metadata.locations && options.metadata.locations.length > 0) {
      metadataRows.push(['Locations', options.metadata.locations.join(', ')]);
    }

    metadataRows.push(
      [''],
      ['Data Dictionary'],
      ['Column Name', 'Description']
    );

    // Add column headers as data dictionary
    const columnHeaders = Object.keys(data[0]);
    columnHeaders.forEach(header => {
      metadataRows.push([header, '']); // Backend can populate descriptions
    });

    const metadataSheet = XLSX.utils.aoa_to_sheet(metadataRows);
    
    // Set column widths
    metadataSheet['!cols'] = [
      { wch: 20 }, // Column A
      { wch: 50 }  // Column B
    ];

    XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Metadata');
  }

  // Add data sheet
  const dataSheet = XLSX.utils.json_to_sheet(data);
  
  // Auto-size columns based on content
  const columnWidths = Object.keys(data[0]).map(key => ({
    wch: Math.max(
      key.length,
      ...data.slice(0, 100).map(row => 
        String(row[key] || '').length
      )
    )
  }));
  dataSheet['!cols'] = columnWidths;

  XLSX.utils.book_append_sheet(
    workbook, 
    dataSheet, 
    options.sheetName || 'Data'
  );

  // Generate file
  XLSX.writeFile(workbook, `${options.filename}.xlsx`);
};

/**
 * Export data to CSV format
 */
export const exportToCSV = (data: any[], filename: string): void => {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  
  XLSX.writeFile(workbook, `${filename}.csv`, { bookType: 'csv' });
};

/**
 * Get export format from file extension
 */
export const getExportFormat = (format: 'excel' | 'csv'): string => {
  return format === 'excel' ? 'xlsx' : 'csv';
};
