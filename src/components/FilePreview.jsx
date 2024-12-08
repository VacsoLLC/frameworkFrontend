import React, {useEffect, useState} from 'react';
import {useRef} from 'react';
import {Card, CardContent, CardFooter} from './ui/card';
import {Download, Loader2, Maximize2Icon} from 'lucide-react';
import {Button} from './ui/button';
import {api} from '../lib/usebackend';
import {Dialog, DialogContent, DialogTrigger} from './ui/dialog';

const NoPreview = () => {
  return <div className="flex justify-center p-2">No preview</div>;
};

const FilePreview = ({
  value,
  className,
  onButtonClick,
  fileType,
  showFullScreenButton = true,
  hideNameAndDownload = false,
}) => {
  const imageRef = useRef();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const {fileName, recordId, isImage} = value;

  const noPreviewAvailable =
    !isImage && !['pdf'].includes(fileName?.split('.').pop());
  useEffect(() => {
    const fetcher = async () => {
      setLoading(true);
      const url = await api.getWindowUrl(
        `/api/core/attachment/download/${recordId}`,
        fileName,
      );
      setImageUrl(url);
      imageRef?.current?.setAttribute('src', url);
      setLoading(false);
    };
    fetcher();
  }, []);

  const renderPreview = () => {
    if (isImage) {
      return (
        <img
          src={imageUrl}
          alt={fileName}
          className="w-full h-auto object-contain"
          style={{maxHeight: '300px'}}
        />
      );
    }
    const fileTy = fileName?.split('.').pop();
    if (fileTy === 'pdf') {
      return (
        <iframe
          itemType="pdf"
          src={imageUrl}
          title={fileName}
          className="w-full h-[300px] border-none"
        />
      );
    }
    return <NoPreview />;
  };

  const renderFullScreenPreview = () => {
    if (isImage) {
      return (
        <img
          src={imageUrl}
          alt={fileName}
          className="max-w-full max-h-full object-contain"
        />
      );
    }
    const fileTy = fileName?.split('.').pop();
    if (fileTy === 'pdf') {
      return (
        <iframe
          itemType="pdf"
          src={imageUrl}
          title={fileName}
          className="w-full h-full border-none"
        />
      );
    }
    return <NoPreview />;
  };

  return (
    <Card className="w-[450px]">
      <CardContent className="p-4">
        <div className="relative bg-muted rounded-md overflow-hidden">
          {loading && (
            <>
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-16 w-16 text-muted-foreground animate-spin" />
              </div>
            </>
          )}
          {!loading && (
            <>
              {renderPreview()}
              {!noPreviewAvailable && showFullScreenButton && (
                <Dialog open={isFullScreen} onOpenChange={setIsFullScreen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration"
                    >
                      <Maximize2Icon className="h-2 w-2" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-full h-full flex items-center justify-center">
                    {renderFullScreenPreview()}
                  </DialogContent>
                </Dialog>
              )}
            </>
          )}
        </div>
      </CardContent>
      {!hideNameAndDownload && (
        <CardFooter className="flex items-center justify-between">
          <p className="text-sm font-medium truncate flex-grow mr-2">
            {fileName}
          </p>
          <Button onClick={onButtonClick}>
            <Download size={16} />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default FilePreview;
