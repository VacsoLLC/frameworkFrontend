import {Textarea} from '../ui/textarea';

export function edit({
  columnId,
  settings,
  dropdownOptions,
  value,
  handleChange,
  ...extraProps
}) {
  return (
    <Textarea
      id={columnId}
      name={columnId}
      placeholder={settings.helpText}
      onChange={(e) => handleChange(columnId, e.target.value)}
      value={value || ''}
      key={columnId}
      style={{height: '100px'}}
      {...extraProps}
    />
  );
}

export function read({value}) {
  return <pre>{value}</pre>;
}
