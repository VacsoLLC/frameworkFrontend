// this is not used and should probably be removed.

export function edit({
  columnId,
  settings,
  dropdownOptions,

  value,
  handleChange,
}) {
  return (
    <InputText
      id={columnId}
      name={columnId}
      placeholder={settings.helpText}
      onChange={(e) => handleChange(columnId, e.target.value)}
      value={value || ''}
      size={settings.fieldWidth}
      key={columnId}
    />
  );
}

export function read({valueFriendly}) {
  return valueFriendly;
}

export function preview({valueFriendly}) {
  return valueFriendly;
}
export function filter() {
  return null;
}

filter.showFilterMenu = true;
filter.showClearButton = true;
