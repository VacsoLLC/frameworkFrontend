import React, {useRef, useState} from 'react';
import {format, parse} from 'date-fns';
import {Input} from '../ui/input';
import {Popover, PopoverContent, PopoverTrigger} from '../ui/popover';
import {Button} from '../ui/button';
import {Clock} from 'lucide-react';
import {Calendar} from '../ui/calendar';
import {formatDateTime as customFormat} from '../util';

export const edit = () => {
  const [date, setDate] = useState(new Date());
  const [inputValue, setInputValue] = useState(
    format(new Date(), 'yyyy-MM-dd HH:mm'),
  );
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const inputRef = useRef(null);

  // Handle date change from calendar
  const handleDateChange = (selectedDate) => {
    if (selectedDate) {
      const newDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        date.getHours(),
        date.getMinutes(),
      );
      setDate(newDate);
      setInputValue(format(newDate, 'yyyy-MM-dd HH:mm'));
    }
  };

  // Handle time change from time input
  const handleTimeChange = (e) => {
    const newTime = e.target.value;
    const [hours, minutes] = newTime.split(':');
    const newDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      parseInt(hours),
      parseInt(minutes),
    );
    setDate(newDate);
    setInputValue(format(newDate, 'yyyy-MM-dd HH:mm'));
  };

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Parse the new value and update the date
    const parsedDate = parse(newValue, 'yyyy-MM-dd HH:mm', new Date());
    if (!isNaN(parsedDate)) {
      setDate(parsedDate);
    }
  };

  // Restore cursor position after input change
  const handleInputClick = (e) => {
    const cursorPosition = e.target.selectionStart;
    setTimeout(() => {
      e.target.setSelectionRange(cursorPosition, cursorPosition);
    }, 0);
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onClick={handleInputClick}
        ref={inputRef}
        className="w-64"
      />
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon">
            <Clock className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            defaultMonth={date}
            onSelect={handleDateChange}
            initialFocus
          />
          <div className="p-3 border-t">
            <Input
              type="time"
              value={format(date, 'HH:mm')}
               onChange={handleTimeChange}
              className="w-full"
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export function read({value}) {
  return customFormat(value);
}

edit.displayName = 'EditDatetime';
read.displayName = 'ReadDatetime';
