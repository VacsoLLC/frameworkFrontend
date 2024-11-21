import {useState} from 'react';
import ActionModal from '../actionmodal.jsx';
import AttachButton from './attachbutton.jsx';
import {Button} from '../ui/button.jsx';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip.jsx';

const COLOR_TO_VARIANT_MAP = {
  primary: 'default',
  secondary: 'secondary',
  success: 'success',
  danger: 'destructive',
  warning: 'warning',
  info: 'info',
  light: 'light',
  dark: 'dark',
};

export default function ActionButton({
  button,
  db,
  table,
  recordId,
  reload,
  forceReload,
  formData,
  columns,
  className = '',
}) {
  const [showModal, setShowModal] = useState(false);

  const onClick = () => {
    setShowModal(true);
  };

  const onClose = () => {
    setShowModal(false);
  };

  if (button.newLine) {
    return <br />;
  }

  if (button.type == 'attach') {
    return (
      <AttachButton
        db={db}
        table={table}
        recordId={recordId}
        onUploadComplete={() => {
          forceReload();
        }}
        disabled={button.disabled ? true : false}
        label={button.label}
      />
    );
  }

  return (
    <>
      <ActionModal
        db={db}
        table={table}
        recordId={recordId}
        show={showModal}
        button={button}
        onClose={onClose}
        reload={reload}
        forceReload={forceReload}
        recordFormData={formData}
        columns={columns}
      />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger as="span" tabIndex={0}>
            <Button
              disabled={button.disabled ? true : false}
              variant={COLOR_TO_VARIANT_MAP[button?.color] ?? 'default'}
              className={`mr-1 mb-1 ${className}`}
              onClick={onClick}
            >
              {button?.label}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{button.disabled || button?.helpText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
}
