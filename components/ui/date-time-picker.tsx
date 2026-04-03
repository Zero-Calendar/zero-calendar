"use client";

import {
  addMonths,
  eachDayOfInterval,
  format,
  isSameDay,
  isSameMonth,
  isValid,
  parse,
  startOfWeek,
  subMonths,
} from "date-fns";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const VALUE_FORMAT = "yyyy-MM-dd'T'HH:mm";
const DEFAULT_HOUR = 9;
const DEFAULT_MINUTE = 0;
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => ({
  hours: Math.floor(i / 2),
  minutes: (i % 2) * 30,
}));

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

function parseTimeValue(value?: string) {
  if (!value) {
    return null;
  }
  const [h, m] = value.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) {
    return null;
  }
  return { hours: h, minutes: m };
}

function formatTimeLabel(hours: number, minutes: number) {
  const h12 = hours % 12 || 12;
  const mer = hours >= 12 ? "PM" : "AM";
  return `${h12}:${String(minutes).padStart(2, "0")} ${mer}`;
}

function formatTimeValue(hours: number, minutes: number) {
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

interface DateTimePickerProps {
  disabled?: boolean;
  onChange: (value: string) => void;
  placeholder?: string;
  popoverClassName?: string;
  showIcon?: boolean;
  triggerClassName?: string;
  value?: string;
}

interface TimePickerProps {
  disabled?: boolean;
  onChange: (value: string) => void;
  placeholder?: string;
  popoverClassName?: string;
  triggerClassName?: string;
  value?: string;
}

function CompactCalendar({
  onSelect,
  selected,
}: {
  onSelect: (date: Date) => void;
  selected: Date | null;
}) {
  const [viewMonth, setViewMonth] = useState(() => {
    const d = selected ?? new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  useEffect(() => {
    if (!selected) {
      return;
    }
    setViewMonth((prev) => {
      if (
        prev.getFullYear() === selected.getFullYear() &&
        prev.getMonth() === selected.getMonth()
      ) {
        return prev;
      }
      return new Date(selected.getFullYear(), selected.getMonth(), 1);
    });
  }, [selected]);

  const firstOfMonth = new Date(
    viewMonth.getFullYear(),
    viewMonth.getMonth(),
    1
  );
  const gridStart = startOfWeek(firstOfMonth, { weekStartsOn: 0 });
  const gridEnd = new Date(gridStart);
  gridEnd.setDate(gridStart.getDate() + 41);
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const goPrev = useCallback(() => setViewMonth((v) => subMonths(v, 1)), []);
  const goNext = useCallback(() => setViewMonth((v) => addMonths(v, 1)), []);

  return (
    <div className="select-none">
      <div className="mb-1 flex items-center justify-between">
        <button
          aria-label="Previous month"
          className="flex size-6 items-center justify-center rounded-md text-white/30 transition-colors hover:bg-white/[0.06] hover:text-white/60"
          onClick={goPrev}
          type="button"
        >
          <ChevronLeftIcon className="size-3" />
        </button>
        <span className="font-medium text-[11px] text-white/60 tabular-nums tracking-tight">
          {format(viewMonth, "MMM yyyy")}
        </span>
        <button
          aria-label="Next month"
          className="flex size-6 items-center justify-center rounded-md text-white/30 transition-colors hover:bg-white/[0.06] hover:text-white/60"
          onClick={goNext}
          type="button"
        >
          <ChevronRightIcon className="size-3" />
        </button>
      </div>

      <div className="mb-0.5 grid grid-cols-7">
        {WEEKDAYS.map((wd, i) => (
          <div
            className="py-0.5 text-center font-medium text-[10px] text-white/20"
            key={`wd-${String(i)}`}
          >
            {wd}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day) => {
          const isSelected = Boolean(selected && isSameDay(day, selected));
          const isToday = isSameDay(day, new Date());
          const isOutside = !isSameMonth(day, viewMonth);

          return (
            <button
              aria-label={format(day, "EEEE, MMMM d, yyyy")}
              className={cn(
                "flex h-7 items-center justify-center rounded-md text-[11px] tabular-nums transition-colors duration-100",
                isOutside && "text-white/[0.12]",
                !(isOutside || isSelected) &&
                  "text-white/60 hover:bg-white/[0.06] hover:text-white/80",
                isToday &&
                  !isSelected &&
                  "bg-white/[0.07] font-medium text-white",
                isSelected && "bg-white font-semibold text-black"
              )}
              key={day.toISOString()}
              onClick={() => onSelect(day)}
              type="button"
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TimeSlotList({
  onSelect,
  selectedHours,
  selectedMinutes,
}: {
  onSelect: (hours: number, minutes: number) => void;
  selectedHours: number;
  selectedMinutes: number;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) {
      return;
    }
    const targetMin = selectedHours * 60 + selectedMinutes;
    let nearestIdx = 0;
    let nearestDist = Number.POSITIVE_INFINITY;
    for (let i = 0; i < TIME_SLOTS.length; i++) {
      const dist = Math.abs(
        TIME_SLOTS[i].hours * 60 + TIME_SLOTS[i].minutes - targetMin
      );
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    }
    const itemH = 28;
    node.scrollTop = nearestIdx * itemH - node.clientHeight / 2 + itemH / 2;
  }, [selectedHours, selectedMinutes]);

  return (
    <div
      className="max-h-[196px] overflow-y-auto overscroll-contain py-0.5"
      ref={scrollRef}
    >
      {TIME_SLOTS.map(({ hours, minutes }) => {
        const isSelected =
          hours === selectedHours && minutes === selectedMinutes;

        return (
          <button
            className={cn(
              "flex h-7 w-full items-center rounded-md px-2.5 text-[11px] tabular-nums transition-colors duration-100",
              isSelected
                ? "bg-white font-medium text-black"
                : "text-white/50 hover:bg-white/[0.06] hover:text-white/80"
            )}
            key={`${hours}:${minutes}`}
            onClick={() => onSelect(hours, minutes)}
            type="button"
          >
            {formatTimeLabel(hours, minutes)}
          </button>
        );
      })}
    </div>
  );
}

export function DatePicker({
  disabled,
  onChange,
  placeholder = "Pick a date",
  popoverClassName,
  triggerClassName,
  value,
}: {
  disabled?: boolean;
  onChange: (value: string) => void;
  placeholder?: string;
  popoverClassName?: string;
  triggerClassName?: string;
  value?: string;
}) {
  const [open, setOpen] = useState(false);

  const selectedDate = value
    ? (() => {
        const p = parse(value, "yyyy-MM-dd", new Date());
        return isValid(p) ? p : null;
      })()
    : null;

  const handleSelect = (next: Date) => {
    onChange(format(next, "yyyy-MM-dd"));
    setOpen(false);
  };

  const goToday = () => {
    onChange(format(new Date(), "yyyy-MM-dd"));
    setOpen(false);
  };

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger
        className={cn(
          "flex h-10 w-full items-center gap-2 rounded-xl px-3 text-left text-sm transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          triggerClassName
        )}
        disabled={disabled}
      >
        <span
          className={cn(
            "min-w-0 flex-1 truncate tabular-nums",
            selectedDate ? "font-medium text-white/90" : "text-white/35"
          )}
        >
          {selectedDate
            ? format(selectedDate, "EEE, MMM d, yyyy")
            : placeholder}
        </span>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className={cn(
          "w-[248px] gap-0 overflow-hidden rounded-xl border border-white/[0.08] bg-popover p-2.5 shadow-[var(--glass-shadow)] ring-0",
          popoverClassName
        )}
        sideOffset={6}
      >
        <CompactCalendar onSelect={handleSelect} selected={selectedDate} />
        <div className="mt-1 flex justify-end border-white/[0.06] border-t pt-1">
          <button
            className="rounded-md px-2 py-0.5 font-medium text-[10px] text-white/30 transition-colors hover:bg-white/[0.06] hover:text-white/50"
            onClick={goToday}
            type="button"
          >
            Today
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function TimePicker({
  disabled,
  onChange,
  placeholder = "Time",
  popoverClassName,
  triggerClassName,
  value,
}: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const parsedValue = parseTimeValue(value);

  const handleSelect = (hours: number, minutes: number) => {
    onChange(formatTimeValue(hours, minutes));
    setOpen(false);
  };

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger
        className={cn(
          "flex h-10 w-full items-center gap-2 rounded-xl px-3 text-left text-sm transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          triggerClassName
        )}
        disabled={disabled}
      >
        <span
          className={cn(
            "min-w-0 flex-1 truncate tabular-nums",
            parsedValue ? "font-medium text-white/90" : "text-white/35"
          )}
        >
          {parsedValue
            ? formatTimeLabel(parsedValue.hours, parsedValue.minutes)
            : placeholder}
        </span>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className={cn(
          "w-[136px] gap-0 overflow-hidden rounded-xl border border-white/[0.08] bg-popover p-1 shadow-[var(--glass-shadow)] ring-0",
          popoverClassName
        )}
        sideOffset={6}
      >
        <TimeSlotList
          onSelect={handleSelect}
          selectedHours={parsedValue?.hours ?? DEFAULT_HOUR}
          selectedMinutes={parsedValue?.minutes ?? DEFAULT_MINUTE}
        />
      </PopoverContent>
    </Popover>
  );
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
  const [open, setOpen] = useState(false);
  const selectedDate = parseDateTime(value);

  const updateDate = (nextDate: Date) => {
    const base = getBaseDate(selectedDate);
    base.setFullYear(
      nextDate.getFullYear(),
      nextDate.getMonth(),
      nextDate.getDate()
    );
    onChange(formatDateTimeValue(base));
  };

  const updateTime = (nextH24: number, nextMin: number) => {
    const base = getBaseDate(selectedDate);
    base.setHours(nextH24, nextMin, 0, 0);
    onChange(formatDateTimeValue(base));
    setOpen(false);
  };

  const label = selectedDate
    ? format(selectedDate, "EEE, MMM d · h:mm a")
    : placeholder;

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger
        className={cn(
          "flex h-10 w-full items-center gap-2 rounded-xl px-3 text-left text-sm transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          triggerClassName
        )}
        disabled={disabled}
      >
        {showIcon && (
          <CalendarIcon className="size-3.5 shrink-0 text-white/35" />
        )}
        <span
          className={cn(
            "min-w-0 flex-1 truncate tabular-nums",
            selectedDate ? "font-medium text-white/90" : "text-white/35"
          )}
        >
          {label}
        </span>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className={cn(
          "w-[356px] flex-row gap-0 overflow-hidden rounded-xl border border-white/[0.08] bg-popover p-0 shadow-[var(--glass-shadow)] ring-0",
          popoverClassName
        )}
        sideOffset={6}
      >
        <div className="flex-1 p-2.5">
          <CompactCalendar onSelect={updateDate} selected={selectedDate} />
        </div>
        <div className="w-[108px] border-white/[0.06] border-l">
          <TimeSlotList
            onSelect={updateTime}
            selectedHours={selectedDate?.getHours() ?? DEFAULT_HOUR}
            selectedMinutes={selectedDate?.getMinutes() ?? DEFAULT_MINUTE}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
