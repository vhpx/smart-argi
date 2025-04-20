'use client';

import { Button } from '@tuturuuu/ui/button';
import { Calendar } from '@tuturuuu/ui/calendar';
import { Calendar as CalendarIcon } from '@tuturuuu/ui/icons';
import { Popover, PopoverContent, PopoverTrigger } from '@tuturuuu/ui/popover';
import { cn } from '@tuturuuu/utils/format';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';

interface Props {
  defaultValue?: Date;
  value?: Date | null;
  onValueChange?: (date?: Date) => void;
  className?: string;
}

export function DatePicker({
  defaultValue,
  value,
  onValueChange,
  className,
}: Props) {
  const [date, setDate] = useState<Date | null | undefined>(defaultValue);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setDate(value);
  }, [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-[280px] justify-start text-left font-normal',
            !date && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, 'PPP') : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date || undefined}
          onSelect={(date) => {
            setDate(date);
            onValueChange?.(date);
          }}
          onSubmit={(date) => {
            setDate(date);
            onValueChange?.(date);
            setOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
