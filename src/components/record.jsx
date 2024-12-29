import React, {useState, useEffect, useMemo} from 'react';
import {useNavigate} from 'react-router-dom';
import {useBackend, callBackend} from '../lib/usebackend.js';
import useUserStore from '../stores/user.js';
import Form from './form.jsx';
import ActionButton from './buttons/actionbutton.jsx';
import {unFormatDateTime} from './util.js';
import {Button} from './ui/button.jsx';
import {useToast} from '../hooks/use-toast.js';
import {Toaster} from './ui/toaster.jsx';
import ActiveViewers from './ActiveViewers.jsx';

export default function Record({
  db,
  table,
  recordId,
  onClose,
  closeOnCreate = false,
  where = [],
  reload,
  forceReload,
  showHeader = false,
}) {
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});
  const toast = useUserStore((state) => state.toast);
  const [counter, setCounter] = useState(0);
  const {toast: shadToast} = useToast();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userId = useUserStore((state) => state.userId);

  const [schema, schemaLoading] = useBackend({
    packageName: db,
    className: table,
    methodName: 'schemaGet',
    cache: true,
  });

  const newRecord = !recordId;

  const [buttons, buttonsLoading] = useBackend({
    packageName: db,
    className: table,
    methodName: 'actionsGet',
    args: {
      id: recordId,
    },
    reload,
    enabled: !newRecord,
  });

  const [record, recordLoading] = useBackend({
    packageName: db,
    className: table,
    methodName: 'recordGet',
    recordId,
    reload,
    enabled: !newRecord,
  });

  useEffect(() => {
    if (newRecord) {
      // For new records, initialize with default values from schema
      const initialData = {};
      Object.entries(schema?.data?.schema || {}).forEach(
        ([columnId, settings]) => {
          if (settings.defaultValue !== undefined) {
            initialData[columnId] = settings.defaultValue;
          }
        },
      );
      // Apply any pre-filled values from 'where'
      where.forEach((whereClause) => {
        Object.assign(initialData, whereClause);
      });
      setFormData(initialData);
      setLoading(false);
    } else if (record) {
      setFormData(record.data);
      setLoading(false);
    }
  }, [record, schema]);

  useEffect(() => {
    if (newRecord && where.length > 0 && Object.keys(formData).length === 0) {
      const newFormData = {};
      where.forEach((whereClause) => {
        Object.assign(newFormData, whereClause);
      });
      setFormData(newFormData);
    }
  }, [newRecord, where, formData]);

  const handleChange = (columnId, value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [columnId]: value,
    }));
  };

  const handleSubmit = async (params) => {
    setError(null);
    const postData = {...formData};
    Object.entries(schema?.data?.schema || {}).forEach(
      ([columnId, settings]) => {
        if (settings.columnType === 'datetime') {
          postData[columnId] = unFormatDateTime(formData[columnId]); // TODO: get rid of this. may not actually be needed
        }
      },
    );

    try {
      const response = await callBackend({
        packageName: db,
        className: table,
        methodName: 'recordCreate',
        args: {data: postData},
        supressDialog: true,
      });

      if (!response.ok) {
        throw new Error('Server response was not ok');
      }

      if (onClose) {
        onClose(response.data.id);
      }

      shadToast({
        summary: 'Success',
        description: `Record created successfully. ID: ${response.data.id}`,
        life: 3000,
        variant: 'success',
      });

      if (!closeOnCreate) {
        navigate(`/${db}/${table}/${response.data.id}`);
      } else if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error creating record:', error);
      shadToast({
        summary: 'Error',
        description: `An error occurred: ${error.message}`,
        life: 5000,
        variant: 'error',
      });
    }
  };

  const filteredSchema = useMemo(() => {
    if (!schema?.data?.schema) return {};

    return Object.entries(schema.data.schema).reduce(
      (acc, [columnId, settings]) => {
        if (settings.table !== table) return acc;
        if (settings.primaryKey) return acc;
        if (settings.hidden) return acc;
        if (settings.hiddenRecord) return acc;
        if (settings.hiddenCreate && newRecord) return acc;
        if (settings.hiddenUpdate && !newRecord) return acc;
        if (
          where &&
          where.some((obj) => obj.hasOwnProperty(columnId)) &&
          newRecord
        )
          return acc;
        if (newRecord && !settings.createAllowed) return acc;

        acc[columnId] = settings;
        return acc;
      },
      {},
    );
  }, [schema, table, newRecord, where]);

  if (error) return <p>Error: {error}</p>;
  if (!record && (loading || recordLoading || schemaLoading || buttonsLoading))
    return <></>;

  return (
    <div className="m-0">
      <Toaster />
      {showHeader ? (
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold m-2">
            {(newRecord ? 'Create ' : 'Update ') + schema?.data?.name}
          </h2>
          {!newRecord && (
            <ActiveViewers db={db} recordId={recordId} table={table} />
          )}
        </div>
      ) : (
        ''
      )}
      <Form
        schema={filteredSchema}
        formData={formData}
        handleChange={handleChange}
        key={`${db}${table}${recordId}`}
        newRecord={newRecord}
        record={record}
        recordId={recordId}
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        {newRecord && (
          <div>
            <Button
              type="submit"
              onClick={() => handleSubmit({close: false})}
              key="Create"
            >
              Create
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="ml-2"
              key="Cancel"
            >
              Cancel
            </Button>
          </div>
        )}
        <div className="flex flex-wrap">
          {!newRecord &&
            buttons?.data &&
            Object.entries(buttons.data).map(([key, button]) => {
              return (
                <>
                  <ActionButton
                    button={button}
                    key={key}
                    db={db}
                    table={table}
                    recordId={recordId}
                    forceReload={forceReload}
                    reload={reload}
                    formData={formData}
                    columns={schema.data.schema}
                  />
                  {button.newLine && <div className="w-full" />}
                </>
              );
            })}
        </div>
      </Form>
    </div>
  );
}
