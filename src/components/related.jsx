import React, {useState, useEffect, useRef} from 'react';
import {useBackend} from '../lib/usebackend.js';

import DataTable from './datatable.jsx';
import {Tabs, TabsContent, TabsList, TabsTrigger} from './ui/tabs.jsx';

import {useQueryState} from 'nuqs';

export default function Related({db, table, recordId, reload, forceReload}) {
  const [tables, loading] = useBackend({
    packageName: db,
    className: table,
    methodName: 'childrenGet',
    cache: true,
    filter: (data) => prepTables(data),
    reload,
  });

  const [tableReload, setTableReload] = useState(0);

  const [tabName, setTabName] = useQueryState('tabName');

  const forceTableReload = () => {
    setTableReload((prev) => {
      return prev + 1;
    });
  };

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
      className="m-2 p-0 border rounded-lg border-slate-200"
      value={tabName || defaultTab}
      onValueChange={(value) => {
        console.log('VALUE', value);
        removeUrlParams([
          'sortField',
          'sortOrder',
          'limit',
          'page',
          'limit',
          'filter',
        ]); // Remove table sort params when switching tabs
        setTabName(value);
      }}
    >
      {tables && tables.length > 0 ? (
        <>
          <TabsList className="w-100 m-2">
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
                reload={tableReload}
                forceReload={forceTableReload}
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

function removeUrlParams(paramsToRemove) {
  // Get current URL search params
  const searchParams = new URLSearchParams(window.location.search);

  // Remove each specified parameter
  paramsToRemove.forEach((param) => {
    searchParams.delete(param);
  });

  // Construct new URL
  const newQueryString = searchParams.toString();
  const newUrl =
    window.location.pathname + (newQueryString ? `?${newQueryString}` : '');

  // Update URL without reloading the page
  window.history.replaceState({}, '', newUrl);
}
