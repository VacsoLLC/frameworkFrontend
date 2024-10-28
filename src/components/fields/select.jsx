import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
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
}
