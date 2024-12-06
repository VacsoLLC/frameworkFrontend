import React, {useEffect} from 'react';
import API from './api.js';
//import {_} from 'lodash';
import useUserStore from '../stores/user.js';
import {useQuery} from '@tanstack/react-query';

const api = new API();

export function clearCache() {
  const clearCache = useUserStore.getState().clearCache;
  clearCache();
}

// This handles calls to the backend. This is a high level interface that handles common react stuff for you. api.fetch is a low level interface that you can use if you want to handle the backend calls yourself, but it is not recommended.
/**
 * Custom hook to interact with the backend API.
 *
 * @param {Object} params - The parameters for the backend call.
 * @param {string} params.packageName - The package name to call.
 * @param {string} params.className - The class name to call.
 * @param {string} params.methodName - The method name to call.
 * @param {boolean} [params.enabled=true] - If false, the call will be skipped.
 * @param {string|boolean} [params.recordId=false] - Optional record ID. If not provided, the method will be called without a record ID.
 * @param {Object} [params.args={}] - Arguments sent to the method.
 * @param {number} [params.timeout=5000] - The timeout in milliseconds.
 * @param {boolean} [params.supressDialog=true] - Whether to suppress error dialogs.
 * @param {number} [params.reload=1] - If this value changes, a refresh will be forced.
 * @param {boolean} [params.cache=false] - If true, the data will be cached for a long period. Normal data is only cached for 5 minutes and gets auto-refreshed based on various conditions.
 *
 * @returns {[any, boolean, any]} - Returns an array containing the data, loading state, and error state.
 */
export function useBackend({
  packageName, // The package name to call
  className, // The class name to call
  methodName, // The method name to call
  enabled = true, // If false, the call will be skipped.
  recordId = false, // recordId is optional. If it is not provided, the method will be called without a recordId.
  args = {}, // arguments sent to the method
  timeout = 5000, // The timeout in milliseconds
  supressDialog = false, // Whether to suppress error dialogs
  reload = 1, // if this value changes a refresh will be forced
  cache = false, // If true, the data will be cached for a long period. Normal data is only cached for 5 minutes, and gets auto refreshed based on a bunch of stuff.
  auth = true,
}) {
  const [previousReload, setPreviousReload] = React.useState(reload);
  const authenticated = useUserStore((state) => state.authenticated);

  const results = useQuery({
    enabled,
    refetchOnMount: !cache,
    refetchOnWindowFocus: !cache,
    refetchOnReconnect: !cache,
    refetchInterval: cache ? 1000 * 60 * 60 : 1000 * 60 * 5,
    queryKey: [
      {
        packageName,
        className,
        methodName,
        recordId,
        args,
        supressDialog,
        timeout,
        auth,
        authenticated,
      },
    ],
    queryFn: ({queryKey, signal}) => {
      console.log('useBackend: useQuery', 'queryKey', queryKey);

      const {
        packageName,
        className,
        methodName,
        recordId,
        args,
        supressDialog,
        timeout,
        auth,
      } = queryKey[0];

      let URL = `/api/${packageName}/${className}/${methodName}`;

      if (recordId) {
        URL += `/${recordId}`;
      }

      return api.fetch(URL, args, auth, supressDialog, timeout);
    },
  });

  if (reload !== previousReload) {
    results.refetch();
    setPreviousReload(reload);
  }

  return [results.data, results.isLoading, results.error, results];
}

/**
 * Calls a backend API endpoint.
 *
 * @param {Object} options - The options for the backend call.
 * @param {string} options.packageName - The name of the package.
 * @param {string} options.className - The name of the class.
 * @param {string} options.methodName - The name of the method.
 * @param {string} [options.recordId] - The ID of the record (optional).
 * @param {Object} options.args - The arguments to pass to the method.
 * @param {boolean} [options.auth=true] - Whether to reuire authentication before calling. (default: true). Set to false if you want to make the call without auth.
 * @param {boolean} [options.supressDialog=false] - Whether to suppress dialog messages for errors (default: false).
 * @returns {Promise} The result of the API call.
 */
export function callBackend({
  packageName,
  className,
  methodName,
  recordId,
  args,
  auth = true,
  supressDialog = false,
}) {
  let URL = `/api/${packageName}/${className}/${methodName}`;
  if (recordId) {
    URL += `/${recordId}`;
  }

  return api.fetch(URL, args, auth, supressDialog);
}

export {api};
