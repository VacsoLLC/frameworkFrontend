import {useRef, useEffect, startTransition} from 'react';
import {Outlet} from 'react-router-dom';
import {useNavigate} from 'react-router-dom';
import {useBackend} from '../lib/usebackend.js';
import Login from '../components/login.jsx';
import useUserStore from '../stores/user.js';
import TopNavbar from '../components/AppBar.jsx';
import {useToast} from '../hooks/use-toast.js';
import {Toaster} from '../components/ui/toaster.jsx';
import {Button} from '../components/ui/button.jsx';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../components/ui/dialog.jsx';

export default function Root({views}) {
  const navigate = useNavigate();
  const userMenu = useRef(null);
  //const [newItems, setNewItems] = useState([]);
  const logout = useUserStore((state) => state.logout);
  const userId = useUserStore((state) => state.userId);
  const setToast = useUserStore((state) => state.setToast);
  const {toast: shadToast} = useToast();
  const authenticated = useUserStore((state) => state.authenticated);
  const toast = useRef(null);
  const errorMessage = useUserStore((state) => state.errorMessage);
  const clearErrorMessage = useUserStore((state) => state.clearErrorMessage);

  const [newItems] = useBackend({
    packageName: 'core',
    className: 'menu',
    methodName: 'getAllMenuItems',
    filter: (data) => buildMenu(data.data, navigate),
    clear: !authenticated,
    args: {authenticated}, // getAllMenuItems doesn't take any arguments. But this forces a data refresh when the user logs in or out.
  });

  const sendToast = (toastObject) => {
    console.log(toastObject, 'toast');
    shadToast({
      summary: toastObject.summary,
      description: toastObject.detail,
      life: 3000,
      variant: toastObject.severity,
    });
  };

  useEffect(() => {
    setToast(sendToast); // This works. Possibly a bad idea.
  }, []);

  const userItems = [
    {
      label: 'Profile',
      icon: 'User',
      command: () => {
        navigate(`/core/user/${userId}`);
      },
    },
    {
      label: 'Logout',
      icon: 'LogOut',
      command: () => {
        logout();
        navigate('/');
      },
    },
  ];

  const RootComponentInjection =
    views?.componentInjection?.root || (() => null);

  return (
    <div>
      <Dialog open={errorMessage} onOpenChange={clearErrorMessage}>
        <DialogContent
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          className="[&>button]:hidden w-120"
          hideClose
        >
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription>
              <br />
              The server has reported an error.
              <br />
              <br />
              {errorMessage}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button onClick={clearErrorMessage}>Ok</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster />
      <TopNavbar
        navItems={newItems}
        userItems={userItems}
        onSearch={(val) => navigate(`/search?value=${val}`)}
      />

      {/* <Menubar model={newItems} className="mb-1" end={end} /> */}
      <RootComponentInjection />
      <Login>
        <Outlet />
      </Login>
    </div>
  );
}

function buildMenu(items, navigate) {
  let output = [];

  for (const item of Object.keys(items).sort(
    (a, b) => items[a].order - items[b].order
  )) {
    let itemoutput = {};

    // If it has children, process them first
    if (items[item].children && Object.keys(items[item].children).length > 0) {
      itemoutput.items = buildMenu(items[item].children, navigate);
    }

    itemoutput.label = items[item].label;

    if (items[item].view) {
      itemoutput.command = () => {
        startTransition(() => {
          navigate(
            items[item].navigate +
              `/?tableName=${items[item].label}&where=${JSON.stringify(
                items[item].filter
              )}&view=${items[item].view}`,
            {
              state: {},
            }
          );
        });
      };
    }

    if (items[item].icon) {
      itemoutput.icon = items[item].icon;
    }

    output.push(itemoutput);
  }
  return output;
}
