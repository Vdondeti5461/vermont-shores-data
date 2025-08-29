# Data Download Feature Documentation

## Overview
The Dynamic Data Browser provides a comprehensive interface for downloading environmental data from multiple databases with advanced filtering and chunking capabilities.

## Key Features

### 1. Multi-Database Support
- Select from available databases dynamically
- Automatic table discovery per database
- Real-time attribute fetching

### 2. Advanced Filtering
- **Date Range Selection**: Custom start and end dates
- **Location Filtering**: Multi-select location picker
- **Attribute Selection**: Choose specific columns to download
- **Database/Table Selection**: Dropdown-based navigation

### 3. Smart Download System
- **Adaptive Time Chunking**: Automatically splits large requests into smaller time periods
- **Row Limit Bypass**: Recursively fetches data to avoid server 1000-row caps
- **Multi-Location Processing**: Handles multiple locations efficiently
- **Data Aggregation**: Combines all chunks into single CSV per location

### 4. Data Format
- **Timestamp Normalization**: Converts to Excel-compatible `YYYY-MM-DD HH:mm:ss` format
- **Attribute Filtering**: Downloads only selected columns
- **CSV Export**: Standard comma-separated values with proper escaping

## Technical Implementation

### Component: `DynamicDataBrowser.tsx`
- **Location**: `src/components/DynamicDataBrowser.tsx`
- **Dependencies**: React Query for API calls, date-fns for formatting
- **API Integration**: Production API server endpoints

### Key Functions
1. **`fetchDataWithAdaptiveSplitting()`**: Handles recursive time-based chunking
2. **`normalizeAndFilter()`**: Processes CSV data for timestamps and attribute filtering
3. **`handleDownload()`**: Main download orchestration with error handling

### Recent Improvements (Latest Version)
- ✅ Removed 1000-row download limitation
- ✅ Implemented adaptive time-splitting algorithm
- ✅ Added timestamp normalization for Excel compatibility
- ✅ Attribute-only CSV downloads (filters unwanted columns)
- ✅ Removed API status display from UI
- ✅ Enhanced error handling and user feedback

## Usage Flow
1. Select database from dropdown
2. Choose table within selected database
3. Set date range for data retrieval
4. Select location(s) for filtering
5. Choose specific attributes (optional - defaults to all)
6. Click "Download CSV" to initiate export

## Error Handling
- Automatic retry with smaller time chunks on 404/timeout
- User-friendly error messages
- Console logging for debugging
- Graceful fallback for missing data

## File Output
- **Format**: CSV with proper headers
- **Naming**: `{database}_{table}_{startDate}_to_{endDate}.csv`
- **Content**: Only selected attributes with normalized timestamps
- **Encoding**: UTF-8 with BOM for Excel compatibility

---
*Last Updated: Current version working as expected with UI and backend integration*