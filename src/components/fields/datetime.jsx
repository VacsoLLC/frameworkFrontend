import {useEffect, useState} from 'react';
import {CalendarIcon} from 'lucide-react';

import {cn} from '../../lib/utils';
import {Button} from '../ui/button';
import {Calendar} from '../ui/calendar';
import {Popover, PopoverContent, PopoverTrigger} from '../ui/popover';
import {formatDateTime} from '../util';

export function read({value}) {
  return formatDateTime(value);
}

export function edit({value, handleChange, columnId}) {
  const [date, setDate] = useState(value ? new Date(value) : '');

  useEffect(() => {
    setDate(value ? new Date(value) : '');
  }, [value]);

  const handleDateSelect = (newDate) => {
    setDate(newDate);
    handleChange(columnId, newDate ? newDate.toISOString() : null);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'justify-start text-left font-normal',
            !date && 'text-muted-foreground',
          )}
        >
          <CalendarIcon size={16} />
          <span className="ml-2">{formatDateTime(date) ?? ''}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          id={columnId}
          name={columnId}
          selected={date}
          onSelect={handleDateSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

edit.displayName = 'EditDatetime';
read.displayName = 'ReadDatetime';
