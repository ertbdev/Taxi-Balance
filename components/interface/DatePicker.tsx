"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"

import { Calendar } from "@/components/ui/calendar"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const FALLBACK_DISPLAY = "05/05/05"

function timestampToDate(timestamp: number | undefined): Date | undefined {
  if (timestamp == null) return undefined
  const date = new Date(timestamp)
  return isNaN(date.getTime()) ? undefined : date
}

function formatDate(date: Date | undefined): string {
  if (!date) return FALLBACK_DISPLAY

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  })
}

function isValidDate(date: Date | undefined): boolean {
  if (!date) return false
  return !isNaN(date.getTime())
}

interface DatePickerInputProps {
  /** Unix timestamp in milliseconds */
  value?: number
  onChange?: (timestamp: number) => void
  label?: string
}

export function DatePickerInput({
  value,
  onChange,
  label = "Subscription Date",
}: DatePickerInputProps) {
  const [open, setOpen] = React.useState(false)

  const dateFromProp = timestampToDate(value)
  const [date, setDate] = React.useState<Date | undefined>(dateFromProp)
  const [month, setMonth] = React.useState<Date | undefined>(dateFromProp)
  const [inputValue, setInputValue] = React.useState(formatDate(dateFromProp))

  // Sync internal state when the `value` prop changes externally
  React.useEffect(() => {
    const incoming = timestampToDate(value)
    setDate(incoming)
    setMonth(incoming)
    setInputValue(formatDate(incoming))
  }, [value])

  function handleCalendarSelect(selected: Date | undefined) {
    setDate(selected)
    setInputValue(formatDate(selected))
    setOpen(false)
    if (selected && isValidDate(selected)) {
      onChange?.(selected.getTime())
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    setInputValue(raw)
    const parsed = new Date(raw)
    if (isValidDate(parsed)) {
      setDate(parsed)
      setMonth(parsed)
      onChange?.(parsed.getTime())
    }
  }

  return (
    <Field className="mx-auto w-48">
      <FieldLabel htmlFor="date-required">{label}</FieldLabel>
      <InputGroup>
        <InputGroupInput
          id="date-required"
          value={inputValue}
          placeholder={FALLBACK_DISPLAY}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault()
              setOpen(true)
            }
          }}
        />
        <InputGroupAddon align="inline-end">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger render={<InputGroupButton id="date-picker" variant="ghost" size="icon-xs" aria-label="Select date"><CalendarIcon /><span className="sr-only">Select date</span></InputGroupButton>} />
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="end"
              alignOffset={-8}
              sideOffset={10}
            >
              <Calendar
                mode="single"
                selected={date}
                month={month}
                onMonthChange={setMonth}
                onSelect={handleCalendarSelect}
              />
            </PopoverContent>
          </Popover>
        </InputGroupAddon>
      </InputGroup>
    </Field>
  )
}
