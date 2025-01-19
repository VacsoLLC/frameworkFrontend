import {Input} from '../ui/input';
import {formatDateTime} from '../util';

export function read({value}) {

  return formatDateTime(value);
}
