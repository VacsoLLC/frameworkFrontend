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
  let passwordStrength;
  if (settings.requiresStrengthCheck) {
    passwordStrength = z(value ?? '');
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
        {(value ?? '').length > 0 ? (
          <PasswordStrengthBar strength={passwordStrength.score} />
        ) : (
          <div />
        )}
      </div>
    );
  }
  return component;
}
