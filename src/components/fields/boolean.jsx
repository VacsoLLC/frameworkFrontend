import {Checkbox} from '../ui/checkbox';
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from '../ui/select';

export function edit({
  columnId,
  settings,
  dropdownOptions,
  value,
  handleChange,
  ...extraProps
}) {
  return (
    <Checkbox
      id={columnId}
      name={columnId}
      onCheckedChange={(checked) => {
        handleChange(columnId, checked ? 1 : 0);
      }}
      checked={value ? true : false}
      {...extraProps}
    />
  );
}

export function read(props) {
  return <>{props.value ? 'Yes' : 'No'}</>;
}

export function filter({column, value, onChange, label, ...props}) {
  return (
    <Select
      value={value}
      onValueChange={(val) => {
        onChange(column, val, 'equals');
      }}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="" />
      </SelectTrigger>
      <SelectContent>
        {[
          {label: 'Yes', value: '1'},
          {label: 'No', value: '0'},
        ].map((item) => {
          return <SelectItem value={item.value}>{item.label}</SelectItem>;
        })}
      </SelectContent>
    </Select>
  );
}

filter.showFilterMenu = false;
filter.showClearButton = false;
