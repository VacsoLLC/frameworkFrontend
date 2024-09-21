import React, {useState, useRef, useEffect} from 'react';

import {Dialog} from 'primereact/dialog';
import {Messages} from 'primereact/messages';
import {callBackend, clearCache} from '../lib/usebackend.js';
import {Button as Btn} from '../components/ui/button';

import useUserStore from '../stores/user.js';
import {Input} from './ui/input.jsx';
import {Label} from './ui/label.jsx';
import {Separator} from './ui/separator.jsx';
import {CheckIcon} from '@radix-ui/react-icons';

export default function LoginModal({children}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ssoList, setSSOList] = useState(null);

  const toast = useUserStore((state) => state.toast);

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

    msgs.current.clear(); // Clear any previous errors
    msgs.current.getElement().hidden = true;

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

        toast({
          severity: 'success',
          summary: 'Success',
          detail: `Login successful`,
          life: 3000,
        });

        clearCache();
        console.log('Login successful!');
      } else {
        toast({
          severity: 'error',
          summary: 'Failed',
          detail: `Login failed`,
          life: 3000,
        });

        console.log('No token received');
      }
    } catch (error) {
      toast({
        severity: 'error',
        summary: 'Failed',
        detail: `Login failed`,
        life: 3000,
      });
    }
  };

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
                  <Btn
                    className="bg-indigo-500 hover:bg-indigo-600"
                    type="submit"
                    onClick={onLogin}
                  >
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
                          className="w-full flex-1"
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
