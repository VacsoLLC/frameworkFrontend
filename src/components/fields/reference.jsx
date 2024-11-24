import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';

import RecordPreview from '../recordpreview.jsx';

import CreateRecord from '../buttons/createrecord.jsx';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

import {Button} from '../ui/button.jsx';

import {X} from 'lucide-react';

import {Popover, PopoverContent, PopoverTrigger} from '../ui/popover';

import {useBackend, callBackend} from '../../lib/usebackend.js';
import IconButton from '../buttons/iconbutton.jsx';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip.jsx';
import IconButtonWithoutTooltip from '../buttons/iconbuttonwithouttooltip.jsx';

async function getDropDownOptions(settings, value) {
  if (settings.join) {
    try {
      const response = await callBackend({
        packageName: settings.joinDb,
        className: settings.join,
        methodName: 'rowsGet',
        args: {
          columns: ['id', settings.friendlyColumnName],
          queryModifier: settings.queryModifier,
          queryModifierArgs: {settings, value},
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      response.data.rows.push({id: 'null', name: 'None'});

      return response.data.rows;
    } catch (err) {
      console.error('Error fetching dropdown options:', err);
    }
  }
}

export function edit({columnId, settings, value, handleChange, ...props}) {
  const navigate = useNavigate();
  const [dropdownOptions, setDropdownOptions] = useState([]);
  const [reload, setReload] = useState(1);
  console.log(`${columnId}: ${value} ${typeof value}`, dropdownOptions);

  const forceReload = () => {
    setReload((prev) => prev + 1);
  };

  useEffect(() => {
    async function pull() {
      const options = await getDropDownOptions(settings, value);
      setDropdownOptions(options);
    }

    pull();
  }, [columnId, settings, reload, value]);

  const [open, setOpen] = useState(false);

  let filter = false;
  if (dropdownOptions && dropdownOptions.length > 10) {
    filter = true;
  }

  if (!dropdownOptions || dropdownOptions.length === 0) {
    console.log(props);
    return <div>Loading...</div>;
  }

  return (
    <>
      <Select
        value={value?.toString()} // shadcn can only deal with strings. https://github.com/shadcn-ui/ui/issues/772
        onValueChange={(e) => {
          if (e == '') {
            // if '', its an erronious update. I'm probably doing someting wrong, but for the life of me I can't figure out what.
            return;
          }

          if (e == 'null') {
            handleChange(columnId, null);
          } else {
            handleChange(columnId, e);
          }
        }}
        // size={settings.fieldWidth}
        key={columnId}
        placeholder={settings.friendlyColumnName}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {dropdownOptions.map((item) => (
              <SelectItem value={`${item.id}`} key={item.id}>
                {item[settings.friendlyColumnName]}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <TooltipProvider>
        <Tooltip>
          <Popover open={open} onOpenChange={setOpen}>
            <TooltipTrigger asChild>
              <PopoverTrigger>
                <IconButtonWithoutTooltip
                  icon="Info"
                  onClick={() => setOpen((prev) => !prev)}
                  disabled={!value}
                  className="ml-1"
                />
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p> Preview referenced record.</p>
            </TooltipContent>
            <PopoverContent className="w-160 p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-lg pr-6">
                  Referenced Record Preview
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className=" top-2 h-6 w-6 rounded-full"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </div>
              <RecordPreview
                db={settings.joinDb}
                table={settings.join}
                recordId={parseInt(value)}
                reload={reload}
                forceReload={forceReload}
                showHeader={true}
              />
            </PopoverContent>
          </Popover>
        </Tooltip>
      </TooltipProvider>

      <GoToReference
        db={settings.joinDb}
        table={settings.join}
        recordId={value}
      />

      {settings.referenceCreate && (
        <CreateRecord
          db={settings.joinDb}
          table={settings.join}
          onClose={async (id) => {
            if (id) {
              forceReload();
              handleChange(columnId, id);
            }
          }}
          closeOnCreate={true}
          header="Create Related Record"
          className="ml-1"
        />
      )}
    </>
  );
}

function GoToReference({db, table, recordId}) {
  const navigate = useNavigate();

  return (
    <IconButton
      icon="SquareArrowOutUpRight"
      tooltip={`Go to referenced record. DB: ${db} Table: ${table} Record: ${recordId}`}
      onClick={() => navigate(`/${db}/${table}/${recordId}`)}
    />
  );
}

export function preview({valueFriendly, value, settings, ...props}) {
  return (
    <>
      {valueFriendly}

      <GoToReference
        db={settings.joinDb}
        table={settings.join}
        recordId={value}
      />
    </>
  );
}
