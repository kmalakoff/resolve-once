const UNRESOLVED = 0;
const RESOLVING = 1;
const RESOLVED_SUCCESS = 2;
const RESOLVED_ERROR = 3;

export type Resolver<T> = (...any: unknown[]) => Promise<T>;

export default function resolveOnce<T>(fn: Resolver<T>): Resolver<T> {
  let state = UNRESOLVED;
  let result: T | Error;
  const waiting = [];

  function resolveResult() {
    if (state === RESOLVING) return;
    state = RESOLVING;

    Promise.resolve(fn())
      .then((value) => {
        state = RESOLVED_SUCCESS;
        result = value;
        while (waiting.length) waiting.pop().resolve(result);
      })
      .catch((err) => {
        state = RESOLVED_ERROR;
        result = err;
        while (waiting.length) waiting.pop().reject(result);
      });
  }

  return () => {
    if (state === RESOLVED_SUCCESS) return Promise.resolve<T>(result as T);
    if (state === RESOLVED_ERROR) return Promise.reject<T>(result);
    const promise = new Promise((resolve, reject) => {
      waiting.push({ resolve: resolve, reject: reject });
    });
    resolveResult();
    return promise as Promise<T>;
  };
}
