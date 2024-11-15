import {Send} from 'lucide-react';
import {Input} from '../ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import {Button} from '../ui/button';

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
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button asChild>
              <a href={`mailto:${value}`}>
                <Send size={14} />
              </a>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Send email</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
}

export function read({value}) {
  return value;
}
