import React from 'react';
import CustomIcon from '../CustomIcon.jsx';
import {Button} from '../ui/button.jsx';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip.jsx';

export default function IconButton({
  icon,
  tooltip,
  onClick,
  disabled = false,
  className,
  ...props
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span tabIndex={0}>
            <Button
              size="sm"
              onClick={onClick}
              disabled={disabled}
              type="button"
              //className={disabled ? 'hidden ' : '' + className}
              className={className}
              {...props}
            >
              <CustomIcon name={icon} />
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
