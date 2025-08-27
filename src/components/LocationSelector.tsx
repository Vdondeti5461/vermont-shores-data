import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { MapPin, Loader2 } from 'lucide-react';

interface LocationData {
  id: number;
  name: string;
  latitude?: number;
  longitude?: number;
  elevation?: number;
}

interface LocationSelectorProps {
  locations: LocationData[];
  selectedLocations: string[];
  onLocationToggle: (locationName: string) => void;
  onSelectAll: () => void;
  isLoading?: boolean;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  locations,
  selectedLocations,
  onLocationToggle,
  onSelectAll,
  isLoading = false
}) => {
  const allSelected = locations.length > 0 && selectedLocations.length === locations.length;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Select Locations
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading locations...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Select Locations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Available Locations</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={onSelectAll}
            disabled={locations.length === 0}
          >
            {allSelected ? 'Deselect All' : 'Select All'}
          </Button>
        </div>
        
        <div className="max-h-64 overflow-y-auto space-y-2">
          {locations.length > 0 ? (
            locations.map((location) => (
              <div key={location.id} className="flex items-center space-x-2 p-2 rounded hover:bg-muted/50">
                <Checkbox
                  id={`location-${location.id}`}
                  checked={selectedLocations.includes(location.name)}
                  onCheckedChange={() => onLocationToggle(location.name)}
                />
                <Label 
                  htmlFor={`location-${location.id}`} 
                  className="flex-1 text-sm cursor-pointer"
                >
                  <div>
                    <div className="font-medium">{location.name}</div>
                    {location.elevation && (
                      <div className="text-xs text-muted-foreground">
                        Elevation: {location.elevation}m
                      </div>
                    )}
                  </div>
                </Label>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">No locations available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationSelector;