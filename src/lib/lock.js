export default class Lock {
  constructor() {
    this.locks = new Map(); // key -> { promise, resolve, timeoutId }
    this.request = 0;
  }

  async lock(key, timeout = 30000) {
    const requestNum = this.request++;
    while (true) {
      // If there's an existing lock, wait for it
      const existingLock = this.locks.get(key);
      if (existingLock) {
        try {
          console.log(
            'LOCK: Waiting for existing lock to release',
            key,
            requestNum,
          );
          await existingLock.promise;
          continue; // Lock was released, try to acquire it
        } catch (error) {
          continue; // Lock timed out, try to acquire it
        }
      }

      // Try to acquire the lock
      let lockResolve;
      let lockReject;
      const lockPromise = new Promise((resolve, reject) => {
        lockResolve = resolve;
        lockReject = reject;
      });

      // Set timeout for holding the lock
      const timeoutId = setTimeout(() => {
        const lock = this.locks.get(key);
        if (lock && lock.resolve === lockResolve) {
          this.locks.delete(key);
          console.log('LOCK: Lock timed', key, requestNum);
          if (lockReject) lockReject();
        }
      }, timeout);

      // Check if another requestor got the lock while we were creating our promise - I'm not sure this is possible.
      if (this.locks.has(key)) {
        console.log(
          'LOCK: Another requestor got the lock while we were creating our promise',
          key,
        );
        resolve();
        clearTimeout(timeoutId);
        continue; // Try again
      }

      // We got the lock!
      this.locks.set(key, {
        promise: lockPromise,
        resolve: lockResolve,
        reject: lockReject,
        timeoutId: timeoutId,
      });

      console.log('LOCK: Acquired lock', key, requestNum);

      // Return unlock function
      return () => {
        const lock = this.locks.get(key);
        console.log('LOCK: Releasing lock', key, requestNum);
        if (lock && lock.resolve === lockResolve) {
          clearTimeout(lock.timeoutId);
          this.locks.delete(key);
          lockResolve();
        }
      };
    }
  }
}
