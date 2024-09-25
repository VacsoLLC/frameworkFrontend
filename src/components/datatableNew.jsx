import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table.jsx";

import { useBackend } from '../lib/usebackend.js';
import './datatable.css';
import fields from './fields';

const defaultLazyState = {
  offset: 0,
  limit: 10,
  page: 1,
  sortField: 'id',
  sortOrder: 1,
  filters: {},
};

const generateLazyWhere = (filters, schema) => {
  const tempWhere = [];
  if (schema?.data?.schema) {
    for (const [key, value] of Object.entries(filters)) {
      if (value.value !== undefined && value.value !== '' && value.value !== null) {
        const columnName = schema.data.schema[key].tableAlias + '.' + schema.data.schema[key].actualColumnName;
        switch (value.matchMode) {
          case 'startsWith':
            tempWhere.push([columnName, 'like', `${value.value}%`]);
            break;
          case 'endsWith':
            tempWhere.push([columnName, 'like', `%${value.value}`]);
            break;
          case 'contains':
            tempWhere.push([columnName, 'like', `%${value.value}%`]);
            break;
          case 'equals':
            tempWhere.push([columnName, '=', value.value]);
            break;
          case 'notEquals':
            tempWhere.push([columnName, '!=', value.value]);
            break;
          default:
            throw new Error('Unknown matchMode');
        }
      }
    }
  }
  return tempWhere;
};

export default function DataTableExtended({
  db,
  table,
  closeOnCreate = false,
  where = [],
  reload,
  forceReload,
  child = false,
}) {
  const navigate = useNavigate();

  const [lazyState, setLazyState] = useState(defaultLazyState);

  const [schema] = useBackend({
    packageName: db,
    className: table,
    methodName: 'schemaGet',
    cache: true,
  });

  const [rowsGetArgs, setRowGetArgs] = useState({
    where: [...where, ...generateLazyWhere(lazyState.filters, schema)],
    sortField: lazyState.sortField,
    sortOrder: lazyState.sortOrder > 0 ? 'DESC' : 'ASC',
    limit: lazyState.limit,
    offset: lazyState.offset,
    returnCount: true,
  });

  const [rows] = useBackend({
    packageName: db,
    className: table,
    methodName: 'rowsGet',
    args: rowsGetArgs,
    reload,
  });

  useEffect(() => {
    setRowGetArgs((prevRowsGetArgs) => ({
      ...prevRowsGetArgs,
      where: [...where, ...generateLazyWhere(lazyState.filters, schema)],
    }));
  }, [where]);

  useEffect(() => {
    if (!schema) return;
    setLazyState((prevLazyState) => ({
      ...prevLazyState,
      filters: Object.keys(schema.data.schema).reduce((acc, key) => {
        acc[key] = { value: '', matchMode: 'contains' };
        return acc;
      }, {}),
    }));
  }, [schema]);

  useEffect(() => {
    setRowGetArgs((prevRowsGetArgs) => ({
      ...prevRowsGetArgs,
      offset: lazyState.offset,
      limit: lazyState.limit,
      sortField: lazyState.sortField,
      sortOrder: lazyState.sortOrder > 0 ? 'DESC' : 'ASC',
      where: [...where, ...generateLazyWhere(lazyState.filters, schema)],
    }));
  }, [lazyState]);

  // const onLazyStateChange = (e) => {
  //   setLazyState((prevLazyState) => ({
  //     ...prevLazyState,
  //     offset: e.first,
  //     limit: e.rows,
  //     sortField: e.sortField,
  //     sortOrder: e.sortOrder,
  //     filters: e.filters,
  //   }));
  // };

  const onFilterElementChange = (columnId, value, matchMode) => {
    setLazyState((prevLazyState) => ({
      ...prevLazyState,
      filters: {
        ...prevLazyState.filters,
        [columnId]: { value, matchMode },
      },
    }));
  };

  // const header = (
  //   <div className="flex flex-wrap items-center justify-between gap-2">
  //     <span className="text-xl font-bold">{location?.state?.tableHeader || schema?.data?.name}</span>
  //     <div>
  //       <CreateRecordButton
  //         db={db}
  //         table={table}
  //         disabled={schema?.data?.readOnly}
  //         header={'Create ' + schema?.data?.name}
  //         onClose={forceReload}
  //         where={child ? where : []}
  //         closeOnCreate={closeOnCreate}
  //       />
  //       <Button onClick={forceReload} className="ml-1">
  //         Refresh
  //       </Button>
  //     </div>
  //   </div>
  // );

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            {Object.entries(schema?.data?.schema || {})
              .sort(([, settingsA], [, settingsB]) => settingsA.order - settingsB.order)
              .map(([columnId, settings]) => {
                if (settings.join || settings.hidden || settings.hiddenList) return null;

                const columnProps = {
                  header: settings.friendlyName,
                };

                if (fields[settings.fieldType]?.filter) {
                  const Filter = fields[settings.fieldType]?.filter;
                  columnProps.filterElement = (
                    <Filter
                      value={lazyState.filters[columnId]?.value || ''}
                      onFilterElementChange={onFilterElementChange}
                      columnId={columnId}
                    />
                  );
                }

                return (
                  <TableCell key={columnId}>
                    {settings.friendlyName}
                    {/* Add Filter logic here */}
                  </TableCell>
                );
              })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {(rows?.data?.rows || []).map((row) => (
            <TableRow key={row.id} onClick={() => navigate(`/${db}/${table}/${row.id}`)}>
              {Object.entries(schema?.data?.schema || {}).map(([columnId, settings]) => {
                if (settings.join || settings.hidden || settings.hiddenList) return null;
                return (
                  <TableCell key={columnId}>
                    {fields[settings.fieldType]?.read
                      ? fields[settings.fieldType].read({ value: row[columnId], settings })
                      : row[columnId]}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
