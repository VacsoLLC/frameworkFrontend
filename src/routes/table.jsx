import * as React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import DataTableNew from '../components/datatableNew.jsx';

const generateLocationWhere = (location) => {
  return location?.state?.filter && Array.isArray(location.state.filter)
    ? location?.state?.filter
    : [];
};

export default function Root() {
  const { db, table } = useParams();
  const [reload, setReload] = React.useState(0);
  const location = useLocation();

  const forceReload = () => {
    setReload(reload + 1);
  };

  return (
    <React.Suspense>
      <DataTableNew
        db={db}
        table={table}
        reload={reload}
        forceReload={forceReload}
        where={generateLocationWhere(location)}
        key={`${db}.${table}.${JSON.stringify(location?.state?.filter || {})}`}
      />
    </React.Suspense>
  );
}
