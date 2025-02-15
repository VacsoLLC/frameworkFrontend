import React from 'react';
import {useBackend, callBackend} from '../lib/usebackend.js';
import {read as HTML} from '../components/fields/html.jsx';
import {Link} from 'react-router-dom';
import {Button} from '../components/ui/button.jsx';
import Related from '../components/related.jsx';
import ActiveViewers from '../components/ActiveViewers.jsx';
import {ChevronRight, ChevronDown} from 'lucide-react';
import CreateRecord from '../components/buttons/createrecord.jsx';
import useQueryState from '../hooks/usequerystate.js';
import {parseAsJson, parseAsString, parseAsInteger} from 'nuqs';
import Tree from '../components/pageTree.jsx';

export default function Pages({db, table}) {
  const [tableName, setTableName] = useQueryState(
    'tableName',
    parseAsString.withDefault(location?.state?.tableHeader || 'Pages'),
    true,
  );

  const [record, recordLoading] = useBackend({
    packageName: db,
    className: table,
    methodName: 'pagesGet',
    args: {
      parentId: null,
    },
  });

  if (record == null) {
    return <>Loading...</>;
  }

  return (
    <div className="p-2">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{tableName}</h2>
        <CreateRecord db={db} table={table} header="Create Page" />
      </div>

      <Tree db={db} table={table} parentId={null} />
    </div>
  );
}
