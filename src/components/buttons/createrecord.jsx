import {useState} from 'react';

import CreateRecord from '../record.jsx';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip.jsx';
import {Button} from '../ui/button.jsx';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog.jsx';
import {Plus} from 'lucide-react';

export default function AddRecordButton({
  db,
  table,
  onClose,
  closeOnCreate,
  header = 'Create Record',
  disabled = false,
  where,
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
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              onClick={() => {
                openDialog();
              }}
              disabled={disabled}
              className={disabled ? 'hidden' : ''}
              key="viewRelatedRecord"
            >
              <Plus />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Create record</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Dialog
        open={showDialog}
        onOpenChange={closeDialog}
        style={{width: '50vw'}}
      >
        <DialogContent>
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
