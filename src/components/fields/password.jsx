import {Input} from '../ui/input';
import z from 'zxcvbn';
import {PasswordStrengthBar} from '../ui/PasswordStrengthBar';

export function edit({
  columnId,
  settings,
  dropdownOptions,
  value,
  handleChange,
}) {
  let passwordStrength = null;
  if (settings.requiresStrengthCheck && value) {
    passwordStrength = z(value ?? '').score;
  }

  const component = (
    <Input
      id={columnId}
      name={columnId}
      placeholder={settings.helpText}
      onChange={(e) => handleChange(columnId, e.target.value)}
      value={value || ''}
      size={settings.fieldWidth}
      key={columnId}
      type="password"
    />
  );
  if (settings.requiresStrengthCheck) {
    return (
      <div className="w-full mb-2">
        {component}
        <PasswordStrengthBar strength={passwordStrength} />
      </div>
    );
  }
  return component;
}
