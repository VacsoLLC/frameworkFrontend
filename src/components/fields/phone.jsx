import {Phone, PhoneCall} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import {Button} from '../ui/button';
import {Input} from '../ui/input';

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
        type="text"
        placeholder={settings.helpText}
        onChange={(e) => handleChange(columnId, e.target.value)}
        value={value || ''}
        size={settings.fieldWidth}
        key={columnId}
      />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button disabled={!value}>
              <a
                href={`tel:${value}`}
                onKeyDown={(e) => {
                  e.preventDefault();
                }}
              >
                <PhoneCall size={14} />
              </a>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Call</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
}

export function read({value}) {
  return value;
}
