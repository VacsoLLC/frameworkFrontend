import React, {useState, useRef, useEffect} from 'react';

import {Dialog} from 'primereact/dialog';
import {Messages} from 'primereact/messages';
import {callBackend, clearCache} from '../lib/usebackend.js';

import useUserStore from '../stores/user.js';
import {Button} from '../components/ui/button';
import {Input} from '../components/ui/input';
import {Label} from '../components/ui/label';
import {Separator} from '../components/ui/separator';
import {useToast} from '../hooks/use-toast.js';
import {Toaster} from './ui/toaster.jsx';

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

    console.log('Email:', email, 'Password:', password);

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

        // toast({
        //   severity: 'success',
        //   summary: 'Success',
        //   detail: `Login successful`,
        //   life: 3000,
        // });
        shadToast({
          title: 'Success',
          description: 'Login successful',
          duration: 3000,
          variant: 'success',
        });

        clearCache();
        console.log('Login successful!');
      } else {
        // toast({
        //   severity: 'error',
        //   summary: 'Failed',
        //   detail: `Login failed`,
        //   life: 3000,
        // });
        shadToast({
          title: 'Failed',
          description: 'Login failed',
          duration: 3000,
          variant: 'error',
        });

        console.log('No token received');
      }
    } catch (error) {
      // toast({
      //   severity: 'error',
      //   summary: 'Failed',
      //   detail: `Login failed`,
      //   life: 3000,
      // });
      shadToast({
        title: 'Failed',
        description: 'Login failed',
        duration: 3000,
        variant: 'error',
      });
    }
  };
  return (
    <>
      <Dialog
        visible={!authenticated}
        style={{width: '45vw'}}
        closable={false}
        modal
        maskClassName={'bg-opacity-50 bg-black'}
        draggable={false}
      >
        <div className="flex justify-center">
          <div className="w-96 p-6 border rounded-lg shadow-md bg-card">
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
      </Dialog>
      <Toaster />
      <>{children}</>
    </>
  );

  return (
    <>
      <>
        <div>
          <Dialog
            header="Login"
            visible={!authenticated}
            style={{width: '45vw'}}
            closable={false}
            modal
            draggable={false}
          >
            <div className="card flex justify-content-center">
              <div className="w-full max-w-md mx-auto space-y-4 p-2 pr-6 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Label
                    htmlFor="email"
                    className="w-20 text-right flex-shrink-0"
                  >
                    Email
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    placeholder="Enter your email"
                    className="flex-grow"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Label
                    htmlFor="password"
                    className="w-20 text-right flex-shrink-0"
                  >
                    Password
                  </Label>
                  <Input
                    type="password"
                    id="password"
                    placeholder="Enter your password"
                    className="flex-grow"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="pt-2 flex justify-content-center">
                  <Btn className="" type="submit" onClick={onLogin}>
                    <CheckIcon className="mr-1" /> Login
                  </Btn>
                </div>
              </div>

              {ssoList && ssoList.length > 0 && (
                <>
                  <Separator orientation="vertical" />
                  <div className="flex-col items-center p-3 pl-5">
                    <div className="text-center">Or login with:</div>
                    {ssoList.map((sso) => (
                      <div className="mt-4">
                        <Btn
                          label={sso.name}
                          onClick={() => {
                            window.location.href = sso.link;
                          }}
                          autoFocus
                          className="w-full flex-"
                        >
                          {sso.name}
                        </Btn>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            <Messages ref={msgs} />
          </Dialog>
        </div>
      </>
      <>{children}</>
    </>
  );
}
