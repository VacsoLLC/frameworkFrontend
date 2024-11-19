import {useBackend, callBackend} from '../lib/usebackend.js';

import Fields from '../components/fields/index.jsx';
import {Label} from '../components/ui/label.jsx';

export default function RecordPreview({db, table, recordId, reload = 0}) {
  const [schema, schemaLoading] = useBackend({
    packageName: db,
    className: table,
    methodName: 'schemaGet',
    cache: true,
  });

  const [record, recordLoading] = useBackend({
    packageName: db,
    className: table,
    methodName: 'recordGet',
    recordId,
    reload,
    //skip: newRecord,
  });

  if (!record || !schema) {
    return <></>;
  }

  const renderPreviewField = (columnId, settings) => {
    let Field =
      Fields[settings.fieldType]?.preview ||
      Fields[settings.fieldType]?.read ||
      Fields.string.preview;

    if (settings.join) {
      Field =
        Fields.reference.preview || Fields.reference.read || Fields.string.read;
    }

    return (
      <Field
        columnId={columnId}
        settings={settings}
        value={record.data[columnId]}
        valueFriendly={
          settings.join
            ? record.data[columnId + '_' + settings.friendlyColumnName]
            : record.data[columnId]
        }
        //handleChange={handleChange}
        recordId={recordId}
        //formData={formData}
      />
    );
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-[auto,1fr] gap-x-4 gap-y-1">
      {Object.entries(schema.data.schema).map(([columnId, settings]) => {
        if (
          !settings.hiddenRecord &&
          !settings.primaryKey &&
          record.data[columnId] &&
          !settings.hidden &&
          //!settings.join &&
          settings.table == table
        ) {
          return (
            <>
              <div className="flex items-center justify-end">
                <Label className="text-right font-medium">
                  {settings.friendlyName}
                </Label>
              </div>

              <div className="flex items-center string">
                {renderPreviewField(columnId, settings)} <br />
              </div>
            </>
          );
        }
      })}
    </div>
  );
}
