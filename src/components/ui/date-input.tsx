"use client"

import * as React from "react"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isBefore, startOfDay, parseISO } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"

interface DateInputProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  minDate?: Date
  availableDates?: string[] // Array of ISO date strings for available tour dates
}

export function DateInput({
  date,
  onDateChange,
  placeholder = "Select a date",
  className,
  disabled = false,
  minDate = new Date(), // Default to today
  availableDates = [] // Optional: specific available dates
}: DateInputProps) {
  const [open, setOpen] = React.useState(false)
  const [currentMonth, setCurrentMonth] = React.useState(date || new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Calculate empty cells for the start of the month
  const startDayOfWeek = monthStart.getDay()
  const emptyCells = Array(startDayOfWeek).fill(null)

  // Convert available dates to Date objects
  const availableDateObjects = React.useMemo(() => {
    const today = startOfDay(new Date())
    return availableDates
      .map(dateStr => startOfDay(parseISO(dateStr)))
      .filter(date => !isBefore(date, today))
      .sort((a, b) => a.getTime() - b.getTime())
  }, [availableDates])

  // Check if a date is in the available dates list
  const isDateAvailable = React.useCallback((checkDate: Date) => {
    if (availableDateObjects.length === 0) {
      // If no specific dates provided, allow any future date
      return true
    }

    // Check if date matches any available date
    return availableDateObjects.some(availableDate =>
      isSameDay(checkDate, availableDate)
    )
  }, [availableDateObjects])

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const handleDateSelect = (selectedDate: Date) => {
    const today = startOfDay(new Date())
    const minDateStart = startOfDay(minDate)
    const selectedDateStart = startOfDay(selectedDate)

    // Check if the date is in the past or before minDate
    if (isBefore(selectedDateStart, today) || isBefore(selectedDateStart, minDateStart)) {
      return // Don't allow selection
    }

    // Check if date is available (if availableDates is provided)
    if (!isDateAvailable(selectedDate)) {
      return // Don't allow selection of unavailable dates
    }

    onDateChange?.(selectedDate)
    setOpen(false)
  }

  const isDateDisabled = (checkDate: Date) => {
    const today = startOfDay(new Date())
    const minDateStart = startOfDay(minDate)
    const checkDateStart = startOfDay(checkDate)

    // A date is disabled if it's before today OR before the specified minDate
    const isPastDate = isBefore(checkDateStart, today) || isBefore(checkDateStart, minDateStart)

    // Also disable if not in available dates (when availableDates is provided)
    const isNotAvailable = !isDateAvailable(checkDate)

    return isPastDate || isNotAvailable
  }

  const isDateSelected = (checkDate: Date) => {
    return date ? isSameDay(checkDate, date) : false
  }

  const isToday = (checkDate: Date) => {
    return isSameDay(checkDate, new Date())
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
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
        <div className="p-4 space-y-4">
          {/* Month/Year Header */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePreviousMonth}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-semibold">
              {format(currentMonth, "MMMM yyyy")}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextMonth}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day Names */}
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div
                key={day}
                className="h-8 w-8 flex items-center justify-center text-xs font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}

            {/* Empty cells for alignment */}
            {emptyCells.map((_, index) => (
              <div key={`empty-${index}`} className="h-8 w-8" />
            ))}

            {/* Date cells */}
            {daysInMonth.map((day) => {
              const disabled = isDateDisabled(day)
              const selected = isDateSelected(day)
              const today = isToday(day)
              const available = isDateAvailable(day) && !isBefore(startOfDay(day), startOfDay(new Date()))

              return (
                <button
                  key={day.toString()}
                  onClick={() => handleDateSelect(day)}
                  disabled={disabled}
                  className={cn(
                    "h-8 w-8 rounded-md text-sm font-normal transition-all",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    disabled && "text-muted-foreground opacity-30 cursor-not-allowed hover:bg-transparent",
                    selected && "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 font-semibold shadow-lg",
                    !selected && today && "border-2 border-purple-500 font-semibold text-purple-600",
                    !selected && !today && available && availableDateObjects.length > 0 && "border border-green-500 text-green-700 font-medium bg-green-50",
                    !selected && !today && !disabled && "hover:bg-purple-50 dark:hover:bg-purple-950/20"
                  )}
                >
                  {format(day, "d")}
                </button>
              )
            })}
          </div>

          {/* Today Button */}
          <div className="flex justify-center pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date()
                if (!isDateDisabled(today)) {
                  handleDateSelect(today)
                }
              }}
              className="text-xs"
            >
              Today
            </Button>
          </div>

          {/* Show available dates info if provided */}
          {availableDateObjects.length > 0 && (
            <div className="pt-2 border-t">
              <p className="text-xs font-medium text-gray-700 mb-2">
                Available Tour Dates:
              </p>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {availableDateObjects.slice(0, 5).map((availableDate, index) => (
                  <button
                    key={index}
                    onClick={() => handleDateSelect(availableDate)}
                    className="text-xs text-left w-full px-2 py-1 rounded hover:bg-green-50 border border-green-200 text-green-700 transition-colors"
                  >
                    {format(availableDate, "PPP")}
                  </button>
                ))}
                {availableDateObjects.length > 5 && (
                  <p className="text-xs text-gray-500 px-2">
                    +{availableDateObjects.length - 5} more dates available
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
