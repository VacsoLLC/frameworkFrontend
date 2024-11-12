import {Input} from '../ui/input';

export function edit({
  columnId,
  settings,
  dropdownOptions,
  value,
  handleChange,
}) {
  return (
    <Input
      id={columnId}
      name={columnId}
      type="email"
      placeholder={settings.helpText}
      onChange={(e) => handleChange(columnId, e.target.value)}
      value={value || ''}
      size={settings.fieldWidth}
      key={columnId}
    />
  );
}

export function read({value}) {
  return (
    <a href={`mailto:${value}`} onKeyDown={(e) => e.preventDefault()}>
      {value}
    </a>
  );
}
