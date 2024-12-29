import page from './page.jsx';
import pages from './pages.jsx';
import record from './record.jsx';
import table from './table.jsx';

export default {
  table: {
    pages,
    default: table,
  },
  record: {
    page,
    default: record,
  },
};
