import {useState, useEffect, useMemo, useRef} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import CreateRecordButton from './buttons/createrecord.jsx';
import {useBackend} from '../lib/usebackend.js';
import fields from './fields';

import {useQueryState, parseAsJson, parseAsString, parseAsInteger} from 'nuqs';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table.jsx';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu.jsx';
import {Button} from './ui/button.jsx';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsDown,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUp,
  ChevronsUpDown,
  Filter,
  FilterXIcon,
  Loader2,
  ReceiptRussianRuble,
  RefreshCcw,
  X,
} from 'lucide-react';
import {Input} from './ui/input.jsx';
import {debounce, head} from 'lodash';
import {cn} from '../lib/utils.js';

const DEFAULT_LIMIT = 20;

function convertToWhere(filter) {
  let filterWhere = [];

  for (const key in filter) {
    const columnPath = key;
    const value = filter[key].value;
    const matchMode = filter[key].matchMode;

    if (!value) {
      continue;
    }

    let tempFilter = null;
    switch (matchMode) {
      case 'startsWith':
        tempFilter = [columnPath, 'like', `${value}%`];
        break;
      case 'endsWith':
        tempFilter = [columnPath, 'like', `%${value}`];
        break;
      case 'contains':
        tempFilter = [columnPath, 'like', `%${value}%`];
        break;
      case 'notContains':
        tempFilter = [columnPath, 'not like', `%${value}%`];
        break;
      case 'equals':
        tempFilter = [columnPath, '=', value];
        break;
      case 'notEquals':
        tempFilter = [columnPath, '!=', value];
        break;
      default:
        throw new Error('Unknown matchMode');
    }
    filterWhere.push(tempFilter);
  }
  return filterWhere;
}

