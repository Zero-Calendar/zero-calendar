"use client";

import { format, isValid, parse } from "date-fns";
import { CalendarIcon, ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const VALUE_FORMAT = "yyyy-MM-dd'T'HH:mm";
const DEFAULT_HOUR = 9;
const DEFAULT_MINUTE = 0;

const HOURS = Array.from({ length: 12 }, (_, index) =>
  String(index + 1).padStart(2, "0")
);
const MINUTES = Array.from({ length: 60 }, (_, index) =>
  String(index).padStart(2, "0")
);

interface DateTimePickerProps {
  disabled?: boolean;
  placeholder?: string;
  popoverClassName?: string;
  showIcon?: boolean;
  triggerClassName?: string;
  value?: string;
  onChange: (value: string) => void;
}

interface TimePickerProps {
  disabled?: boolean;
  placeholder?: string;
  popoverClassName?: string;
  triggerClassName?: string;
  value?: string;
  onChange: (value: string) => void;
}

function parseDateTime(value?: string) {
  if (!value) {
    return null;
  }

  const parsed = parse(value, VALUE_FORMAT, new Date());
  return isValid(parsed) ? parsed : null;
}

function formatDateTimeValue(date: Date) {
  return format(date, VALUE_FORMAT);
}

function getBaseDate(date: Date | null) {
  const base = date ? new Date(date) : new Date();
  base.setSeconds(0, 0);

  if (!date) {
    base.setHours(DEFAULT_HOUR, DEFAULT_MINUTE, 0, 0);
  }

  return base;
}

function getTimeParts(date: Date | null) {
  if (!date) {
    return {
      hour: "09",
      meridiem: "AM" as const,
      minute: "00",
    };
  }

  const hour24 = date.getHours();
  const minute = String(date.getMinutes()).padStart(2, "0");
  const meridiem = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;

  return {
    hour: String(hour12).padStart(2, "0"),
    meridiem,
    minute,
  };
}

function getDisplayLabel(date: Date | null, placeholder: string) {
  if (!date) {
    return placeholder;
  }

  return format(date, "EEE, MMM d, yyyy • h:mm a");
}

function parseTimeValue(value?: string) {
  if (!value) {
    return null;
  }

  const [hours, minutes] = value.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  return {
    hours,
    minutes,
  };
}

function formatTimeLabel(hours: number, minutes: number) {
  const hour12 = hours % 12 || 12;
  const meridiem = hours >= 12 ? "PM" : "AM";
  return `${hour12}:${String(minutes).padStart(2, "0")} ${meridiem}`;
}

function formatTimeValue(hours: number, minutes: number) {
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function DateTimePicker({
  disabled,
  onChange,
  placeholder = "Pick date and time",
  popoverClassName,
  showIcon = true,
  triggerClassName,
  value,
}: DateTimePickerProps) {
  const selectedDate = parseDateTime(value);
  const timeParts = getTimeParts(selectedDate);

  const updateDate = (nextDate?: Date) => {
    if (!nextDate) {
      return;
    }

    const base = getBaseDate(selectedDate);
    base.setFullYear(
      nextDate.getFullYear(),
      nextDate.getMonth(),
      nextDate.getDate()
    );
    onChange(formatDateTimeValue(base));
  };

  const updateTime = (patch: Partial<typeof timeParts>) => {
    const nextParts = {
      ...timeParts,
      ...patch,
    };
    const base = getBaseDate(selectedDate);

    let hours = Number(nextParts.hour) % 12;
    if (nextParts.meridiem === "PM") {
      hours += 12;
    }

    base.setHours(hours, Number(nextParts.minute), 0, 0);
    onChange(formatDateTimeValue(base));
  };

  const setToday = () => {
    const base = getBaseDate(selectedDate);
    const today = new Date();
    base.setFullYear(today.getFullYear(), today.getMonth(), today.getDate());
    onChange(formatDateTimeValue(base));
  };

  const clearValue = () => onChange("");

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "flex h-10 w-full items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-left text-sm text-white/85 transition-colors hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 disabled:pointer-events-none disabled:opacity-50",
          triggerClassName
        )}
        disabled={disabled}
      >
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            {showIcon ? (
              <CalendarIcon className="h-4 w-4 shrink-0 text-white/35" />
            ) : null}
            <span
              className={cn(
                "truncate",
                !selectedDate && "text-white/35"
              )}
            >
              {getDisplayLabel(selectedDate, placeholder)}
            </span>
          </span>
        </span>
        <ChevronDownIcon className="h-4 w-4 shrink-0 text-white/35" />
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className={cn(
          "w-[22rem] gap-0 overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#0b0b0e]/95 p-0 text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)] ring-1 ring-white/10 backdrop-blur-2xl",
          popoverClassName
        )}
        sideOffset={8}
      >
        <div className="border-b border-white/[0.08] px-4 py-3">
          <p className="text-[10px] font-medium tracking-[0.22em] text-white/35 uppercase">
            Schedule
          </p>
          <p className="mt-1 text-sm font-medium text-white/90">
            {selectedDate
              ? format(selectedDate, "EEEE, MMMM d")
              : "Choose a date and time"}
          </p>
        </div>

        <div className="px-3 py-3">
          <Calendar
            mode="single"
            selected={selectedDate ?? undefined}
            onSelect={updateDate}
            className="mx-auto rounded-2xl bg-white/[0.02] p-2 text-white"
            classNames={{
              button_previous:
                "size-8 rounded-full border border-white/[0.06] bg-white/[0.03] text-white/70 hover:bg-white/[0.06] hover:text-white",
              button_next:
                "size-8 rounded-full border border-white/[0.06] bg-white/[0.03] text-white/70 hover:bg-white/[0.06] hover:text-white",
              caption_label: "text-sm font-semibold text-white",
              day: "text-white/90",
              outside: "text-white/20",
              today: "bg-white/[0.06] text-white",
              weekday:
                "text-[11px] font-medium uppercase tracking-[0.18em] text-white/30",
            }}
          />
        </div>

        <div className="border-t border-white/[0.08] px-3 py-3">
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_96px] gap-2">
            <Select
              onValueChange={(hour) => updateTime({ hour })}
              value={timeParts.hour}
            >
              <SelectTrigger className="h-10 rounded-2xl border-white/[0.08] bg-white/[0.04] px-3 py-0 text-sm text-white">
                <SelectValue placeholder="Hour" />
              </SelectTrigger>
              <SelectContent className="max-h-72 rounded-2xl border border-white/[0.12] shadow-2xl">
                {HOURS.map((hour) => (
                  <SelectItem key={hour} value={hour}>
                    {hour}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              onValueChange={(minute) => updateTime({ minute })}
              value={timeParts.minute}
            >
              <SelectTrigger className="h-10 rounded-2xl border-white/[0.08] bg-white/[0.04] px-3 py-0 text-sm text-white">
                <SelectValue placeholder="Minute" />
              </SelectTrigger>
              <SelectContent className="max-h-72 rounded-2xl border border-white/[0.12] shadow-2xl">
                {MINUTES.map((minute) => (
                  <SelectItem key={minute} value={minute}>
                    {minute}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              onValueChange={(meridiem) =>
                updateTime({ meridiem: meridiem as "AM" | "PM" })
              }
              value={timeParts.meridiem}
            >
              <SelectTrigger className="h-10 rounded-2xl border-white/[0.08] bg-white/[0.04] px-3 py-0 text-sm text-white">
                <SelectValue placeholder="AM/PM" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border border-white/[0.12] shadow-2xl">
                <SelectItem value="AM">AM</SelectItem>
                <SelectItem value="PM">PM</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <Button
              className="h-8 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 text-xs text-white/65 hover:bg-white/[0.06] hover:text-white"
              onClick={clearValue}
              type="button"
              variant="ghost"
            >
              Clear
            </Button>
            <Button
              className="h-8 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 text-xs text-white/65 hover:bg-white/[0.06] hover:text-white"
              onClick={setToday}
              type="button"
              variant="ghost"
            >
              Today
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function TimePicker({
  disabled,
  onChange,
  placeholder = "Pick time",
  popoverClassName,
  triggerClassName,
  value,
}: TimePickerProps) {
  const parsedValue = parseTimeValue(value);
  const timeParts = getTimeParts(
    parsedValue
      ? new Date(2026, 0, 1, parsedValue.hours, parsedValue.minutes)
      : null
  );

  const updateTime = (patch: Partial<typeof timeParts>) => {
    const nextParts = {
      ...timeParts,
      ...patch,
    };

    let hours = Number(nextParts.hour) % 12;
    if (nextParts.meridiem === "PM") {
      hours += 12;
    }

    onChange(formatTimeValue(hours, Number(nextParts.minute)));
  };

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "flex h-10 w-full items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-left text-sm text-white/85 transition-colors hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 disabled:pointer-events-none disabled:opacity-50",
          triggerClassName
        )}
        disabled={disabled}
      >
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "truncate",
              !parsedValue && "text-white/35"
            )}
          >
            {parsedValue
              ? formatTimeLabel(parsedValue.hours, parsedValue.minutes)
              : placeholder}
          </span>
        </span>
        <ChevronDownIcon className="h-4 w-4 shrink-0 text-white/35" />
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className={cn(
          "w-[18rem] gap-0 overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#0b0b0e]/95 p-0 text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)] ring-1 ring-white/10 backdrop-blur-2xl",
          popoverClassName
        )}
        sideOffset={8}
      >
        <div className="border-b border-white/[0.08] px-4 py-3">
          <p className="text-[10px] font-medium tracking-[0.22em] text-white/35 uppercase">
            Time
          </p>
          <p className="mt-1 text-sm font-medium text-white/90">
            {parsedValue
              ? formatTimeLabel(parsedValue.hours, parsedValue.minutes)
              : "Choose a start time"}
          </p>
        </div>

        <div className="px-3 py-3">
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_96px] gap-2">
            <Select
              onValueChange={(hour) => updateTime({ hour })}
              value={timeParts.hour}
            >
              <SelectTrigger className="h-10 rounded-2xl border-white/[0.08] bg-white/[0.04] px-3 py-0 text-sm text-white">
                <SelectValue placeholder="Hour" />
              </SelectTrigger>
              <SelectContent className="max-h-72 rounded-2xl border border-white/[0.12] shadow-2xl">
                {HOURS.map((hour) => (
                  <SelectItem key={hour} value={hour}>
                    {hour}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              onValueChange={(minute) => updateTime({ minute })}
              value={timeParts.minute}
            >
              <SelectTrigger className="h-10 rounded-2xl border-white/[0.08] bg-white/[0.04] px-3 py-0 text-sm text-white">
                <SelectValue placeholder="Minute" />
              </SelectTrigger>
              <SelectContent className="max-h-72 rounded-2xl border border-white/[0.12] shadow-2xl">
                {MINUTES.map((minute) => (
                  <SelectItem key={minute} value={minute}>
                    {minute}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              onValueChange={(meridiem) =>
                updateTime({ meridiem: meridiem as "AM" | "PM" })
              }
              value={timeParts.meridiem}
            >
              <SelectTrigger className="h-10 rounded-2xl border-white/[0.08] bg-white/[0.04] px-3 py-0 text-sm text-white">
                <SelectValue placeholder="AM/PM" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border border-white/[0.12] shadow-2xl">
                <SelectItem value="AM">AM</SelectItem>
                <SelectItem value="PM">PM</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <Button
              className="h-8 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 text-xs text-white/65 hover:bg-white/[0.06] hover:text-white"
              onClick={() => onChange("")}
              type="button"
              variant="ghost"
            >
              Clear
            </Button>
            <Button
              className="h-8 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 text-xs text-white/65 hover:bg-white/[0.06] hover:text-white"
              onClick={() => onChange("09:00")}
              type="button"
              variant="ghost"
            >
              9:00 AM
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
