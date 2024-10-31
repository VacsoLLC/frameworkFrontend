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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

import {useBackend, callBackend} from '../../lib/usebackend.js';
import {Button} from '../ui/button.jsx';
import {CloudCog, ExternalLink} from 'lucide-react';

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

      response.data.rows.push({id: null, name: 'None'});

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
  console.log(value, columnId);
  console.log(dropdownOptions, columnId);
  return (
    <>
      <Select
        value={value?.toString()}
        onValueChange={(e) => {
          console.log(e);
          handleChange(columnId, e);
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
              <SelectItem
                value={`${item.id}`}
                key={item[settings.friendlyColumnName]}
              >
                {item[settings.friendlyColumnName]}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </>
  );
}
