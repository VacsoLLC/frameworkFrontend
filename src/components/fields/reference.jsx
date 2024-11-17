import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';

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

import {useBackend, callBackend} from '../../lib/usebackend.js';
import IconButton from '../buttons/iconbutton.jsx';

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

  let filter = false;
  if (dropdownOptions && dropdownOptions.length > 10) {
    filter = true;
  }

  if (!dropdownOptions || dropdownOptions.length === 0) {
    console.log(props);
    return <div>Loading...</div>;
  }

  const handleClear = () => {
    //setValue('');
  };

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

      <IconButton
        icon="SquareArrowOutUpRight"
        tooltip={`Go to referenced record. DB: ${settings.joinDb} Table: ${settings.join} Record: ${value}`}
        onClick={() =>
          navigate(`/${settings.joinDb}/${settings.join}/${value}`)
        }
        disabled={!value}
        className="ml-1"
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
