import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Download, Clock, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface DateRangeSelectorProps {
  startDate?: Date;
  endDate?: Date;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  timePreset: string;
  onTimePresetChange: (preset: string) => void;
  onDownload: () => void;
  isDownloading?: boolean;
  downloadSummary?: {
    database?: string;
    table?: string;
    locations?: number;
    attributes?: number;
  };
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  timePreset,
  onTimePresetChange,
  onDownload,
  isDownloading = false,
  downloadSummary
}) => {
  const timePresets = [
    { value: '', label: 'Custom Range' },
    { value: 'last_24h', label: 'Last 24 Hours' },
    { value: 'last_week', label: 'Last Week' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'last_3months', label: 'Last 3 Months' },
    { value: 'last_year', label: 'Last Year' },
    { value: 'current_year', label: 'Current Year (2024)' }
  ];

  const formatDateForInput = (date: Date | undefined) => {
    if (!date) return '';
    return format(date, "yyyy-MM-dd'T'HH:mm");
  };

  const parseDateFromInput = (dateString: string) => {
    if (!dateString) return undefined;
    return new Date(dateString);
  };

  const canDownload = downloadSummary?.database && downloadSummary?.table && 
                     (downloadSummary?.locations || 0) > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Date Range & Download
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Time Preset Selector */}
        <div className="space-y-2">
          <Label>Time Period</Label>
          <Select value={timePreset} onValueChange={onTimePresetChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select time period..." />
            </SelectTrigger>
            <SelectContent>
              {timePresets.map((preset) => (
                <SelectItem key={preset.value} value={preset.value}>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {preset.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Custom Date Range - only show if custom is selected or no preset */}
        {(!timePreset || timePreset === '') && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="datetime-local"
                value={formatDateForInput(startDate)}
                onChange={(e) => onStartDateChange(parseDateFromInput(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="datetime-local"
                value={formatDateForInput(endDate)}
                onChange={(e) => onEndDateChange(parseDateFromInput(e.target.value))}
              />
            </div>
          </div>
        )}

        {/* Download Summary */}
        {downloadSummary && (
          <Card className="bg-muted/30 border-muted">
            <CardContent className="p-4">
              <h4 className="font-medium text-sm mb-2">Download Summary</h4>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div>Database: <span className="font-medium">{downloadSummary.database || 'None selected'}</span></div>
                <div>Table: <span className="font-medium">{downloadSummary.table || 'None selected'}</span></div>
                <div>Locations: <span className="font-medium">{downloadSummary.locations || 0} selected</span></div>
                <div>Attributes: <span className="font-medium">{downloadSummary.attributes || 0} selected</span></div>
                {startDate && endDate && (
                  <div>
                    Period: <span className="font-medium">
                      {format(startDate, 'MMM dd, yyyy')} - {format(endDate, 'MMM dd, yyyy')}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Download Button */}
        <Button 
          onClick={onDownload}
          disabled={!canDownload || isDownloading}
          className="w-full"
          size="lg"
        >
          {isDownloading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Download CSV
            </>
          )}
        </Button>

        {!canDownload && !isDownloading && (
          <p className="text-xs text-muted-foreground text-center">
            Please select database, table, and at least one location to download
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default DateRangeSelector;