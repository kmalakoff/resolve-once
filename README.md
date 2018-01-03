## resolve-once

Resolves a promise only once and memoizes the result.

## Usage

```
const resolveOnce = require('resolve-once');
const { MongoClient } = require('mongodb');

const connection = resolveOnce(() => MongoClient.connect('mongodb://localhost:27017/database'));
const db1 = await connection();
const db2 = await connection();
// db1 === db2
```
