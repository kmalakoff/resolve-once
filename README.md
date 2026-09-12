# resolve-once

Runs an asynchronous resolver once and memoizes its success or failure.

## Install

```sh
npm install resolve-once
```

## Use

The resolver below runs once even when several callers request its result at the same time:

```js
var resolveOnce = require('resolve-once');

var calls = 0;
var getValue = resolveOnce(function () {
  return new Promise(function (resolve) {
    calls += 1;
    setTimeout(function () { resolve({ calls: calls }); }, 10);
  });
});

Promise.all([getValue(), getValue()]).then(function (values) {
  console.log(values[0] === values[1], calls); // true 1
});
```

Each caller gets the result of the same resolver operation, but receives its own Promise. After the first operation settles, later calls return the cached value or reject with the cached error. The package does not retry after rejection.

The implementation uses the global `Promise`; environments without a Promise implementation must provide one.

## License

MIT
