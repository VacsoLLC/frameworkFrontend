import * as React from 'react';
import {useBackend} from '../lib/usebackend';

import {Routes, Route, useParams, useNavigate} from 'react-router-dom';

export default function Action() {
  const {className, packageName, methodName, recordId} = useParams();
  const navigate = useNavigate();

  const [data] = useBackend({
    packageName,
    className,
    methodName,
    recordId,
    args: {},
  });

  if (data && data.data) {
    if (data.data.navigate) {
      navigate(data.data.navigate);
    }

    if (data.data.message) {
      return <h1>{data.data.message}</h1>;
    }
  }

  return (
    <>
      <h1>Executing Action...</h1>
    </>
  );
}
