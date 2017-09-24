const randomString = () => Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15);

/**
 * An errror class which handles HTTP status codes.
 */
exports.HTTPError = class HTTPError extends Error {
  /**
   * return an instance of HTTPError which can be handled to provide correct
   * status code along with error message. Check the default function for more
   * details
   *
   * @param {integer} code
   * @param {any} obj
   */
  constructor(code, obj) {
    super(obj);
    this.code = code;
    this.message = (typeof obj === 'object') ? obj : {
      message: obj.toString(),
    };
  }
};

/**
 * convert a promise based function into an express middleware.
 * the returned function is not exactly a middleware because it does not hanlle
 * any next function.
 * @param {function(req:object):any} promiseFunction
 * @return {function(req:object, res:object):void}
 */
exports.default = (promiseFunction) => {
  return (req, res, next) => {
    new Promise((resolve, reject) => {
      resolve(promiseFunction(req));
    })
      .catch((e) => {
        if (e.constructor.name === 'HTTPError') {
          res.status(e.code);
          return e.message;
        }
        let rnd = randomString();
        console.log(`Error caught ${rnd}: `, e);
        res.status(500);
        return {
          message: `Internal server error: ${rnd}`,
        };
      })
      .then((data) => {
        if (typeof data === 'undefined') {
          next();
          return;
        }
        if (typeof data === 'object') {
          return res.json(data);
        }
        res.send(data.toString());
      });
  };
};
