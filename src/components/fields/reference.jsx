import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';

import CreateRecord from '../buttons/createrecord.jsx';

import { useBackend, callBackend } from '../../lib/usebackend.js';

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
          queryModifierArgs: { settings, value },
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      response.data.rows.push({ id: null, name: 'None' });

      return response.data.rows;
    } catch (err) {
      console.error('Error fetching dropdown options:', err);
    }
  }
}

export function edit({ columnId, settings, value, handleChange, ...props }) {
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

  return (
    <>
      <Dropdown
        id={columnId}
        value={value}
        onChange={(e) => {
          handleChange(columnId, e.value);
        }}
        optionLabel={settings.friendlyColumnName}
        optionValue="id"
        options={dropdownOptions}
        className="w-full md:w-14rem"
        size={settings.fieldWidth}
        key={columnId}
        filter={filter}
      />
      <Button
        icon="pi pi-external-link"
        className="ml-1"
        onClick={() => {
          navigate(`/${settings.joinDb}/${settings.join}/${value}`);
        }}
        tooltip="View related record"
        key="viewRelatedRecord"
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
        />
      )}
    </>
  );
}
