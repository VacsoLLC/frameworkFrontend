import {useEffect, useState} from 'react';
import Form from './form.jsx';
import useUserStore from '../stores/user.js';
import {useNavigate} from 'react-router-dom';
import {unFormatDateTime} from './util.js';
import {callBackend} from '../lib/usebackend.js';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog.jsx';
import {Button} from './ui/button.jsx';
import {CloudCog, Loader2} from 'lucide-react';

export default function ActionModal({
  show,
  onClose,
  button,
  db,
  table,
  recordId,
  reload,
  forceReload,
  recordFormData,
  columns,
  afterSubmit,
  beforeSubmit,
  ...props
}) {
  const toast = useUserStore((state) => state.toast);
  const [showDialog, setShowDialog] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show && !button.inputs && !button.verify) {
      onSubmit();
    } else if (show) {
      setShowDialog(true);
      setFormData({}); // Reset form data when dialog opens
    } else {
      setShowDialog(false);
    }
  }, [show]);

  const closeDialog = async () => {
    setShowDialog(false);
    if (onClose) {
      await onClose();
    }
  };

  const handleChange = (columnId, value) => {
    setFormData((prev) => ({...prev, [columnId]: value}));
  };

  const onSubmit = async () => {
    if (button.noOp) {
      if (button.close) {
        await closeDialog();
        navigate(-1);
      }
    } else {
      try {
        beforeSubmit && beforeSubmit();
        setLoading(true);
        for (const column in columns) {
          if (columns[column].columnType == 'datetime') {
            if (recordFormData && recordFormData[column]) {
              recordFormData[column] = unFormatDateTime(recordFormData[column]); // TODO: get rid of this. may not actually be needed
            }
          }
        }

        const response = await callBackend({
          packageName: db,
          className: table,
          methodName: button.id,
          recordId,
          args: {...formData, data: recordFormData},
          supressDialog: false,
        });

        if (button.showSuccess) {
          toast({
            severity: 'success',
            summary: 'Success',
            detail: `${button.label || 'Action'} completed successfully`,
            life: 3000,
          });
        }

        await closeDialog();

        if (response?.navigate) {
          navigate(response?.navigate);
        } else if (button.close) {
          navigate(-1);
        } else {
          await forceReload();
        }
      } catch (error) {
        console.error('Error in button action:', error);
        toast({
          severity: 'error',
          summary: 'Error',
          detail: `An error occurred: ${error.message}`,
          life: 5000,
        });
      } finally {
        afterSubmit && afterSubmit();
        setLoading(false);
      }
    }
  };
  console.log('button', button);
  return (
    <Dialog open={showDialog} onOpenChange={() => closeDialog()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{button.label}</DialogTitle>
        </DialogHeader>
        {button.verify && (
          <>
            {button.verify}
            <br />
            <br />
          </>
        )}
        {(button.verify || button.inputs) && (
          <>
            <Form
              schema={button.inputs}
              formData={formData}
              handleChange={handleChange}
            >
              <div className="field grid" key="submitbutton">
                <div
                  className="col-fixed mb-2 md:mb-0 nowrap align-content-end formLabel"
                  style={{width: '200px'}}
                ></div>
                <div className="flex items-center">
                  <Button onClick={onSubmit} disabled={loading}>
                    {loading && <Loader2 className="animate-spin" />}
                    {button.label}
                  </Button>
                  <Button
                    onClick={closeDialog}
                    variant="secondary"
                    className="ml-2"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
