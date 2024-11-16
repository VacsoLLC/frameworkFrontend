import * as React from 'react';
import DataTable from '../components/datatable.jsx';
import {Routes, Route, useParams, useLocation} from 'react-router-dom';

export default function Root() {
  const {db, table} = useParams();
  const [reload, setReload] = React.useState(0);
  const location = useLocation();

  const forceReload = () => {
    setReload(reload + 1);
  };

  return (
    <React.Suspense>
      <DataTable
        db={db}
        table={table}
        reload={reload}
        forceReload={forceReload}
        key={`${db}.${table}`}
      />
    </React.Suspense>
  );
}
