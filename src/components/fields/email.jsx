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
      <SendEmail value={value} />
    </>
  );
}

function SendEmail({value}) {
  if (!value?.includes('@')) {
    return null;
  }

  return (
    <IconButton
      icon="Send"
      tooltip={`Send email to ${value}`}
      onClick={(e) => {
        e.preventDefault();
        window.location.href = `mailto:${value}`;
      }}
      className="ml-1"
    />
  );
}

export function read({value}) {
  return value;
}

export function preview({value}) {
  return (
    <>
      {value}
      <SendEmail value={value} />
    </>
  );
}
