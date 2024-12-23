const UNRESOLVED = 0;
const RESOLVING = 1;
const RESOLVED_SUCCESS = 2;
const RESOLVED_ERROR = 3;

export default function resolveOnce(fn) {
  let state = UNRESOLVED;
  let result;
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
    if (state === RESOLVED_SUCCESS) return Promise.resolve(result);
    if (state === RESOLVED_ERROR) return Promise.reject(result);
    const promise = new Promise((resolve, reject) => {
      waiting.push({ resolve: resolve, reject: reject });
    });
    resolveResult();
    return promise;
  };
}
