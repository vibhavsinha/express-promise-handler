# express-promise-handler
allows express middlewares to return promise by wrapping the middlewares

## Objective

Make the express route controllers easy to test and easy to read

## Concepts


* return from the callback is sent as response
* object based responses are returned as json
* thrown errors are caught and handled with 500
* custom error can be thrown using `HTTPError`
* returning `undefined` will call the `next` method. If there is no next, this
  can result in `504` timeout.


## Example

**Setting up routes**

```javascript
let ContentController = require('./content.controller');
let Router = require('express').Router;
let controller = new ContentController();
let router = new Router();

let promiseHandler = require('express-promise-handler').default;

router.get('/:id', promiseHandler(controller.info));

module.exports = router;
```
**In the controller**

```javascript
const HTTPError = require('express-promise-handler').HTTPError;

class ContentController {
  info(req) {
    return models.content.findOne({
      where: {
        id: req.params.id
      }
    })
    .then((entry) => {
      if (!entry) {
        throw new HTTPError(404, 'entry not found');
      }
      return entry;
    });
  }
}

exports.default = ContentController;
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
