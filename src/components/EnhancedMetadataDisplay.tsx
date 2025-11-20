import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Info, MapPin, Database, Table as TableIcon, Columns } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DatabaseInfo {
  key: string;
  name: string;
  displayName: string;
  description: string;
}

interface TableInfo {
  name: string;
  displayName: string;
  description: string;
  rowCount: number;
  primaryAttributes: string[];
}

interface LocationInfo {
  id: number;
  name: string;
  displayName: string;
  latitude: number;
  longitude: number;
  elevation: number;
}

interface AttributeInfo {
  name: string;
  type: string;
  category: string;
  isPrimary: boolean;
  unit: string;
  measurementType: string;
  comment: string;
}

interface EnhancedMetadataDisplayProps {
  database?: DatabaseInfo;
  table?: TableInfo;
  locations?: LocationInfo[];
  attributes?: AttributeInfo[];
}

export const EnhancedMetadataDisplay: React.FC<EnhancedMetadataDisplayProps> = ({
  database,
  table,
  locations = [],
  attributes = []
}) => {
  // Group attributes by category
  const groupedAttributes = attributes.reduce((acc, attr) => {
    const category = attr.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(attr);
    return acc;
  }, {} as Record<string, AttributeInfo[]>);

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          Data Selection Metadata
        </CardTitle>
        <CardDescription>
          Detailed information about your selected database, table, locations, and attributes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="database" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="database">
              <Database className="h-4 w-4 mr-2" />
              Database
            </TabsTrigger>
            <TabsTrigger value="table">
              <TableIcon className="h-4 w-4 mr-2" />
              Table
            </TabsTrigger>
            <TabsTrigger value="locations">
              <MapPin className="h-4 w-4 mr-2" />
              Locations
            </TabsTrigger>
            <TabsTrigger value="attributes">
              <Columns className="h-4 w-4 mr-2" />
              Attributes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="database" className="space-y-4 mt-4">
            {database ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{database.displayName}</h3>
                  <Badge variant="outline" className="mb-3">{database.key}</Badge>
                  <p className="text-sm text-muted-foreground">{database.description}</p>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium">Database Name:</span>
                    <p className="text-sm text-muted-foreground">{database.name}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Key:</span>
                    <p className="text-sm text-muted-foreground font-mono">{database.key}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No database selected</p>
            )}
          </TabsContent>

          <TabsContent value="table" className="space-y-4 mt-4">
            {table ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{table.displayName}</h3>
                  <Badge variant="secondary" className="mb-3">{table.name}</Badge>
                  <p className="text-sm text-muted-foreground">{table.description}</p>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium">Table Name:</span>
                    <p className="text-sm text-muted-foreground font-mono">{table.name}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Row Count:</span>
                    <p className="text-sm text-muted-foreground">{table.rowCount.toLocaleString()}</p>
                  </div>
                </div>
                {table.primaryAttributes && table.primaryAttributes.length > 0 && (
                  <div>
                    <span className="text-sm font-medium">Primary Attributes:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {table.primaryAttributes.map((attr) => (
                        <Badge key={attr} variant="outline">{attr}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No table selected</p>
            )}
          </TabsContent>

          <TabsContent value="locations" className="mt-4">
            {locations.length > 0 ? (
              <ScrollArea className="h-[400px] w-full rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">Latitude</TableHead>
                      <TableHead className="text-right">Longitude</TableHead>
                      <TableHead className="text-right">Elevation (m)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {locations.map((location) => (
                      <TableRow key={location.id}>
                        <TableCell className="font-medium">{location.name}</TableCell>
                        <TableCell>{location.displayName}</TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {location.latitude.toFixed(4)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {location.longitude.toFixed(4)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {location.elevation}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            ) : (
              <p className="text-muted-foreground text-center py-8">No locations available</p>
            )}
          </TabsContent>

          <TabsContent value="attributes" className="mt-4">
            {Object.keys(groupedAttributes).length > 0 ? (
              <ScrollArea className="h-[400px] w-full">
                <div className="space-y-6">
                  {Object.entries(groupedAttributes).map(([category, attrs]) => (
                    <div key={category} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="default">{category}</Badge>
                        <span className="text-sm text-muted-foreground">
                          ({attrs.length} attributes)
                        </span>
                      </div>
                      <div className="grid gap-3">
                        {attrs.map((attr) => (
                          <Card key={attr.name} className="border-l-4 border-l-primary/30">
                            <CardContent className="pt-4 pb-3">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-sm flex items-center gap-2">
                                    {attr.name.replace(/_/g, ' ')}
                                    {attr.isPrimary && (
                                      <Badge variant="secondary" className="text-xs">Primary</Badge>
                                    )}
                                  </h4>
                                  {attr.comment && (
                                    <p className="text-xs text-muted-foreground mt-1">{attr.comment}</p>
                                  )}
                                </div>
                                <div className="text-right space-y-1">
                                  {attr.unit && (
                                    <Badge variant="outline" className="text-xs">{attr.unit}</Badge>
                                  )}
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                <div>
                                  <span className="font-medium">Type:</span> {attr.type}
                                </div>
                                <div>
                                  <span className="font-medium">Measurement:</span> {attr.measurementType}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <p className="text-muted-foreground text-center py-8">No attributes available</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
