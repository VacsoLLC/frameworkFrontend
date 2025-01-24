import {AlertTriangle} from 'lucide-react';
import {Alert, AlertDescription, AlertTitle} from './ui/alert';

export default function AlertBar({title, message}) {
  return (
    <div class="w-full p-2">
      <Alert variant="destructive" className="">
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    </div>
  );
}
