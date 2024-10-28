import {Download} from 'lucide-react';
import {api} from '../../lib/usebackend';
import {Button} from '../ui/button';

export function read(...args) {
  return <pre>{args[0].value}</pre>;
}

export function edit({formData, value, recordId}) {
  return (
    <div className="flex align-items-center">
      <span className="mr-2">{value}</span>

      <Button
        onClick={(e) => {
          e.preventDefault();
          api.downloadFile(`/api/core/attachment/download/${recordId}`, value);
        }}
      >
        <Download />
      </Button>
    </div>
  );
}
