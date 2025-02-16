import {useEffect, useState} from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {set} from 'lodash';

const hours = Array.from({length: 12}, (_, i) => ({
  value: i + 1,
  label: (i + 1).toString().padStart(2, '0'),
}));
const minutes = Array.from({length: 60}, (_, i) => ({
  value: i,
  label: i.toString().padStart(2, '0'),
}));
export default function TimePicker({
  selectedHour,
  selectedMinute,
  selectedAmPm,
  onChange,
}) {
  const [hour, setHour] = useState(
    selectedHour === 0
      ? 12
      : selectedHour > 12
        ? selectedHour % 12
        : selectedHour,
  );
  const [minute, setMinute] = useState(selectedMinute);
  const [amPm, setAmPm] = useState(selectedAmPm);

  const handleValueChange = (h, m, a) => {
    if (a === 'AM' && h === 12) {
      onChange(0, m);
    } else if (a === 'PM' && h !== 12) {
      onChange(h + 12, m);
    } else {
      onChange(h, m);
    }
  };
  useEffect(() => {
    handleValueChange(hour, minute, amPm);
  }, [hour, minute, amPm]);

  return (
    <div className="flex items-center space-x-2">
      <Select value={hour} onValueChange={(v) => setHour(v)}>
        <SelectTrigger className="w-[70px]">
          <SelectValue placeholder="Hour" />
        </SelectTrigger>
        <SelectContent>
          {hours.map((h) => (
            <SelectItem key={h.value} value={h.value}>
              {h.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-2xl self-center">:</span>
      <Select value={minute} onValueChange={(v) => setMinute(v)}>
        <SelectTrigger className="w-[70px]">
          <SelectValue placeholder="Minute" />
        </SelectTrigger>
        <SelectContent>
          {minutes.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={amPm}
        onValueChange={(v) => {
          console.log(v);
          setAmPm(v);
        }}
      >
        <SelectTrigger className="w-[70px]">
          <SelectValue placeholder="AM/PM" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="AM">AM</SelectItem>
          <SelectItem value="PM">PM</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
