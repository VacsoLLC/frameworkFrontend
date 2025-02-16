import React from 'react';
import {useBackend, callBackend} from '../lib/usebackend.js';
import {Link} from 'react-router-dom';
import {ChevronRight, ChevronDown} from 'lucide-react';

export default function Tree({db, table, parentId = null}) {
  const [record, recordLoading] = useBackend({
    packageName: db,
    className: table,
    methodName: 'pagesGet',
    args: {
      parentId,
    },
  });

  if (recordLoading) {
    return <div className="ml-3">Loading...</div>;
  }

  if (record.data.length === 0) {
    return <div className="ml-3">No pages found</div>;
  }

  return (
    <div className="ml-3">
      {record.data.map((page) => (
        <Node key={page.id} page={page} db={db} table={table} />
      ))}
    </div>
  );
}

function Node({page, db, table, level = 0}) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <>
      <div className="flex items-center py-1">
        {page.children > 0 ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-100 rounded-md"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            )}
          </button>
        ) : (
          <div className="w-6" />
        )}
        <Link
          to={`/core/page/${page.id}?view=page`}
          className="ml-0 text-blue-600 hover:text-blue-800 hover:underline"
        >
          {page.title}
        </Link>
      </div>
      {isExpanded && <Tree db={db} table={table} parentId={page.id} />}
    </>
  );
}
