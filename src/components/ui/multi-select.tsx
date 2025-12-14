import * as React from "react"
import { Check, X, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface MultiSelectOption {
  value: string
  label: string
  description?: string
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  selected: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
  maxDisplay?: number
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
  searchPlaceholder = "Search...",
  emptyText = "No items found",
  className,
  maxDisplay = 3
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value))
    } else {
      onChange([...selected, value])
    }
  }

  const handleRemove = (value: string) => {
    onChange(selected.filter((item) => item !== value))
  }

  const handleClear = () => {
    onChange([])
  }

  const handleSelectAll = () => {
    if (selected.length === options.length) {
      onChange([])
    } else {
      onChange(options.map((opt) => opt.value))
    }
  }

  const selectedLabels = options
    .filter((opt) => selected.includes(opt.value))
    .map((opt) => opt.label)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-auto min-h-10 border-2 transition-all",
            open ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/50",
            className
          )}
        >
          <div className="flex gap-1 flex-wrap flex-1 items-center">
            {selected.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              <>
                {selectedLabels.slice(0, maxDisplay).map((label) => (
                  <Badge
                    variant="secondary"
                    key={label}
                    className="mr-1 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
                    onClick={(e) => {
                      e.stopPropagation()
                      const option = options.find(opt => opt.label === label)
                      if (option) handleRemove(option.value)
                    }}
                  >
                    {label}
                    <button
                      className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const option = options.find(opt => opt.label === label)
                          if (option) handleRemove(option.value)
                        }
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        const option = options.find(opt => opt.label === label)
                        if (option) handleRemove(option.value)
                      }}
                    >
                      <X className="h-3 w-3 text-primary/60 hover:text-primary" />
                    </button>
                  </Badge>
                ))}
                {selected.length > maxDisplay && (
                  <Badge variant="secondary" className="mr-1 bg-primary/10 text-primary border border-primary/20">
                    +{selected.length - maxDisplay} more
                  </Badge>
                )}
              </>
            )}
          </div>
          <ChevronDown className={cn(
            "ml-2 h-4 w-4 shrink-0 transition-transform duration-200",
            open ? "rotate-180 text-primary" : "opacity-50"
          )} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-popover border-2 border-border shadow-lg z-[100]" align="start">
        <Command className="bg-transparent">
          <CommandInput 
            placeholder={searchPlaceholder} 
            className="h-10 border-b border-border" 
          />
          <CommandList className="max-h-[280px]">
            <CommandEmpty className="py-6 text-center text-muted-foreground">
              {emptyText}
            </CommandEmpty>
            <CommandGroup>
              <CommandItem
                onSelect={handleSelectAll}
                className="cursor-pointer py-3 hover:bg-muted/50"
              >
                <div className="flex items-center gap-3 w-full">
                  <div
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded border-2 transition-colors",
                      selected.length === options.length
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-muted-foreground/30 hover:border-primary/50"
                    )}
                  >
                    {selected.length === options.length && (
                      <Check className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <span className="font-semibold text-foreground">
                    {selected.length === options.length ? "Deselect All" : "Select All"}
                  </span>
                </div>
              </CommandItem>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => handleSelect(option.value)}
                  className="cursor-pointer py-2.5 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded border-2 transition-colors",
                        selected.includes(option.value)
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-muted-foreground/30 hover:border-primary/50"
                      )}
                    >
                      {selected.includes(option.value) && (
                        <Check className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground truncate">{option.label}</div>
                      {option.description && (
                        <div className="text-xs text-muted-foreground truncate">
                          {option.description}
                        </div>
                      )}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
        {selected.length > 0 && (
          <div className="border-t border-border p-2 bg-muted/30">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={handleClear}
            >
              <X className="h-4 w-4 mr-2" />
              Clear All ({selected.length})
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
