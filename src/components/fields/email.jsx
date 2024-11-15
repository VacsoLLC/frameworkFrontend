import {Send} from 'lucide-react';
import {Input} from '../ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

export function edit({
  columnId,
  settings,
  dropdownOptions,
  value,
  handleChange,
}) {
  return (
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
  );
}

export function read({value}) {
  return (
    <div className="flex items-center gap-2">
      {/* <a href={`tel:${value}`} onKeyDown={(e) => e.preventDefault()}>
        {value}
      </a> */}
      {value}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <a href={`mailto:${value}`} onKeyDown={(e) => e.preventDefault()}>
              <Send size={14} />
            </a>
          </TooltipTrigger>
          <TooltipContent>
            <p>Send email</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
