// api.js
import useUserStore from '../stores/user.js';
import lock from './lock.js';

const keyLock = new lock();

class API {
  constructor() {
    this.urlCache = {};
  }

  authenticated() {
    return useUserStore.getState().authenticated;
  }

  async waitForAuthentication() {
    const isAuthenticated = useUserStore.getState().isAuthenticated();
    if (isAuthenticated) return;

    console.log('Not authenticated, waiting for authentication...');

    return new Promise((resolve, reject) => {
      const unsubscribe = useUserStore.subscribe(
        (store) => {
          const timer = setTimeout(
            () => {
              console.log('Timeout waiting for authentication');
              unsubscribe();
              reject(new Error('Timeout waiting for authentication'));
            },
            1000 * 60 * 2,
          ); // 2 minutes

          if (store.authenticated) {
            clearTimeout(timer);
            unsubscribe();
            resolve();
          }
        },
        (state) => state.authenticated,
      );
    });
  }

  /**
   * Adds a timeout to a Promise
   * @param {Promise} promise - The Promise to add a timeout to
   * @param {number} timeoutMs - The timeout in milliseconds
   * @returns {Promise} - A Promise that rejects if the timeout is reached
   */
  timeoutPromise(promise, timeoutMs, message = '') {
    return Promise.race([
      promise,
      new Promise((_, reject) => {
        const timeoutId = setTimeout(() => {
          console.log(`Request timed out. ${message}`);
          reject(new Error('Request timed out'));
        }, timeoutMs);

        // When the original promise resolves, clear the timeout
        promise.finally(() => {
          clearTimeout(timeoutId);
        });
      }),
    ]);
  }

  /**
   * Fetch data from the API
   * @param {string} url - The URL to fetch data from
   * @param {object} body - The body of the request
   * @param {boolean} auth - Whether to wait for authentication
   * @param {boolean} suppressDialog - Whether to suppress error dialogs
   * @param {number} timeoutMs - The timeout in milliseconds
   * @returns {Promise} - A promise that resolves to the fetched data
   * @throws {Error} - Throws an error if the fetch fails or times out
   */
  async fetch(
    url,
    body = {},
    auth = true,
    suppressDialog = false,
    timeoutMs = 30000,
  ) {
    while (true) {
      if (auth) {
        await this.waitForAuthentication();
      }

      const token = useUserStore.getState().token;

      try {
        console.log('Fetching: ', url);
        const response = await this.timeoutPromise(
          fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
          }),
          timeoutMs,
          url,
        );
        console.log('Done Fetching: ', url);

        if (response.status === 401) {
          useUserStore.getState().logout();

          console.log(`Received 401, Waiting for re-authentication... `);
          continue;
        }

        if (response.status === 403) {
          throw new Error(
            'Access Denied: You do not have permission to access this resource.',
          );
        }

        if (response.status !== 200) {
          let json = {};
          try {
            json = await response.json();
          } catch {
            throw new Error(`${response}`);
          }

          if (json.error) {
            throw new Error(json.error);
          } else if(json.message) {
            throw new Error(json.message);
          } else {
            throw new Error(`${response.statusText}`);
          }
        }

        const data = await response.json();

        if (data.messages) {
          for (const message of data.messages) {
            useUserStore.getState().toast(message);
          }
        }

        return {
          ok: response.ok,
          ...data,
        };
      } catch (error) {
        if (error.message === 'Request timed out') {
          if (!suppressDialog)
            useUserStore
              .getState()
              .setErrorMessage(`Action timed out after ${timeoutMs}ms`);
          throw new Error(`Action timed out after ${timeoutMs}ms`);
        }
        if (!suppressDialog)
          useUserStore.getState().setErrorMessage(`${error.message}`);
        throw new Error(`${error.message}`);
      }
    }
  }

  /**
   * Uploads multiple files to the specified URL
   * @param {string} url - The URL to upload the files to
   * @param {FormData} formData - The form data containing the files and additional information
   * @param {boolean} auth - Whether to use authentication
   * @param {boolean} suppressDialog - Whether to suppress error dialogs
   * @returns {Promise<Object>} The server response
   */
  async uploadFiles(url, formData, auth = true, suppressDialog = false) {
    if (auth) {
      await this.waitForAuthentication();
    }

    const token = useUserStore.getState().token;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          useUserStore.getState().logout();

          throw new Error('Authentication required');
        }

        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`,
        );
      }
      const data = await response.json();

      return {
        ok: response.ok,
        data: data.data,
        messages: data.messages,
      };
    } catch (error) {
      if (!suppressDialog) {
        useUserStore.getState().setErrorMessage(error.message);
      }
      throw error;
    }
  }

  /**
   * Fetches a URL and returns a temporary URL for the downloaded file.
   *
   * @param {string} url - The URL to fetch.
   * @param {string} [filename=null] - Optional filename for the downloaded file.
   * @param {boolean} [suppressDialog=false] - Whether to suppress error dialogs.
   * @returns {Promise<string>} - A promise that resolves to a temporary URL for the downloaded file.
   * @throws {Error} - Throws an error if the fetch operation fails or if authentication is required.
   */
  async getWindowUrl(url, filename = null, suppressDialog = false) {
    await this.waitForAuthentication();

    const token = useUserStore.getState().token;

    const unlock = await keyLock.lock(url, 1000 * 5); // use locking to prevent multiple requests for the same URL

    if (this.urlCache[url]) {
      console.log('Image: CACHE HIT:', url, this.urlCache[url]);
      unlock();
      return this.urlCache[url];
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          useUserStore.getState().logout();

          throw new Error('Authentication required');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the filename from the Content-Disposition header if not provided
      if (!filename) {
        const contentDisposition = response.headers.get('Content-Disposition');
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }
      }

      // If filename is still not available, use a default name
      filename = filename || 'download';

      // Create a Blob from the response
      const blob = await response.blob();

      // Create a temporary URL for the Blob
      const windowUrl = window.URL.createObjectURL(blob);
      this.urlCache[url] = windowUrl;
      console.log('Image: CACHE MISS:', url, this.urlCache[url]);
      unlock();
      return windowUrl;
    } catch (error) {
      console.error('Error downloading file:', error);
      if (!suppressDialog) {
        useUserStore.getState().setErrorMessage(error.message);
      }
      unlock();
      throw error;
    }
  }

  /**
   * Initiates a file download from the specified URL using the bearer token for authentication
   * @param {string} url - The URL to download the file from
   * @param {string} filename - The suggested filename for the download (optional)
   * @throws {Error} If the download fails or the user is not authenticated
   */
  async downloadFile(url, filename = null) {
    // Create a temporary URL for the Blob
    try {
      const windowUrl = await this.getWindowUrl(url, filename);

      // Create a temporary anchor element to trigger the download
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = windowUrl;
      a.download = filename;

      // Append the anchor to the body, click it, and remove it
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(windowUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      useUserStore.getState().setErrorMessage(error.message);
      throw error;
    }
  }
}

export default API;
