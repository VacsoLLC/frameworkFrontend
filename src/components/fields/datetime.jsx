import {useEffect, useRef, useState} from 'react';
import {CalendarIcon, ClockIcon} from 'lucide-react';

import {cn} from '../../lib/utils';
import {Button} from '../ui/button';
import {Calendar} from '../ui/calendar';
import {Popover, PopoverContent, PopoverTrigger} from '../ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {formatDateTime as customFormat} from '../util';

export function read({value}) {
  return customFormat(value);
}

function parseDateTime(dateTimeString) {
  const date = new Date(dateTimeString);
  return isNaN(date.getTime()) ? undefined : date;
}

function formatDateTime(date) {
  if (!date) return '';
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function edit({value, handleChange, columnId}) {
  const [date, setDate] = useState(value ? new Date(value) : '');
  const inputRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setDate(value ? new Date(value) : '');
  }, [value]);

  const handleDateSelect = (newDate) => {
    if (newDate && date) {
      newDate.setHours(date.getHours(), date.getMinutes());
    }
    updateDateTime(newDate);
  };

  const handleHourChange = (hour) => {
    const newDateTime = new Date(date || new Date());
    newDateTime.setHours(Number.parseInt(hour));
    updateDateTime(newDateTime);
  };

  const handleMinuteChange = (minute) => {
    const newDateTime = new Date(date || new Date());
    newDateTime.setMinutes(Number.parseInt(minute));
    updateDateTime(newDateTime);
  };
  const handleInputChange = (e) => {
    const newDate = parseDateTime(e.target.value);
    if (newDate) {
      updateDateTime(newDate);
    }
  };

  const handleInputBlur = () => {
    if (inputRef.current) {
      inputRef.current.value = formatDateTime(date);
    }
  };

  const handleAmPmChange = (ampm) => {
    const newDateTime = new Date(date || new Date());
    const hours = newDateTime.getHours();
    if (ampm === 'PM' && hours < 12) {
      newDateTime.setHours(hours + 12);
    } else if (ampm === 'AM' && hours >= 12) {
      newDateTime.setHours(hours - 12);
    }
    updateDateTime(newDateTime);
  };

  const updateDateTime = (newDateTime) => {
    setDate(newDateTime);
    handleChange(columnId, newDateTime ? newDateTime.toISOString() : null);
  };
  const hours = Array.from({length: 12}, (_, i) =>
    i === 0 ? '12' : i.toString().padStart(2, '0'),
  );
  const minutes = Array.from({length: 60}, (_, i) =>
    i.toString().padStart(2, '0'),
  );

  const getAmPm = (date) => {
    if (!date) return 'AM';
    return date.getHours() >= 12 ? 'PM' : 'AM';
  };

  const get12Hour = (date) => {
    if (!date) return '12';
    const hours = date.getHours() % 12;
    return hours === 0 ? '12' : hours.toString().padStart(2, '0');
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-[240px] justify-start text-left font-normal',
            !date && 'text-muted-foreground',
          )}
          onClick={() => setIsOpen(true)}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <input
            ref={inputRef}
            type="text"
            defaultValue={formatDateTime(date)}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className="w-full bg-transparent focus:outline-none"
            placeholder="Pick a date and time"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="space-y-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
          />
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <ClockIcon className="h-4 w-4" />
              <Select value={get12Hour(date)} onValueChange={handleHourChange}>
                <SelectTrigger className="w-[70px]">
                  <SelectValue placeholder="HH" />
                </SelectTrigger>
                <SelectContent>
                  {hours.map((hour) => (
                    <SelectItem key={hour} value={hour}>
                      {hour}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span>Hours</span>
            </div>
            <span>:</span>
            <div className="flex items-center space-x-1">
              <Select
                value={
                  date
                    ? date.getMinutes().toString().padStart(2, '0')
                    : undefined
                }
                onValueChange={handleMinuteChange}
              >
                <SelectTrigger className="w-[70px]">
                  <SelectValue placeholder="MM" />
                </SelectTrigger>
                <SelectContent>
                  {minutes.map((minute) => (
                    <SelectItem key={minute} value={minute}>
                      {minute}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span>Minutes</span>
            </div>
            <Select value={getAmPm(date)} onValueChange={handleAmPmChange}>
              <SelectTrigger className="w-[70px]">
                <SelectValue placeholder="AM/PM" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AM">AM</SelectItem>
                <SelectItem value="PM">PM</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

edit.displayName = 'EditDatetime';
read.displayName = 'ReadDatetime';
