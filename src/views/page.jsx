import React from 'react';
import {useBackend, callBackend} from '../lib/usebackend.js';
import {read as HTML} from '../components/fields/html.jsx';
import {Link} from 'react-router-dom';
import {Button} from '../components/ui/button';
import Related from '../components/related.jsx';
import ActiveViewers from '../components/ActiveViewers.jsx';
import CreateRecord from '../components/buttons/createrecord.jsx';
import Tree from '../components/pageTree.jsx';

export default function Page({db, table, recordId}) {
  const [reload, setReload] = React.useState(0);

  const [record, recordLoading] = useBackend({
    packageName: db,
    className: table,
    methodName: 'recordGet',
    recordId,
  });

  const forceReload = () => {
    setReload((num) => num + 1);
  };

  return (
    <>
      <div className="p-0">
        <div className="mb-4 p-2">
          <div className="flex justify-between items-center pb-2">
            <h1 className="text-5xl font-bold">{record?.data?.title}</h1>
            <div className="flex items-center space-x-1">
              <CreateRecord
                db={db}
                table={table}
                where={[{parent: record?.data?.id}]}
                header="Create child page"
              />
              <Button asChild size="sm">
                <Link to={`/${db}/${table}/${recordId}`}>Edit</Link>
              </Button>
              <ActiveViewers db={db} table={table} recordId={recordId} />
            </div>
          </div>

          <HTML value={record?.data?.body} />

          <div className="pt-4 ">
            <h2 className="text-2xl font-semibold">Child pages</h2>

            <Tree db={db} table={table} parentId={parseInt(recordId)} />
          </div>
        </div>

        <Related
          db={db}
          table={table}
          recordId={parseInt(recordId)}
          reload={reload}
          forceReload={forceReload}
        />
      </div>
    </>
  );
}
