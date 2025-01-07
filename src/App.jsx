import {NuqsAdapter} from 'nuqs/adapters/react-router';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import Root from './routes/root.jsx';
import View from './routes/view.jsx';
import Token from './routes/token.jsx';
import Home from './routes/home.jsx';
import CreateRecord from './routes/createrecord.jsx';
import Search from './routes/search.jsx';
import Action from './routes/action.jsx';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {ReactQueryDevtools} from '@tanstack/react-query-devtools';
import useUserStore from './stores/user.js';

import './main.css';
import ResetPassword from './routes/ResetPassword.jsx';
import SignUpPage from './routes/signup.jsx';
import CreatePasswordPage from './routes/completeAccountCreation.jsx';

const queryClient = new QueryClient();

function Frontend({views}) {
  const setQueryClient = useUserStore((state) => state.setQueryClient);
  setQueryClient(queryClient);

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
          element: <View views={views} />,
        },
        {
          path: '/:db/:table/create', //core/user/create
          element: <CreateRecord />,
        },
        {
          path: '/:db/:table/:recordId', //core/user/record/1
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
    {
      path: '/reset-password',
      element: <ResetPassword />,
    },
    {
      path: '/signup',
      element: <SignUpPage />,
    },
    {
      path: '/set-password',
      element: <CreatePasswordPage />,
    },
  ]);
  //return <>hello</>;

  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>
        <RouterProvider router={router} />
      </NuqsAdapter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default Frontend;
