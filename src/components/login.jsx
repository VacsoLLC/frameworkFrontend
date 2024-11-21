import React, {useState, useRef, useEffect} from 'react';

import {callBackend, clearCache} from '../lib/usebackend.js';

import useUserStore from '../stores/user.js';
import {Button} from '../components/ui/button';
import {Input} from '../components/ui/input';
import {Label} from '../components/ui/label';
import {useToast} from '../hooks/use-toast.js';
import {Toaster} from './ui/toaster.jsx';
import {Dialog, DialogContent} from './ui/dialog.jsx';

export default function LoginModal({children}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ssoList, setSSOList] = useState(null);

  // const toast = useUserStore((state) => state.toast);
  const {toast: shadToast} = useToast();

  const setToken = useUserStore((state) => state.setToken);
  const authenticated = useUserStore((state) => state.authenticated);

  const msgs = useRef(null);

  useEffect(() => {
    const fetchSSOList = async () => {
      if (!authenticated) {
        console.log('SSO Start');
        const response = await callBackend({
          packageName: 'core',
          className: 'saml',
          methodName: 'list',
          cache: true,
          auth: false,
        });
        console.log('SSO List:', response.data);
        if (response.data.length > 0) {
          setSSOList(response.data);
        }
      }
    };
    fetchSSOList();
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
  return (
    <>
      <Dialog open={!authenticated} onOpenChange={() => {}}>
        <DialogContent
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          className="[&>button]:hidden w-120"
          hideClose
        >
          <div className="flex justify-center">
            <div className="w-96 p-6">
              <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" onClick={onLogin}>
                  Login
                </Button>
              </div>
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
              <div className="space-y-4">
                {ssoList?.length &&
                  ssoList.map((sso) => (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        window.location.href = sso.link;
                      }}
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
