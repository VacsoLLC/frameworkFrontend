import * as React from 'react';
import defaultViews from '../views/index.js';

import {Routes, Route, useParams} from 'react-router-dom';

export default function View({views = {}}) {
  const {db, table, view, recordId} = useParams();

  const ViewComponent =
    views[view.toLowerCase()] || defaultViews[view.toLowerCase()];

  if (!ViewComponent) {
    return <div>View not found</div>;
  }

  return <ViewComponent db={db} table={table} recordId={recordId} />;
}
