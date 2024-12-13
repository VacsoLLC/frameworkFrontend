import {Info} from 'lucide-react';
import {api} from '../../lib/usebackend';
import FilePreview from '../FilePreview';
import {Popover} from '../ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

export function read(props) {
  const {
    value,
    record: {id, image},
  } = props;
  if (image) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <FilePreview
              onButtonClick={() => {}}
              value={{fileName: value, recordId: id, isImage: image}}
              hideNameAndDownload
              showFullScreenButton={false}
            />
          </TooltipTrigger>
          <TooltipContent side="bottom" align="center">
            <pre>{value}</pre>p
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  return (
    <div className="flex">
      <pre>{value}</pre>
    </div>
  );
}

export function edit({formData, value, recordId, record}) {
  return (
    <FilePreview
      onButtonClick={(e) => {
        e.preventDefault();
        api.downloadFile(`/api/core/attachment/download/${recordId}`, value);
      }}
      value={{fileName: value, recordId, isImage: record?.data?.image}}
      fileType={'image'}
    />
  );
}
