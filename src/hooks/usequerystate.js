import {useQueryState} from 'nuqs';
import {useState} from 'react';

export default function useQueryState2(name, defaultValue, enabled = true) {
  let value;
  if (enabled) {
    value = useQueryState(name, defaultValue);
  } else {
    value = useState(defaultValue.defaultValue);
  }

  return value;
}
