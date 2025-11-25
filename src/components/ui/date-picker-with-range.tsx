import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DatePickerWithYearMonthProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  minYear?: number
  maxYear?: number
}

export function DatePickerWithYearMonth({
  date,
  onDateChange,
  placeholder = "Pick a date",
  disabled = false,
  minYear = 2015,
  maxYear = new Date().getFullYear() + 1
}: DatePickerWithYearMonthProps) {
  const [month, setMonth] = React.useState<Date>(date || new Date())
  const [isOpen, setIsOpen] = React.useState(false)

  // Generate year options
  const years = React.useMemo(() => {
    const yearOptions = []
    for (let year = maxYear; year >= minYear; year--) {
      yearOptions.push(year)
    }
    return yearOptions
  }, [minYear, maxYear])

  // Month names
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const handleYearChange = (year: string) => {
    const newDate = new Date(month)
    newDate.setFullYear(parseInt(year))
    setMonth(newDate)
  }

  const handleMonthChange = (monthIndex: string) => {
    const newDate = new Date(month)
    newDate.setMonth(parseInt(monthIndex))
    setMonth(newDate)
  }

  const handleSelect = (selectedDate: Date | undefined) => {
    onDateChange?.(selectedDate)
    if (selectedDate) {
      setIsOpen(false)
    }
  }

  const handlePreviousMonth = () => {
    const newDate = new Date(month)
    newDate.setMonth(newDate.getMonth() - 1)
    setMonth(newDate)
  }

  const handleNextMonth = () => {
    const newDate = new Date(month)
    newDate.setMonth(newDate.getMonth() + 1)
    setMonth(newDate)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 border-b">
          <div className="flex items-center justify-between gap-2 mb-2">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={handlePreviousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex gap-2 flex-1">
              <Select
                value={month.getMonth().toString()}
                onValueChange={handleMonthChange}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((monthName, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {monthName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={month.getFullYear().toString()}
                onValueChange={handleYearChange}
              >
                <SelectTrigger className="h-7 text-xs w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={handleNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          month={month}
          onMonthChange={setMonth}
          initialFocus
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  )
}

interface DateRangePickerProps {
  startDate?: Date
  endDate?: Date
  onStartDateChange?: (date: Date | undefined) => void
  onEndDateChange?: (date: Date | undefined) => void
  minYear?: number
  maxYear?: number
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  minYear = 2015,
  maxYear = new Date().getFullYear() + 1
}: DateRangePickerProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Start Date</label>
        <DatePickerWithYearMonth
          date={startDate}
          onDateChange={onStartDateChange}
          placeholder="Select start date"
          minYear={minYear}
          maxYear={maxYear}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">End Date</label>
        <DatePickerWithYearMonth
          date={endDate}
          onDateChange={onEndDateChange}
          placeholder="Select end date"
          minYear={minYear}
          maxYear={maxYear}
          disabled={!startDate}
        />
      </div>
    </div>
  )
}
