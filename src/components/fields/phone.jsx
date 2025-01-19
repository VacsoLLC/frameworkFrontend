import {Input} from '../ui/input';
import IconButton from '../buttons/iconbutton.jsx';

export function edit({
  columnId,
  settings,
  dropdownOptions,
  value,
  handleChange,
  ...extraProps
}) {
  return (
    <>
      <Input
        id={columnId}
        name={columnId}
        type="text"
        placeholder={settings.helpText}
        onChange={(e) => handleChange(columnId, e.target.value)}
        value={value || ''}
        size={settings.fieldWidth}
        key={columnId}
        {...extraProps}
      />
      <DialNumber value={value} />
    </>
  );
}

function DialNumber({value}) {
  if (!value) {
    return null;
  }

  return (
    <IconButton
      icon="PhoneCall"
      tooltip={`Dial ${value}`}
      onClick={(e) => {
        e.preventDefault();
        window.location.href = `tel:${value}`;
      }}
      className="ml-1"
    />
  );
}

export function read({value}) {
  return <>{value}</>;
}

export function preview({value}) {
  return (
    <>
      {value} <DialNumber value={value} />
    </>
  );
}
