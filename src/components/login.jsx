import React, {useState, useRef, useEffect} from 'react';

import {callBackend, useBackend, clearCache} from '../lib/usebackend.js';

import useUserStore from '../stores/user.js';
import {Button} from '../components/ui/button';
import {Input} from '../components/ui/input';
import {Label} from '../components/ui/label';
import {useToast} from '../hooks/use-toast.js';
import {Toaster} from './ui/toaster.jsx';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from './ui/dialog.jsx';

import {VisuallyHidden} from '@radix-ui/react-visually-hidden';

export default function LoginModal({children}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [ssoList] = useBackend({
    packageName: 'core',
    className: 'saml',
    methodName: 'list',
    cache: true,
    auth: false,
  });

  const {toast: shadToast} = useToast();

  const setToken = useUserStore((state) => state.setToken);
  const authenticated = useUserStore((state) => state.authenticated);

  const [open, setOpen] = useState(false);

  const msgs = useRef(null);

  useEffect(() => {
    // We used to just use authenticated directly for the open={} on the popup, but it caused bugs. This is a workaround.
    setOpen(!authenticated);
  }, [authenticated]);

  const onLogin = async (e) => {
    e.preventDefault();
    if (msgs.current) {
      msgs.current.clear(); // Clear any previous errors
      msgs.current.getElement().hidden = true;
    }
    try {
      const response = await callBackend({
        packageName: 'core',
        className: 'login',
        methodName: 'getToken',
        args: {email, password},
        auth: false,
        supressDialog: true,
      });
      const data = response.data;
      if (data && data.token) {
        setToken(data.token);
        shadToast({
          title: 'Success',
          description: 'Login successful',
          duration: 3000,
          variant: 'success',
        });

        clearCache();
        console.log('Login successful!');
      } else {
        shadToast({
          title: 'Failed',
          description: 'Login failed',
          duration: 3000,
          variant: 'error',
        });

        console.log('No token received');
      }
    } catch (error) {
      shadToast({
        title: 'Failed',
        description: `${error}`,
        duration: 3000,
        variant: 'error',
      });
    }
  };

  const handleSumbmit = (e) => {
    onLogin(e);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          className="[&>button]:hidden w-120"
        >
          <DialogTitle>
            <div className="text-2xl font-bold text-center mb-0">Login</div>
          </DialogTitle>
          <DialogDescription className="text-center">
            <VisuallyHidden asChild>Login to continue</VisuallyHidden>
          </DialogDescription>
          <div className="flex justify-center">
            <div className="w-96 p-4">
              <form onSubmit={handleSumbmit}>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="username"
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full" onClick={onLogin}>
                    Login
                  </Button>
                </div>
              </form>
              {ssoList?.data?.length && (
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
              )}
              <div className="space-y-4">
                {ssoList?.data?.length &&
                  ssoList?.data.map((sso) => (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        window.location.href = sso.link;
                      }}
                      key={sso.name}
                    >
                      {sso.name}
                    </Button>
                  ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Toaster />
      <>{children}</>
    </>
  );
}
