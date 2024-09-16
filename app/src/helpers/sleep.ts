export function sleep(ms, options?: { signal?:AbortSignal }) {
  return new Promise((resolve, reject) => {
    options?.signal?.throwIfAborted();
    
    const timeout = setTimeout((args) => {
        resolve(args);
      }, ms
    );
    
    const abort = () => {
      clearTimeout(timeout);
      options?.signal?.removeEventListener('abort', abort);
      reject(options?.signal?.reason);
    }
    options?.signal?.addEventListener('abort', abort);
  });
}