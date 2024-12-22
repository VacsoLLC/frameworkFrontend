import {useState} from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import {Popover, PopoverContent, PopoverTrigger} from './ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

export default function ActiveViewers({currentViewers}) {
  const [isOpen, setIsOpen] = useState(false);
  const maxDisplayed = 3;

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const getRandomColor = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 70%)`;
  };

  return (
    <TooltipProvider>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button className="flex items-center space-x-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition-colors">
            <div className="flex -space-x-2">
              {currentViewers.slice(0, maxDisplayed).map((viewer) => (
                <Tooltip key={viewer.id}>
                  <TooltipTrigger asChild>
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                      style={{backgroundColor: getRandomColor(viewer.name)}}
                    >
                      {getInitials(viewer.name)}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{viewer.name}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
              {currentViewers.length > maxDisplayed && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 text-gray-600 text-xs font-medium border-2 border-white">
                      +{currentViewers.length - maxDisplayed}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {currentViewers.length - maxDisplayed} more viewer
                      {currentViewers.length - maxDisplayed > 1 ? 's' : ''}
                    </p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Viewing
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0">
          <Card>
            <CardHeader>
              <CardTitle>Current Viewers</CardTitle>
              <CardDescription>
                People viewing this record right now
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {currentViewers.map((viewer) => (
                  <li key={viewer.id} className="flex items-center space-x-4">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium"
                      style={{backgroundColor: getRandomColor(viewer.name)}}
                    >
                      {getInitials(viewer.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {viewer.name}
                      </p>
                      <p className="text-sm text-gray-500">Viewing</p>
                    </div>
                    <div className="inline-flex items-center text-xs font-semibold text-green-500">
                      <span className="relative flex h-3 w-3 mr-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                      </span>
                      Active
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
}
