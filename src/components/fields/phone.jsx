import {Phone, PhoneCall} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

export function read({value}) {
  if (!value) return value;
  return (
    <div className="flex items-center gap-2">
      {/* <a href={`tel:${value}`} onKeyDown={(e) => e.preventDefault()}>
        {value}
      </a> */}
      {value}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <a href={`tel:${value}`} onKeyDown={(e) => {
              e.preventDefault()
              }}>
              <PhoneCall size={14} />
            </a>
          </TooltipTrigger>
          <TooltipContent>
            <p>Call</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
