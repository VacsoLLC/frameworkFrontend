import {NuqsAdapter} from 'nuqs/adapters/react-router';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import Root from './routes/root.jsx';
import Table from './routes/table.jsx';
import ViewRecord from './routes/viewrecord.jsx';
import View from './routes/view.jsx';
import Token from './routes/token.jsx';
import Home from './routes/home.jsx';
import CreateRecord from './routes/createrecord.jsx';
import Search from './routes/search.jsx';
import Action from './routes/action.jsx';

import './main.css';

function Frontend({views}) {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Root views={views} />,
      children: [
        {
          path: '/',
          element: <Home />,
        },
        {
          path: '/search',
          element: <Search />,
        },
        {
          path: '/:db/:table', //core/user/table
          element: <Table />,
        },
        {
          path: '/:db/:table/create', //core/user/create
          element: <CreateRecord />,
        },
        {
          path: '/:db/:table/:recordId', //core/user/record/1
          element: <ViewRecord />,
        },
        {
          path: '/:db/:table/view/:view', //core/user/othertableview
          element: <View views={views} />,
        },
        {
          path: '/:db/:table/view/:view/:recordId', //core/user/otherrecordview/1
          element: <View views={views} />,
        },
        {
          path: '/:packageName/:className/action/:methodName/:recordId',
          element: <Action />,
        },
      ],
    },
    {
      path: '/token',
      element: <Token />,
    },
  ]);
  //return <>hello</>;

  return (
    <NuqsAdapter>
      <RouterProvider router={router} />
    </NuqsAdapter>
  );
}

export default Frontend;
