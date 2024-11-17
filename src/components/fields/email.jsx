import {Input} from '../ui/input';

import IconButton from '../buttons/iconbutton.jsx';

export function edit({
  columnId,
  settings,
  dropdownOptions,
  value,
  handleChange,
}) {
  return (
    <>
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
      <IconButton
        icon="Send"
        tooltip="Send email"
        onClick={(e) => {
          e.preventDefault();
          window.location.href = `mailto:${value}`;
        }}
      />
    </>
  );
}

export function read({value}) {
  return value;
}
