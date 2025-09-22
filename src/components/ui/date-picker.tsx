"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format, isBefore, startOfDay, parseISO } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Calendar } from "./calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover"

interface DatePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  availableDates?: string[]
  className?: string
  disabled?: boolean
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  availableDates = [],
  className,
  disabled = false
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  
  // Convert available dates to Date objects and filter out past dates
  const availableDateObjects = React.useMemo(() => {
    const today = startOfDay(new Date())
    return availableDates
      .map(dateStr => parseISO(dateStr))
      .filter(date => !isBefore(date, today))
      .sort((a, b) => a.getTime() - b.getTime())
  }, [availableDates])

  // Check if a date is available
  const isDateAvailable = React.useCallback((date: Date) => {
    if (availableDateObjects.length === 0) {
      // If no specific dates provided, allow any future date
      return !isBefore(date, startOfDay(new Date()))
    }
    
    // Check if date matches any available date
    return availableDateObjects.some(availableDate => 
      format(date, 'yyyy-MM-dd') === format(availableDate, 'yyyy-MM-dd')
    )
  }, [availableDateObjects])

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate && isDateAvailable(selectedDate)) {
      onDateChange?.(selectedDate)
      setOpen(false)
    } else if (!selectedDate) {
      onDateChange?.(undefined)
    }
  }

  // Disable dates that are not available
  const disabledDates = React.useCallback((date: Date) => {
    return !isDateAvailable(date)
  }, [isDateAvailable])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          disabled={disabledDates}
          initialFocus
          numberOfMonths={1}
        />
        
        {/* Show available dates if specific dates are provided */}
        {availableDateObjects.length > 0 && (
          <div className="p-3 border-t">
            <p className="text-sm font-medium text-gray-900 mb-2">
              Available Dates:
            </p>
            <div className="flex flex-wrap gap-1">
              {availableDateObjects.slice(0, 6).map((availableDate, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleDateSelect(availableDate)}
                >
                  {format(availableDate, "MMM dd")}
                </Button>
              ))}
              {availableDateObjects.length > 6 && (
                <span className="text-xs text-gray-500 self-center">
                  +{availableDateObjects.length - 6} more
                </span>
              )}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}