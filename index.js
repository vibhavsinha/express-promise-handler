const randomString = () => Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15);

let errorListeners = [];

exports.subscribeError = (cb) => {
  errorListeners.push(cb);
  return () => {
    errorListeners = errorListeners.filter((l) => l !== cb);
  }
};

/**
 * An errror class which handles HTTP status codes.
 */
exports.HTTPError = class HTTPError extends Error {
  /**
   * return an instance of HTTPError which can be handled to provide correct
   * status code along with error message. Check the default function for more
   * details
   *
   * @param {number} code
   * @param {*} obj
   */
  constructor(code, obj) {
    super(obj);
    this.code = code;
    this.obj = obj;
    if (typeof obj === 'string') {
      this.message = obj;
    } else if (obj && obj.message && Object.keys(obj).length === 1 && typeof obj.message === 'string') {
      this.message = obj.message;
    } else {
      this.message = JSON.stringify(obj);
    }
  }
};

/**
 * convert a promise based function into an express middleware.
 * the returned function is not exactly a middleware because it does not hanlle
 * any next function.
 * @param {function(req:object):*} promiseFunction
 * @return {function(req:object, res:object):void}
 */
exports.default = (promiseFunction) => {
  return (req, res, next) => {
    new Promise((resolve) => {
      resolve(promiseFunction(req));
    })
      .catch((e) => {
        try {
          errorListeners.forEach((l) => l(e));
        } catch (listenerError) {
          console.error('Error calling error listener: ', listenerError);
        }
        if (e && e.constructor && e.constructor.name === 'HTTPError') {
          res.status(e.code);
          return (e && e.obj) ? e.obj: e;
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
        if (typeof data === 'object' && data && data.constructor.name === 'Buffer') {
          return res.send(data);
        }
        if (typeof data === 'object') {
          return res.json(data);
        }
        res.send(data.toString());
      });
  };
};

