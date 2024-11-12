import {useState, useEffect, useMemo} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import CreateRecordButton from './buttons/createrecord.jsx';
import {useBackend} from '../lib/usebackend.js';
import fields from './fields';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table.jsx';
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
  RefreshCcw,
  X,
} from 'lucide-react';
import {Input} from './ui/input.jsx';
import {debounce, head} from 'lodash';
import {cn} from '../lib/utils.js';

const DEFAULT_LIMIT = 20;

const defaultLazyState = {
  offset: 0,
  limit: DEFAULT_LIMIT,
  page: 1,
  sortField: 'id',
  sortOrder: 1,
  filters: {},
};

// generate a where from the lazyState
const generateLazyWhere = (filters, schema) => {
  const tempWhere = [];

  if (schema && schema.data && schema.data.schema) {
    for (const [key, value] of Object.entries(filters)) {
      if (
        value.value !== undefined &&
        value.value !== '' &&
        value.value !== null
      ) {
        const columnName =
          schema.data.schema[key].tableAlias +
          '.' +
          schema.data.schema[key].actualColumnName;
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
          case 'notContains':
            tempWhere.push([columnName, 'not like', `%${value.value}%`]);
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
  child = false, // is this a child table?
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

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

  const [rows, loading] = useBackend({
    packageName: db,
    className: table,
    methodName: 'rowsGet',
    args: rowsGetArgs,
    reload,
  });

  useEffect(() => {
    setRowGetArgs((prevRowsGetArgs) => {
      return {
        ...prevRowsGetArgs,
        where: [...where, ...generateLazyWhere(lazyState.filters, schema)],
      };
    });
  }, [where]);

  useEffect(() => {
    if (!schema) return;

    setLazyState((prevLazyState) => ({
      ...prevLazyState,
      filters: Object.keys(schema.data.schema).reduce((acc, key) => {
        acc[key] = {value: '', matchMode: 'contains'};
        return acc;
      }, {}),
    }));
  }, [schema]);

  useEffect(() => {
    // update the state for the server call
    const sortOrder = lazyState.sortOrder === 'ASC' ? 1 : -1;
    setRowGetArgs((prevRowsGetArgs) => {
      return {
        ...prevRowsGetArgs,
        offset: lazyState.offset,
        limit: lazyState.limit,
        sortField: lazyState.sortField,
        sortOrder: sortOrder > 0 ? 'ASC' : 'DESC',
        returnCount: true,
        where: [...where, ...generateLazyWhere(lazyState.filters, schema)],
      };
    });
  }, [lazyState]);

  const onLazyStateChange = (e) => {
    // update the state for the datatable component
    setLazyState((prevLazyState) => {
      return {
        ...prevLazyState,
        offset: e.first,
        limit: e.rows,
        sortField: e.sortField,
        sortOrder: e.sortOrder,
        filters: e.filters,
      };
    });
  };

  const onFilterElementChange = (columnId, value, matchMode) => {
    setLazyState((prevLazyState) => {
      return {
        ...prevLazyState,
        filters: {
          ...prevLazyState.filters,
          [columnId]: {
            value,
            matchMode,
          },
        },
      };
    });
  };

  const onSortChange = (field, order) => {
    setLazyState((prevLazyState) => {
      return {
        ...prevLazyState,
        sortField: field,
        sortOrder: order,
      };
    });
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
        const currentSortField =
          lazyState.sortField === column.id ? column.id : null;
        const currentSortOrder = currentSortField
          ? lazyState.sortOrder === 'ASC'
            ? 'ASC'
            : 'DESC'
          : null;
        console.log(currentSortField, currentSortOrder);
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
                  currentSortOrder === 'ASC' ? 'DESC' : 'ASC',
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
              value,
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
        <span className="text-xl text-900 font-bold ml-1">
          {location?.state?.tableHeader || schema?.data?.name}
        </span>
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
  const totalPages = Math.ceil((rows?.data?.count ?? 0) / lazyState.limit);
  const onPageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    setLazyState((prevLazyState) => {
      return {
        ...prevLazyState,
        offset: (pageNumber - 1) * prevLazyState.limit,
      };
    });
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <Button
          key={i}
          variant={i === currentPage ? 'default' : 'outline'}
          size="sm"
          onClick={() => onPageChange(i)}
          className="mx-1"
        >
          {i}
        </Button>,
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
                      <div className="flex items-center space-x-2 my-1">
                        <Input
                          value={lazyState.filters[header.column.id]?.value}
                          onChange={(e) => {
                            onFilterElementChange(
                              header.column.id,
                              e.target.value,
                              lazyState.filters[header.column.id]?.matchMode,
                            );
                          }}
                          key={header.column.id}
                          className="max-w-sm"
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
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
                                onSelect={() =>
                                  onFilterElementChange(
                                    header.column.id,
                                    lazyState.filters[header.column.id]?.value,
                                    option,
                                  )
                                }
                                className={`flex items-center justify-between ${
                                  option ===
                                  lazyState.filters[header.column.id]?.matchMode
                                    ? 'bg-primary/10'
                                    : ''
                                }`}
                              >
                                {option}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        {/* lazyState.filters[header.column.id]?.value &&
                        lazyState.filters[header.column.id]?.matchMode && */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            'h-8 w-8 p-2 transition-opacity duration-200',
                            lazyState.filters[header.column.id]?.value &&
                              lazyState.filters[header.column.id]?.matchMode
                              ? 'opacity-100'
                              : 'opacity-0',
                          )}
                          onClick={() =>
                            onFilterElementChange(
                              header.column.id,
                              '',
                              lazyState.filters[header.column.id]?.matchMode,
                            )
                          }
                        >
                          <FilterXIcon className="h-4 w-4" />
                          <span className="sr-only">Clear filter</span>
                        </Button>
                      </div>
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
        <div className="flex items-center justify-center space-x-2 m-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {renderPageNumbers()}

          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
