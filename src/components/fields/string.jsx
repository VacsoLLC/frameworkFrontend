import {Input} from '../ui/input';

export function edit({
  columnId,
  settings,
  dropdownOptions,
  value,
  handleChange,
  ...extraProps
}) {
  return (
    <Input
      id={columnId}
      name={columnId}
      placeholder={settings.helpText}
      onChange={(e) => handleChange(columnId, e.target.value)}
      value={value || ''}
      size={settings.fieldWidth}
      key={columnId}
      {...extraProps}
    />
  );
}

export function read({valueFriendly, value}) {
  return valueFriendly;
}

export function preview({valueFriendly, value}) {
  return valueFriendly;
}
