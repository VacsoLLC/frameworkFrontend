import {clsx} from 'clsx';
import {debounce} from 'lodash';
import {useEffect, useMemo, useRef} from 'react';
import {twMerge} from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const useDebounce = (callback, time = 1000) => {
  const ref = useRef();

  useEffect(() => {
    ref.current = callback;
  }, [callback]);

  const debouncedCallback = useMemo(() => {
    const func = () => {
      ref.current?.();
    };

    return debounce(func, time);
  }, []);

  return debouncedCallback;
};
