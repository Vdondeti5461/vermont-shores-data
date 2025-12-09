import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

// Predefined date ranges - prefer specific ranges over "All Data" for better performance
const DATE_PRESETS = [
  { label: 'Last 7 days', days: 7, recommended: true },
  { label: 'Last 30 days', days: 30, recommended: true },
  { label: 'Last 90 days', days: 90, recommended: true },
  { label: 'This Season', days: 180, recommended: true },
  { label: 'All Data', days: 0, recommended: false },
];

export const DateRangeFilter = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangeFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handlePreset = (days: number) => {
    if (days === 0) {
      onStartDateChange('');
      onEndDateChange('');
    } else {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - days);
      
      onStartDateChange(start.toISOString().split('T')[0]);
      onEndDateChange(end.toISOString().split('T')[0]);
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    onStartDateChange('');
    onEndDateChange('');
  };

  const displayValue = startDate && endDate 
    ? `${format(new Date(startDate), 'MMM d')} - ${format(new Date(endDate), 'MMM d, yyyy')}`
    : startDate 
      ? `From ${format(new Date(startDate), 'MMM d, yyyy')}`
      : endDate
        ? `Until ${format(new Date(endDate), 'MMM d, yyyy')}`
        : 'All time';

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-left font-normal">
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span className="truncate">{displayValue}</span>
          {(startDate || endDate) && (
            <X 
              className="ml-auto h-4 w-4 opacity-50 hover:opacity-100" 
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 border-b space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Quick Select</p>
            <span className="text-xs text-muted-foreground">★ = Recommended</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {DATE_PRESETS.map((preset) => (
              <Button
                key={preset.label}
                variant={preset.recommended ? "outline" : "ghost"}
                size="sm"
                onClick={() => handlePreset(preset.days)}
                className={`text-xs ${!preset.recommended ? 'opacity-70 border-dashed border' : ''}`}
                title={preset.recommended ? 'Recommended for best performance' : 'May be slow with large datasets'}
              >
                {preset.recommended && <span className="mr-1 text-primary">★</span>}
                {preset.label}
              </Button>
            ))}
          </div>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
            💡 Tip: Use a date range for faster loading and better chart performance
          </p>
        </div>
        <div className="p-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                className="h-9"
              />
            </div>
          </div>
          <Button 
            variant="secondary" 
            size="sm" 
            className="w-full"
            onClick={() => setIsOpen(false)}
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
