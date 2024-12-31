import {useRef, useEffect, startTransition} from 'react';
import {Outlet, useLocation} from 'react-router-dom';
import {useNavigate} from 'react-router-dom';
import {useBackend} from '../lib/usebackend.js';
import Login from '../components/login.jsx';
import useUserStore from '../stores/user.js';
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
import {AppSidebar} from '../components/AppSideBar.jsx';
import {SidebarInset, SidebarProvider} from '../components/ui/sidebar.jsx';
export default function Root({views}) {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useUserStore((state) => state.logout);
  const userId = useUserStore((state) => {
    return state.userId;
  });
  const setToast = useUserStore((state) => state.setToast);

  const {toast: shadToast} = useToast();
  const authenticated = useUserStore((state) => state.authenticated);
  const errorMessage = useUserStore((state) => state.errorMessage);
  const clearErrorMessage = useUserStore((state) => state.clearErrorMessage);

  const [menuRaw] = useBackend({
    packageName: 'core',
    className: 'menu',
    methodName: 'getAllMenuItems',
    enabled: authenticated,
    args: {authenticated}, // getAllMenuItems doesn't take any arguments. But this forces a data refresh when the user logs in or out.
    cache: true,
  });

  const menuItems =
    menuRaw && authenticated ? buildMenu(menuRaw.data, navigate, location) : [];

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
      <RootComponentInjection />
      <Dialog open={errorMessage} onOpenChange={clearErrorMessage}>
        <DialogContent
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          className="[&>button]:hidden w-120 z-50"
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

      <SidebarProvider>
        <AppSidebar
          navItems={menuItems}
          onSearch={(val) => navigate(`/search?value=${val}`)}
          userItems={userItems}
        />
        <SidebarInset className="flex flex-col flex-grow min-h-0 w-full max-w-full overflow-hidden">
          <Login>
            <Outlet />
          </Login>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

function buildMenu(items, navigate, location) {
  let output = [];

  for (const item of Object.keys(items).sort(
    (a, b) => items[a].order - items[b].order,
  )) {
    let itemoutput = {};

    // If it has children, process them first
    if (items[item].children && Object.keys(items[item].children).length > 0) {
      itemoutput.items = buildMenu(items[item].children, navigate, location);
    }

    itemoutput.label = items[item].label;

    if (items[item].navigate) {
      itemoutput.command = () => {
        const query = [`tableName=${items[item].label}`];

        if (items[item].view) {
          query.push(`view=${items[item].view}`);
        }

        if (items[item].filter && items[item].filter.length > 0) {
          query.push(`where=${JSON.stringify(items[item].filter)}`);
        }

        startTransition(() => {
          navigate(items[item].navigate + `/?` + query.join('&'), {
            state: {},
          });
        });
      };
    }

    if (items[item].icon) {
      itemoutput.icon = items[item].icon;
    }

    itemoutput.isActive = location.search.includes(
      encodeURIComponent(items[item].label),
    );

    output.push(itemoutput);
  }
  return output;
}
