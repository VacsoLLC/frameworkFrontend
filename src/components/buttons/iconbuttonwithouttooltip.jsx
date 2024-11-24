import React from 'react';
import CustomIcon from '../CustomIcon.jsx';
import {Button} from '../ui/button.jsx';

export default function IconButtonWithoutTooltip({
  icon,
  onClick,
  disabled = false,
  className,
  ...props
}) {
  return (
    <Button
      size="sm"
      onClick={onClick}
      disabled={disabled}
      type="button"
      //className={disabled ? 'hidden ' : '' + className}
      className={className}
    >
      <CustomIcon name={icon} />
    </Button>
  );
}
