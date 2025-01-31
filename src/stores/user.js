// store.js
import {create} from 'zustand';
import {jwtDecode} from 'jwt-decode';
import {persist} from 'zustand/middleware';

const useUserStore = create(
  persist(
    (set, get) => ({
      queryClient: null,
      token: null,
      tokenFields: {},
      authenticated: false,
      errorMessage: null,
      hasRole: (role) => {
        const roles = get().tokenFields.roles;
        return roles && roles.includes(role);
      },
      clearErrorMessage: () => set({errorMessage: null}),
      setErrorMessage: (errorMessage) => set({errorMessage}),
      setAuthenticated: (authenticated) => {
        set({authenticated});
        if (authenticated) {
          console.log('Authenticated');
          for (const request of get().pendingRequests) {
            request();
          }
        }
      },
      toast: () => {},
      setToast: (toast) => set({toast}),
      setQueryClient: (queryClient) => set({queryClient}),
      clearCache: () => {
        const queryClient = get().queryClient;
        if (queryClient) {
          queryClient.clear();
        }
      },
      setDefault: () => {
        set({
          token: null,
          tokenFields: {},
          authenticated: false,
          userId: null,
        });
      },
      setToken: (token) => {
        try {
          const decodedToken = jwtDecode(token);
          const isExpired = decodedToken.exp * 1000 < Date.now(); // convert exp to milliseconds and compare

          set({
            token,
            tokenFields: decodedToken,
            authenticated: !isExpired,
            userId: decodedToken.id,
          });

          get().clearCache();
        } catch (error) {
          console.error('Failed to decode token', error);
          get().setDefault();
        }
      },
      logout: () => {
        get().clearCache();
        get().setDefault();
      },
      isAuthenticated: () => {
        const token = get().token;
        if (token) {
          try {
            const decodedToken = jwtDecode(token);
            const isExpired = decodedToken.exp * 1000 < Date.now(); // check if the token has expired
            if (isExpired) {
              console.log('Token expired');
              get().setDefault();
              return false;
            }
            console.log('Token valid');
            return true;
          } catch (error) {
            console.error('Failed to decode token', error);
            get().logout();
            return false;
          }
        }
        console.log('No token');
        get().logout();
        return false;
      },
    }),
    {name: 'user'},
  ),
);

export default useUserStore;