export default function DataTableExtended({
  db,
  table,
  closeOnCreate = false,
  reload,
  forceReload,
  child = false, // is this a child table?
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const [sortOrder, setSortOrder] = useQueryState(
    'sortOrder',
    parseAsString.withDefault('DESC')
  );

  const [sortField, setSortField] = useQueryState(
    'sortField',
    parseAsString.withDefault('id')
  );
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));

  const [limit, setLimit] = useQueryState(
    'limit',
    parseAsInteger.withDefault(DEFAULT_LIMIT)
  );

  const [schema] = useBackend({
    packageName: db,
    className: table,
    methodName: 'schemaGet',
    cache: true,
  });

  const [tableName, setTableName] = useQueryState(
    'tableName',
    parseAsString.withDefault(
      location?.state?.tableHeader || schema?.data?.name
    )
  );

  const [where, setWhereClause] = useQueryState(
    'where',
    parseAsJson((tmp) => {
      return tmp;
    }).withDefault([])
  );

  const [filter, setFilter] = useQueryState(
    'filter',
    parseAsJson((tmp) => {
      return tmp;
    }).withDefault({})
  );

  const [rows, loading] = useBackend({
    packageName: db,
    className: table,
    methodName: 'rowsGet',
    args: {
      where: [...where, ...convertToWhere(filter)],
      sortField,
      sortOrder,
      limit,
      offset: (page - 1) * limit,
      returnCount: true,
    },
    reload,
  });

  const onFilterElementChange = (columnId, value, matchMode) => {
    console.log('Filter Changed!', columnId, value, matchMode);

    if (!value && !matchMode) {
      setFilter((prev) => {
        const newFilter = {...prev};
        delete newFilter[columnId];
        return newFilter;
      });
      return;
    }

    setFilter((prev) => {
      const newFilter = {...prev};
      newFilter[columnId] = {value, matchMode};
      return newFilter;
    });
  };

  const onSortChange = (field, order) => {
    setSortField(field);
    setSortOrder(order);
  };

  const columns = Object.entries(schema?.data?.schema || {})
    .filter(([columnId, settings]) => {
      if (settings.join || settings.hidden || settings.hiddenList) return;
      return true;
    })
    .sort(([, settingsA], [, settingsB]) => settingsA.order - settingsB.order)
    .map(([columnId, settings]) => ({
      accessorKey: columnId,
      header: ({column}) => {
        const currentSortField = sortField === column.id ? column.id : null;
        const currentSortOrder = currentSortField
          ? sortOrder === 'ASC'
            ? 'ASC'
            : 'DESC'
          : null;
        console.log('tripptest666', currentSortField, currentSortOrder);
        return (
          <div className="flex items-center justify-between p-0">
            <div className="text-black">{settings.friendlyName}</div>
            <Button
              variant={currentSortField ? 'outline' : 'ghost'}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => {
                onSortChange(
                  column.id,
                  currentSortOrder === 'ASC' ? 'DESC' : 'ASC'
                );
              }}
            >
              <span className="sr-only">Open menu</span>
              {currentSortOrder ? (
                currentSortOrder === 'ASC' ? (
                  <ChevronsUp className="h-4 w-4" />
                ) : (
                  <ChevronsDown className="h-4 w-4" />
                )
              ) : (
                <ChevronsUpDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        );
      },
      cell: ({row}) => {
        const value = row.getValue(columnId);
        return fields[settings.fieldType]?.read
          ? fields[settings.fieldType].read({
              value: value,
              valueFriendly: value,
              settings,
            })
          : value;
      },
      enableSorting: true,
      enableColumnFilter: true,
    }));

  const shadTable = useReactTable({
    data: rows?.data?.rows ?? [],
    columns,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  console.log(shadTable);
  const header = (
    <div className="flex flex-wrap align-middle justify-between">
      <div className="flex items-end">
        <span className="text-xl text-900 font-bold ml-1">{tableName}</span>
      </div>

      <div>
        <span className="mr-1">
          <CreateRecordButton
            db={db}
            table={table}
            disabled={schema?.data?.readOnly}
            header={'Create ' + schema?.data?.name}
            onClose={() => {
              forceReload();
            }}
            where={child ? where : []} // we pass in the where clause if this is a child table so we can prefill the foreign keys
            closeOnCreate={closeOnCreate}
          />
        </span>
        <Button size="sm" onClick={() => forceReload()}>
          <RefreshCcw size={16} />
        </Button>
      </div>
    </div>
  );
  const totalPages = Math.ceil((rows?.data?.count ?? 0) / limit);
  const onPageChange = (pageNumber) => {
    setPage(pageNumber);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <Button
          key={i}
          variant={i === page ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onPageChange(i)}
          className="mx-1"
        >
          {i}
        </Button>
      );
    }

    return pageNumbers;
  };

  return (
    <div className="ml-2 mr-2 my-1">
      {header}
      <div className="rounded-md border my-1">
        <Table>
          <TableHeader>
            {shadTable.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="px-2">
                    {header.isPlaceholder
                      ? null
                      : header.column.columnDef.header({
                          column: header.column,
                        })}

                    {header.column.getCanFilter() ? (
                      <HeaderFilter
                        key={header.column.id}
                        column={
                          schema.data.schema[header.column.id].tableAlias +
                          '.' +
                          schema.data.schema[header.column.id].actualColumnName
                        }
                        onChange={onFilterElementChange}
                        value={
                          filter[
                            schema.data.schema[header.column.id].tableAlias +
                              '.' +
                              schema.data.schema[header.column.id]
                                .actualColumnName
                          ]?.value
                        }
                        matchMode={
                          filter[
                            schema.data.schema[header.column.id].tableAlias +
                              '.' +
                              schema.data.schema[header.column.id]
                                .actualColumnName
                          ]?.matchMode
                        }
                      />
                    ) : null}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          {shadTable.getRowModel().rows.length ? (
            <TableBody>
              {shadTable.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() => navigate(`/${db}/${table}/${row.original.id}`)}
                  className="cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <TableCell key={cell.id} className="p-2">
                        {cell.column.columnDef.cell({
                          row: cell.row,
                          getValue: cell.getValue,
                        })}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {loading ? (
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                ) : (
                  'No data found'
                )}
              </TableCell>
            </TableRow>
          )}
        </Table>

        <div className="flex items-center justify-between px-2 py-1">
          <div className="w-1/3" /> {/* Spacer */}
          <div className="flex items-center justify-center space-x-2 w-1/3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onPageChange(1)}
              disabled={page === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {renderPageNumbers()}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onPageChange(totalPages)}
              disabled={page === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="w-1/3 flex justify-end">
            <div className="flex items-center justify-end space-x-2 w-1/3">
              <div className="text-sm mr-1 font-medium">Rows</div>
              <Select
                value={limit.toString()}
                onValueChange={(value) => {
                  setLimit(value);
                }}
              >
                <SelectTrigger className="w-[70px]">
                  <SelectValue placeholder={limit} />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50, 100, 500].map((value) => (
                    <SelectItem key={value} value={value.toString()}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeaderFilter({column, onChange, value = '', matchMode = 'contains'}) {
  return (
    <>
      <div className="flex items-center space-x-2 my-1">
        <Input
          value={value}
          onChange={(e) => {
            onChange(column, e.target.value, matchMode);
          }}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Filter className="h-4 w-4" />
              <span className="sr-only">Open filter menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {[
              'contains',
              'startsWith',
              'endsWith',
              'equals',
              'notEquals',
              'notContains',
            ].map((option) => (
              <DropdownMenuItem
                key={option}
                onSelect={(e) => {
                  onChange(column, value, option);
                }}
                className={`flex items-center justify-between ${
                  option === matchMode ? 'bg-primary/10' : ''
                }`}
              >
                {option}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-8 w-8 p-2 transition-opacity duration-200',
            value || matchMode != 'contains' ? 'opacity-100' : 'opacity-0'
          )}
          onClick={() => {
            onChange(column, '', '');
          }}
        >
          <FilterXIcon className="h-4 w-4" />
          <span className="sr-only">Clear filter</span>
        </Button>
      </div>
    </>
  );
}
