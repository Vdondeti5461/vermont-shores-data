import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Settings, Loader2, Clock, MapPin, Thermometer, Droplets, Wind, Database } from 'lucide-react';

interface AttributeInfo {
  name: string;
  type: string;
  category?: string;
  isPrimary?: boolean;
}

interface AttributeSelectorProps {
  attributes: AttributeInfo[];
  selectedAttributes: string[];
  onAttributeToggle: (attributeName: string) => void;
  onSelectAll: () => void;
  isLoading?: boolean;
  tableName?: string;
}

const AttributeSelector: React.FC<AttributeSelectorProps> = ({
  attributes,
  selectedAttributes,
  onAttributeToggle,
  onSelectAll,
  isLoading = false,
  tableName
}) => {
  const getAttributeIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'time':
      case 'timestamp': return <Clock className="h-3 w-3" />;
      case 'location': return <MapPin className="h-3 w-3" />;
      case 'temperature': return <Thermometer className="h-3 w-3" />;
      case 'precipitation': return <Droplets className="h-3 w-3" />;
      case 'wind': return <Wind className="h-3 w-3" />;
      default: return <Database className="h-3 w-3" />;
    }
  };

  const getAttributeColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'time':
      case 'timestamp': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'location': return 'text-green-600 bg-green-50 border-green-200';
      case 'temperature': return 'text-red-600 bg-red-50 border-red-200';
      case 'precipitation': return 'text-cyan-600 bg-cyan-50 border-cyan-200';
      case 'wind': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const allSelected = attributes.length > 0 && selectedAttributes.length === attributes.length;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Select Attributes
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading attributes...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Select Attributes
        </CardTitle>
        {tableName && (
          <p className="text-sm text-muted-foreground">
            Available columns in {tableName}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Available Attributes</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={onSelectAll}
            disabled={attributes.length === 0}
          >
            {allSelected ? 'Deselect All' : 'Select All'}
          </Button>
        </div>
        
        <div className="max-h-64 overflow-y-auto space-y-2">
          {attributes.length > 0 ? (
            attributes.map((attr) => (
              <div key={attr.name} className="flex items-center space-x-2 p-2 rounded hover:bg-muted/50">
                <Checkbox
                  id={`attr-${attr.name}`}
                  checked={selectedAttributes.includes(attr.name)}
                  onCheckedChange={() => onAttributeToggle(attr.name)}
                />
                <Label 
                  htmlFor={`attr-${attr.name}`} 
                  className="flex-1 text-sm cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getAttributeColor(attr.category || 'other')}`}
                    >
                      {getAttributeIcon(attr.category || 'other')}
                      <span className="ml-1">{attr.name}</span>
                    </Badge>
                    {attr.isPrimary && (
                      <Badge variant="secondary" className="text-xs">
                        Primary
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {attr.type}
                  </div>
                </Label>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                {tableName ? `No attributes found in ${tableName}` : 'Select a table to view attributes'}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AttributeSelector;