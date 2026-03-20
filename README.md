# express-promise-handler

Allows express middlewares to return promise by wrapping the middlewares.

- Makes express route handlers testable by avoiding use of res.
- Slightly easier to work with promises.

## Objective

Make the express route controllers easy to test and easy to read

## Concepts

- return from the callback is sent as response
- object based responses are returned as json
- thrown errors are caught and handled with 500
- custom error can be thrown using `HTTPError`
- returning `undefined` will call the `next` method. If there is no next, this
  can result in `504` timeout. This is to build middlewares.

## Example

### Setting up

```javascript
import express from 'express';
import eph, {HTTPError, errorHandler} from 'express-promise-handler';
import assert from 'node:assert/strict';

const app = express();

app.get('/', eph(async (req) => {
  if (req.query.known) throw new HTTPError(404, {message: 'entry not found'});
  if (req.query.unknown) throw new Error('abcd');
  if (req.query.assert) assert.fail('assertion failure');
  return {a: 1};
}));

app.use(errorHandler);

app.listen(5151, () => console.log('listening'));
```

**Sample response**

```json
{
  "message": "entry not found"
}
```

```json
{
  "message": "Internal server error: cbnvdtbz51v9pc8h395qd"
}
```

## Error tracking

Thrown errors which are not instances of HTTPError are logged with full stack
traces. These stack traces are assigned a unique alphanumeric string which is
also sent as part of the response. API clients can choose to display this string
to the users in order to track individual issues.

This also ensures that uncaught errors will not have any details conveyed in the
response.

## Changelog

## [4.0.0] 2026-03-20

- Removed `subscribeError` because it is better used through express default handler
- Dropped support for string as the second argument to `HTTPError`. Only objects supported.
- Error handling separated to a new express middleware. This is required to be used for using `HTTPError`.
- Export type changed to ESM. Node 22+ recommended to work with `cjs` imports.

## [3.4.4] 2026-03-17

- Improve types of arg of `HTTPError` and `subscribeError`

## [3.4.0] 2025-08-04

- Added request object as second argument of subscribeError

## [3.3.1] 2023-12-23

- Fix the type check for `HTTPError` using `instanceof` instead of constructor
name. It was causing issues when used with `got` where the error is also named `HTTPError`.

## [3.3.0] 2023-10-31

### Changed

- Added support for complex error object with more properties

## [3.2.0] - 2023-10-21

### Changed

- Added typescript definitions for subscribeError callback

## [3.1.0] - 2023-10-09

### Changed

- added typescript support
- Response will be set as second argument to use for setting headers
- added package-lock and removed yarn.lock

## [3.0.0] - 2020-04-09
### Changed
- send assertion error as http status 400 with the given message

## [2.1.0] - 2017-12-23
### Changed
- added feature to handle buffer data as raw

## [2.0.0] - 2017-09-24
### Changed
- Error in now always json
- HTTPError is considered caught and not logged in detail
- `HTTPError.message` is now a json object
- handle `next()` methods in middleware

## Alternative:

- [express-promise-router](https://github.com/express-promise-router/express-promise-router)

wrapper for Express 4's Router that allows middleware to return promises
