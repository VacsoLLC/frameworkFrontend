import React, {useState, useEffect, useRef} from 'react';
import {useBackend} from '../lib/usebackend.js';

import DataTable from './datatable.jsx';
import {Tabs, TabsContent, TabsList, TabsTrigger} from './ui/tabs.jsx';

export default function Related({db, table, recordId, reload, forceReload}) {
  const [tables, loading] = useBackend({
    packageName: db,
    className: table,
    methodName: 'childrenGet',
    cache: true,
    filter: (data) => prepTables(data),
    reload,
  });

  const prepTables = (response) => {
    const tablesTemp = [...response.data]; // copy the cached response since we're going to modify it.

    for (const childTable of tablesTemp) {
      for (const [columna, columnb] of Object.entries(childTable.columnmap)) {
        if (!childTable.where) {
          childTable.where = [];
        }
        let right = '';
        switch (columnb) {
          case 'id':
            right = recordId;
            break;
          case 'db':
            right = db;
            break;
          case 'table':
            right = table;
            break;
          default:
            right = recordId;
            break;
        }

        childTable.where.push({[columna]: right});
      }
    }

    return tablesTemp;
  };

  if (loading) {
    console.log('ASDFASDFASDF', 'LOADING');
    return <></>;
  }

  const getTabKey = (tab) => {
    return `${table}${tab.tabName}${tab.table ?? ''}${
      Object.keys(tab.columnmap)[0]
    }`;
  };

  const defaultTab =
    tables && tables.length > 0 ? getTabKey(tables?.[0]) : null;

  return (
    <Tabs
      defaultValue={defaultTab}
      className="m-4 p-4 border-2 rounded-lg border-slate-200"
    >
      {tables && tables.length > 0 ? (
        <>
          <TabsList className="w-100">
            {tables.map((childTable) => (
              <TabsTrigger
                value={getTabKey(childTable)}
                key={getTabKey(childTable)}
              >
                {childTable.tabName}
              </TabsTrigger>
            ))}
          </TabsList>
          {tables.map((childTable) => (
            <TabsContent
              value={getTabKey(childTable)}
              key={getTabKey(childTable)}
            >
              <DataTable
                db={childTable.db}
                table={childTable.table}
                where={childTable.where}
                closeOnCreate={true}
                reload={reload}
                forceReload={forceReload}
                key={table + childTable.tabName + childTable.table}
                child={true}
              />
            </TabsContent>
          ))}
        </>
      ) : null}
    </Tabs>
  );
}
