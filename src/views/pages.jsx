import React from 'react';
import {useBackend, callBackend} from '../lib/usebackend.js';
import {read as HTML} from '../components/fields/html.jsx';
import {Link} from 'react-router-dom';
import {Button} from '../components/ui/button.jsx';
import Related from '../components/related.jsx';
import ActiveViewers from '../components/ActiveViewers.jsx';
import {ChevronRight, ChevronDown} from 'lucide-react';
import CreateRecord from '../components/buttons/createrecord.jsx';

export default function Pages({db, table}) {
  const [record, recordLoading] = useBackend({
    packageName: db,
    className: table,
    methodName: 'rowsGet',
  });

  if (record == null) {
    return <>Loading...</>;
  }

  return (
    <div className="p-2">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Pages</h2>
        <CreateRecord db={db} table={table} header="Create Page" />
      </div>
      {buildTree(record.data.rows)}
    </div>
  );
}

function buildTree(pages, parent = null) {
  return pages
    .filter((page) => page.parent === parent)
    .map((page) => (
      <TreeNode key={page.id} page={page}>
        {buildTree(pages, page.id)}
      </TreeNode>
    ));
}

function TreeNode({page, children, level = 0}) {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const hasChildren = children && children.length > 0;

  return (
    <div className="ml-4">
      <div className="flex items-center py-1">
        {hasChildren ? (
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
          <div className="w-6" /> // Spacing for alignment
        )}
        <Link
          to={`/core/page/${page.id}?view=page`}
          className="ml-1 text-blue-600 hover:text-blue-800 hover:underline"
        >
          {page.title}
        </Link>
      </div>
      {hasChildren && isExpanded && <div className="ml-2">{children}</div>}
    </div>
  );
}
