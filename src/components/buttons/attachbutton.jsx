// src/components/AttachmentUploader.jsx

import React, {useState} from 'react';
import {api} from '../../lib/usebackend.js';
import useUserStore from '../../stores/user.js';
import {Button} from '../ui/button.jsx';
import {Loader2, Upload} from 'lucide-react';

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
}) {
  const toast = useUserStore((state) => state.toast);
  const uploadRef = React.useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleButtonClick = () => {
    uploadRef.current?.click();
  };
  /**
   * Handles multiple file uploads
   * @param {Object} event - The upload event object
   */
  const uploadHandler = async (event) => {
    try {
      setUploading(true);
      const files = Array.from(event.target.files);
      const formData = new FormData();

      files.forEach((file, index) => {
        formData.append(`file${index}`, file);
      });

      formData.append('db', db);
      formData.append('table', table);
      formData.append('row', recordId);

      const response = await api.uploadFiles(
        '/api/core/attachment/upload',
        formData,
      );

      if (response.ok) {
        toast({
          severity: 'success',
          summary: 'Success',
          detail: `${files.length} file(s) uploaded successfully`,
          life: 3000,
        });
        if (onUploadComplete) {
          onUploadComplete();
        }
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
      if (uploadRef.current) uploadRef.current.value = '';
      setUploading(false);
    }
  };

  return (
    <div className="grid max-w-sm items-center gap-1.5">
      <input
        type="file"
        ref={uploadRef}
        onChange={uploadHandler}
        className="hidden"
        multiple
      />
      <Button onClick={handleButtonClick} disabled={uploading}>
        {uploading ? (
          <>
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-6 w-6" />
            Upload Files
          </>
        )}
      </Button>
    </div>
  );
}
