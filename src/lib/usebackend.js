import React, {useEffect} from 'react';
import API from './api.js';
//import {_} from 'lodash';
import useUserStore from '../stores/user.js';

const api = new API();

export function clearCache() {
  api.clearCache();
}

// This handles calls to the backend. This is a high level interface that handles common react stuff for you. api.fetch is a low level interface that you can use if you want to handle the backend calls yourself, but it is not recommended.
export function useBackend({
  packageName, // The package name to call
  className, // The class name to call
  methodName, // The method name to call
  recordId = false, // recordId is optional. If it is not provided, the method will be called without a recordId.
  args = {}, // arguments sent to the method
  reload = 1, // if this value changes a refresh will be forced
  cache = false, // If true, the data will be cached.
  filter = false, // This is a function that can be used to filter the data any time it is retrieved from the server, before it is stored and returned.
  clear = false, // If ever true, the data will be cleared.
  skip = false, // If true, the call will be skipped.
  queueing = false, // If true, the call will be queued if another call is in progress. This is useful for calls that are triggered by user input.
  timeout = 30000, // The timeout in milliseconds
}) {
  const [returnValue, setReturnValue] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [newArgs, setNewArgs] = React.useState(null);
  const queuedRequest = React.useRef(null);
  const fetching = React.useRef(false);
  const userId = useUserStore((state) => state.userId);

  console.log(
    'usebackend userId',
    `/api/${packageName}/${className}/${methodName}`,
    userId
  );

  React.useEffect(() => {
    const fetchData = async () => {
      if (newArgs === null) return;

      const start = new Date().getTime();

      let URL = `/api/${packageName}/${className}/${methodName}`;

      if (recordId) {
        URL += `/${recordId}`;
      }

      let response;

      setLoading(true);
      fetching.current = true;
      console.log('usebackend fetching', URL);
      try {
        if (cache) {
          response = await api.fetchCached(URL, newArgs, true, true, timeout);
        } else {
          response = await api.fetch(URL, newArgs, true, true, timeout);
        }
      } catch (e) {
        setError(e);
        setLoading(false);
        fetching.current = false;
        return;
      }
      console.log('usebackend done fetching', URL);
      setError(false);

      const took = new Date().getTime() - start;
      console.log(
        `${packageName}.${className}.${methodName} Data received in ${took} ms: `,
        response,
        arguments
      );

      if (filter) {
        response = filter(response);
      }

      setReturnValue(response);

      console.log('Done with request', newArgs);
      if (queuedRequest.current) {
        setNewArgs(queuedRequest.current);
        console.log('Executing request', queuedRequest.current);
        queuedRequest.current = null;
      }
      setLoading(false);
      fetching.current = false;
    };
    fetchData();
  }, [packageName, className, methodName, newArgs, reload, userId]);

  useEffect(() => {
    if (clear) {
      setReturnValue(null);
    }
  }, [clear]);

  if (skip) return [returnValue, loading, error];

  // This prevents duplicate calls when just a reference changes.
  if (!deepEqual(newArgs, args)) {
    if (queueing && fetching.current) {
      console.log('Queuing request', args);
      queuedRequest.current = args;
    } else {
      console.log('Executing request', args);
      setNewArgs(args);
    }
  }

  return [returnValue, loading, error];
}

export function callBackend({
  packageName,
  className,
  methodName,
  recordId,
  args,
  auth = true,
  supressDialog = false,
  cache = false,
  ttl = 1000 * 60 * 60,
}) {
  let URL = `/api/${packageName}/${className}/${methodName}`;
  if (recordId) {
    URL += `/${recordId}`;
  }

  if (cache) {
    return api.fetchCached(URL, args, ttl, auth, supressDialog);
  }

  return api.fetch(URL, args, auth, supressDialog);
}

export {api};

/**
 * Performs a deep comparison between two values to determine if they are equivalent.
 * @param {*} value1 The first value to compare
 * @param {*} value2 The second value to compare
 * @returns {boolean} Returns true if the values are equivalent, else false
 */
function deepEqual(value1, value2) {
  // Handle strict equality and null/undefined cases
  if (value1 === value2) {
    return true;
  }

  // If either value is null or undefined and they're not strictly equal, return false
  if (value1 == null || value2 == null) {
    return false;
  }

  // Handle different types
  if (typeof value1 !== typeof value2) {
    return false;
  }

  // Handle dates
  if (value1 instanceof Date && value2 instanceof Date) {
    return value1.getTime() === value2.getTime();
  }

  // Handle arrays
  if (Array.isArray(value1) && Array.isArray(value2)) {
    if (value1.length !== value2.length) {
      return false;
    }

    for (let i = 0; i < value1.length; i++) {
      if (!deepEqual(value1[i], value2[i])) {
        return false;
      }
    }

    return true;
  }

  // Handle objects
  if (typeof value1 === 'object' && typeof value2 === 'object') {
    const keys1 = Object.keys(value1);
    const keys2 = Object.keys(value2);

    if (keys1.length !== keys2.length) {
      return false;
    }

    for (const key of keys1) {
      if (!keys2.includes(key)) {
        return false;
      }

      if (!deepEqual(value1[key], value2[key])) {
        return false;
      }
    }

    return true;
  }

  return false;
}
