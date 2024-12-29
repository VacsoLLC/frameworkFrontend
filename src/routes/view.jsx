import * as React from 'react';
import defaultViews from '../views/index.js';
import {useQueryState, parseAsString} from 'nuqs';

import {Routes, Route, useParams} from 'react-router-dom';

export default function View({views = {}}) {
  const {db, table, recordId} = useParams(); //view
  const [view, setView] = useQueryState(
    'view',
    parseAsString.withDefault('default'),
  );

  let ViewComponent;

  if (recordId) {
    ViewComponent =
      views?.record?.[view?.toLowerCase()] ||
      defaultViews.record[view?.toLowerCase()];
  } else {
    ViewComponent =
      views?.table?.[view?.toLowerCase()] ||
      defaultViews.table[view?.toLowerCase()];
  }

  if (!ViewComponent) {
    return <div>View not found</div>;
  }

  return <ViewComponent db={db} table={table} recordId={recordId} />;
}
