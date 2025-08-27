import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileType, Loader2 } from 'lucide-react';

interface TableInfo {
  name: string;
  displayName?: string;
  description?: string;
  rowCount?: number;
}

interface TableSelectorProps {
  tables: TableInfo[];
  selectedTable: string;
  onTableChange: (tableName: string) => void;
  isLoading?: boolean;
  databaseName?: string;
}

const TableSelector: React.FC<TableSelectorProps> = ({
  tables,
  selectedTable,
  onTableChange,
  isLoading = false,
  databaseName
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileType className="h-5 w-5 text-primary" />
            Select Table
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading tables...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileType className="h-5 w-5 text-primary" />
          Select Table
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tables.length > 0 ? (
          tables.map((table) => (
            <Card 
              key={table.name}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedTable === table.name 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => onTableChange(table.name)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-3 h-3 rounded-full ${
                    selectedTable === table.name ? 'bg-primary' : 'bg-muted'
                  }`}></div>
                  <h4 className="font-medium text-sm">
                    {table.displayName || table.name}
                  </h4>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  {table.description || 'Environmental data table'}
                </p>
                {table.rowCount && (
                  <Badge variant="outline" className="text-xs">
                    {table.rowCount.toLocaleString()} records
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              {databaseName ? `No tables found in ${databaseName}` : 'Select a database to view tables'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TableSelector;