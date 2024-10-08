import {Dropdown} from 'primereact/dropdown';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

export function edit({
  columnId,
  settings,
  dropdownOptions,
  value,
  handleChange,
}) {
  return (
    <Select
      value={value}
      onValueChange={(e) => {
        handleChange(columnId, e.value);
      }}
      size={settings.fieldWidth}
      key={columnId}
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {settings.options.map((item) => (
            <SelectItem value={item} key={item}>
              {item}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
  return (
    <Dropdown
      value={value}
      onChange={(e) => {
        handleChange(columnId, e.value);
      }}
      options={settings.options.map((item) => ({
        label: item,
        value: item,
      }))}
      className="w-full md:w-14rem"
      size={settings.fieldWidth}
      key={columnId}
    />
  );
}
