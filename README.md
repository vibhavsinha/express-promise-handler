# express-promise-handler
allows express middlewares to return promise by wrapping the middlewares

[![Commitizen
friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)


## Objective

Make the express route controllers easy to test and easy to read


## Example

**When setting up routes**

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
    });
  }
}

exports.default = ContentController;
```

## Alternative:

- [express-promise-router](https://github.com/express-promise-router/express-promise-router)

wrapper for Express 4's Router that allows middleware to return promises
