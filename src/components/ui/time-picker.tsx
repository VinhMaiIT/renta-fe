'use client';

import { ScrollArea } from './scroll-area';
import { cn } from '../../lib/utils';
import * as React from 'react';

export type TimeValue = {
  hour: string;
  minute: string;
  second: string;
};

export type TimePickerProps = {
  value: TimeValue;
  onChange: (value: TimeValue) => void;
  showSeconds?: boolean;
  className?: string;
};

function TimePicker({ value, onChange, showSeconds = true, className }: TimePickerProps) {
  const hourContainerRef = React.useRef<HTMLDivElement>(null);
  const minuteContainerRef = React.useRef<HTMLDivElement>(null);
  const secondContainerRef = React.useRef<HTMLDivElement>(null);

  const currentHour = parseInt(value.hour, 10) || 0;
  const currentMinute = parseInt(value.minute, 10) || 0;
  const currentSecond = parseInt(value.second, 10) || 0;

  // Generate arrays for hours, minutes, seconds
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const seconds = Array.from({ length: 60 }, (_, i) => i);

  // Scroll to selected value on mount and when value changes
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (hourContainerRef.current) {
        const hourElement = hourContainerRef.current.querySelector(
          `[data-hour="${currentHour}"]`,
        ) as HTMLElement;
        if (hourElement) {
          const viewport = hourContainerRef.current.closest(
            '[data-slot="scroll-area-viewport"]',
          ) as HTMLElement;
          if (viewport) {
            const elementTop = hourElement.offsetTop;
            viewport.scrollTo({ top: elementTop, behavior: 'smooth' });
          }
        }
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [currentHour]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (minuteContainerRef.current) {
        const minuteElement = minuteContainerRef.current.querySelector(
          `[data-minute="${currentMinute}"]`,
        ) as HTMLElement;
        if (minuteElement) {
          const viewport = minuteContainerRef.current.closest(
            '[data-slot="scroll-area-viewport"]',
          ) as HTMLElement;
          if (viewport) {
            const elementTop = minuteElement.offsetTop;
            viewport.scrollTo({ top: elementTop, behavior: 'smooth' });
          }
        }
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [currentMinute]);

  React.useEffect(() => {
    if (!showSeconds) return;
    const timer = setTimeout(() => {
      if (secondContainerRef.current) {
        const secondElement = secondContainerRef.current.querySelector(
          `[data-second="${currentSecond}"]`,
        ) as HTMLElement;
        if (secondElement) {
          const viewport = secondContainerRef.current.closest(
            '[data-slot="scroll-area-viewport"]',
          ) as HTMLElement;
          if (viewport) {
            const elementTop = secondElement.offsetTop;
            viewport.scrollTo({ top: elementTop, behavior: 'smooth' });
          }
        }
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [currentSecond, showSeconds]);

  const handleHourClick = (hour: number) => {
    onChange({
      ...value,
      hour: hour.toString().padStart(2, '0'),
    });
  };

  const handleMinuteClick = (minute: number) => {
    onChange({
      ...value,
      minute: minute.toString().padStart(2, '0'),
    });
  };

  const handleSecondClick = (second: number) => {
    onChange({
      ...value,
      second: second.toString().padStart(2, '0'),
    });
  };

  const displayValue = `${value.hour}:${value.minute}${showSeconds ? `:${value.second}` : ''}`;

  return (
    <div className={cn('flex h-full flex-col border-l', className)}>
      <div className="shrink-0 px-4 py-3 text-center">
        <div className="text-lg font-medium">{displayValue}</div>
      </div>

      {/* Scrollable columns */}
      <div className="flex min-h-0 flex-1 gap-0.5">
        {/* Hours column - first column */}
        <ScrollArea className="w-16 flex-1 overflow-hidden [&>[data-slot=scroll-area-viewport]]:rounded-l-md">
          <div ref={hourContainerRef} className="px-2">
            {hours.map((hour) => (
              <div
                key={hour}
                data-hour={hour}
                onClick={() => handleHourClick(hour)}
                className={cn(
                  'cursor-pointer rounded-md px-2 py-1.5 text-center text-sm transition-colors',
                  currentHour === hour ? 'bg-secondary' : 'hover:bg-accent',
                )}
              >
                {hour.toString().padStart(2, '0')}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Minutes column */}
        <ScrollArea className="w-16 flex-1 [&>[data-slot=scroll-area-viewport]]:overflow-hidden">
          <div ref={minuteContainerRef} className="px-2">
            {minutes.map((minute) => (
              <div
                key={minute}
                data-minute={minute}
                onClick={() => handleMinuteClick(minute)}
                className={cn(
                  'cursor-pointer rounded-md px-2 py-1.5 text-center text-sm transition-colors',
                  currentMinute === minute ? 'bg-secondary' : 'hover:bg-accent',
                )}
              >
                {minute.toString().padStart(2, '0')}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Seconds column - last column */}
        {showSeconds && (
          <ScrollArea className="w-16 flex-1 overflow-hidden [&>[data-slot=scroll-area-viewport]]:rounded-r-md">
            <div ref={secondContainerRef} className="px-2">
              {seconds.map((second) => (
                <div
                  key={second}
                  data-second={second}
                  onClick={() => handleSecondClick(second)}
                  className={cn(
                    'cursor-pointer rounded-md px-2 py-1.5 text-center text-sm transition-colors',
                    currentSecond === second ? 'bg-secondary' : 'hover:bg-accent',
                  )}
                >
                  {second.toString().padStart(2, '0')}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}

export { TimePicker };
