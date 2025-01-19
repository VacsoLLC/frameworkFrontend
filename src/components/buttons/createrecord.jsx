import {useState} from 'react';

import CreateRecord from '../record.jsx';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog.jsx';

import IconButton from './iconbutton.jsx';

export default function AddRecordButton({
  db,
  table,
  onClose,
  closeOnCreate,
  header = 'Create Record',
  disabled = false,
  className,
  where,
  ...extraProps
}) {
  const [showDialog, setShowDialog] = useState(false);

  const openDialog = () => setShowDialog(true);
  const closeDialog = (id) => {
    setShowDialog(false);
    if (onClose) {
      onClose(id);
    }
  };

  return (
    <>
      <IconButton
        icon="Plus"
        tooltip={header}
        className={className}
        onClick={() => {
          openDialog();
        }}
        disabled={disabled}
        {...extraProps}
      />

      <Dialog open={showDialog} onOpenChange={closeDialog}>
        <DialogContent className="max-w-[850px] w-[90vw]">
          <DialogHeader>
            <DialogTitle>{header}</DialogTitle>
          </DialogHeader>
          <CreateRecord
            db={db}
            table={table}
            onClose={(id) => {
              closeDialog(id);
            }}
            where={where}
            closeOnCreate={closeOnCreate}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
