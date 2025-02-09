// src/components/AttachmentUploader.jsx

import React, {useState} from 'react';
import {api} from '../../lib/usebackend.js';
import useUserStore from '../../stores/user.js';
import {Button} from '../ui/button.jsx';
import {Loader2, Upload} from 'lucide-react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip.jsx';

/**
 * AttachmentUploader component for handling file uploads
 * @param {Object} props - Component props
 * @param {string} props.db - Database name
 * @param {string} props.table - Table name
 * @param {string} props.recordId - Record ID
 * @param {Function} props.onUploadComplete - Callback function to be called after successful upload
 */
export default function AttachmentUploader({
  db,
  table,
  recordId,
  onUploadComplete,
  disabled,
  label = 'Attach Files',
}) {
  const uploadRef = React.useRef(null);
  const [uploading, setUploading] = useState(false);

  React.useEffect(() => {
    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {

        uploadHandler(
          e.dataTransfer.files,
          db,
          table,
          recordId,
          onUploadComplete,
          setUploading,
        );

        e.dataTransfer.clearData();
      }
    };

    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);

    return () => {
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('drop', handleDrop);
    };
  }, []);

  const handleButtonClick = () => {
    uploadRef.current?.click();
  };
  /**
   * Handles multiple file uploads
   * @param {Object} event - The upload event object
   */

  return (
    <>
      <input
        type="file"
        ref={uploadRef}
        onChange={(e) =>
          uploadHandler(
            e.target.files,
            db,
            table,
            recordId,
            onUploadComplete,
            setUploading,
          )
        }
        className="hidden"
        multiple
      />

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger as="span" tabIndex={0}>
            <Button
              onClick={handleButtonClick}
              disabled={uploading || disabled}
              size="sm"
              className={`mr-1 mb-1`}
            >
              {uploading ? (
                <>
                  <Loader2 size={16} className="mr-2 h-6 w-6 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={16} className="mr-2" />
                  {label}
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Attach a file to this record.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
}

export async function uploadHandler(
  files = [],
  db,
  table,
  recordId,
  onUploadComplete = () => {},
  setUploading = () => {},
) {
  const toast = useUserStore.getState().toast;

  try {
    setUploading(true);
    const filesArray = Array.from(files);
    const formData = new FormData();

    formData.append('db', db);
    formData.append('table', table);
    formData.append('row', recordId);

    filesArray.forEach((file, index) => {
      formData.append(`file${index}`, file);
    });

    const response = await api.uploadFiles(
      '/api/core/attachment/upload',
      formData,
    );

    if (response.ok) {
      toast({
        severity: 'success',
        summary: 'Success',
        detail: `${filesArray.length} file(s) uploaded successfully`,
        life: 3000,
      });
      onUploadComplete();
      return response;
    } else {
      throw new Error('File upload failed');
    }
  } catch (error) {
    console.error('Error uploading files:', error);
    toast({
      severity: 'error',
      summary: 'Error',
      detail: `An error occurred while uploading files: ${error.message}`,
      life: 5000,
    });
  } finally {
    //if (uploadRef.current) uploadRef.current.value = '';
    setUploading(false);
  }
}
