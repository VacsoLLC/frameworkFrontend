import React, {useEffect, useRef, useState} from 'react';
import {format, parse, parseISO} from 'date-fns';
import {Input} from '../ui/input';
import {Popover, PopoverContent, PopoverTrigger} from '../ui/popover';
import {Button} from '../ui/button';
import {Clock} from 'lucide-react';
import {Calendar} from '../calendar';
import {formatDateTime as customFormat} from '../util';
import TimePicker from '../TimePicker';

export const edit = (props) => {
  const {value, columnId, handleChange} = props;
  if (!value) return null;
  const d = new Date(value);
  const [date, setDate] = useState(d);
  console.log(d, 'date');
  console.log(format(date, 'yyyy-MM-dd hh:mm a'));
  const [inputValue, setInputValue] = useState(
    format(date, 'yyyy-MM-dd hh:mm a'),
  );
  console.log(inputValue, 'inputValue');
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
      setInputValue(format(newDate, 'yyyy-MM-dd hh:mm a'));
    }
  };

  const handleTimeChange = (hours, minutes) => {
    const newDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      parseInt(hours),
      parseInt(minutes),
    );
    setDate(newDate);
    setInputValue(format(newDate, 'yyyy-MM-dd hh:mm a'));
  };

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Parse the new value and update the date
    const parsedDate = parse(newValue, 'yyyy-MM-dd hh:mm a', new Date());
    if (!isNaN(parsedDate)) {
      setDate(parsedDate);
    }
  };

  useEffect(() => {
    handleChange(columnId, date);
  }, [date]);
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
        placeholder="yyyy-MM-dd hh:mm a"
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
            onSelect={handleDateChange}
            initialFocus
          />
          <div className="p-3 border-t">
            <TimePicker
              selectedHour={date.getHours()}
              selectedMinute={date.getMinutes()}
              selectedAmPm={date.getHours() >= 12 ? 'PM' : 'AM'}
              onChange={handleTimeChange}
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
