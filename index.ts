import {NextFunction, Request, Response} from 'express';

const randomString = () => Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15);

let errorListeners: Function[] = [];

export const subscribeError = (cb: (e: HTTPError | Error) => void) => {
  errorListeners.push(cb);
  return () => {
    errorListeners = errorListeners.filter((l) => l !== cb);
  }
};

/**
 * An error class which handles HTTP status codes.
 */
export class HTTPError extends Error {
  /**
   * return an instance of HTTPError which can be handled to provide correct
   * status code along with error message. Check the default function for more
   * details
   *
   * @param {number} code
   */
  readonly code: number;
  readonly message: string;
  readonly obj: string | {message: string}
  constructor(code: number, obj: string | {message: string}) {
    let message;
    let errorObj;
    if (typeof obj === 'string') {
      message = obj;
      errorObj = {message};
    } else if (obj && typeof obj.message === 'string') {
      message = obj.message;
      errorObj = obj;
    } else {
      message = JSON.stringify(obj);
      errorObj = {...obj, message}
    }
    super(message);
    this.code = code;
    this.obj = errorObj;
    this.message = message;
  }
};

/**
 * convert a promise based function into an express middleware.
 * the returned function is not exactly a middleware because it does not handle
 * any next function.
 */
export default <T extends Request>(promiseFunction: (req: T, res: Response) => Promise<unknown> | unknown ) => {
  return (req: Request, res: Response, next: NextFunction) => {
    new Promise((resolve) => {
      resolve(promiseFunction(req as T, res));
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
        if (e && e.constructor && ['AssertionError'].includes(e.constructor.name)) {
          res.status(400);
          return {message: e.message};
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
