import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, Loader2 } from 'lucide-react';
import { DatabaseInfo } from '@/services/localDatabaseService';

interface DatabaseSelectorProps {
  databases: DatabaseInfo[];
  selectedDatabase: string;
  onDatabaseChange: (databaseId: string) => void;
  isLoading?: boolean;
}

const DatabaseSelector: React.FC<DatabaseSelectorProps> = ({
  databases,
  selectedDatabase,
  onDatabaseChange,
  isLoading = false
}) => {
  const getDatabaseBadgeVariant = (databaseId: string) => {
    switch (databaseId) {
      case 'processed_data': return 'default';
      case 'cleaned_data': return 'secondary';
      case 'processed_clean': return 'outline';
      default: return 'outline';
    }
  };

  const getDatabaseLabel = (databaseId: string) => {
    switch (databaseId) {
      case 'processed_data': return 'High Quality';
      case 'cleaned_data': return 'Cleaned';
      case 'processed_clean': return 'Enhanced';
      case 'main_data': return 'Core Data';
      default: return 'Raw Data';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Select Database
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading databases...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          Select Database
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {databases.map((db) => (
          <Card 
            key={db.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedDatabase === db.id 
                ? 'ring-2 ring-primary bg-primary/5' 
                : 'hover:bg-muted/50'
            }`}
            onClick={() => onDatabaseChange(db.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${
                  selectedDatabase === db.id ? 'bg-primary' : 'bg-muted'
                }`}></div>
                <h4 className="font-medium text-sm">{db.name}</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{db.database_name}</p>
              <Badge variant={getDatabaseBadgeVariant(db.id)}>
                {getDatabaseLabel(db.id)}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};

export default DatabaseSelector;