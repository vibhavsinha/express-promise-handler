import {ErrorRequestHandler, NextFunction, Request, Response} from 'express';

const randomString = () =>
  Math.random().toString(36).substring(2, 15);

/**
 * An error class which handles HTTP status codes.
 */
export class HTTPError<
  T extends {message: string} = {message: string},
> extends Error {
  /**
   * return an instance of HTTPError which can be handled to provide correct
   * status code along with error message. Check the default function for more
   * details
   */
  readonly status: number;
  readonly message: string;
  readonly obj: T;
  constructor(status: number, obj: T) {
    let message: string;
    let errorObj: T;
    if (typeof obj.message === 'string') {
      message = obj.message;
      errorObj = obj;
    } else {
      message = JSON.stringify(obj);
      errorObj = {...obj, message};
    }
    super(message);
    this.status = status;
    this.obj = errorObj;
    this.message = message;
  }
}

/**
 * convert a promise based function into an express middleware.
 * the returned function is not exactly a middleware because it does not handle
 * any next function.
 */
export default <T extends Request>(
  promiseFunction: (req: T, res: Response) => Promise<unknown> | unknown,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    new Promise((resolve) => {
      resolve(promiseFunction(req as T, res));
    })
      .then((data) => {
        formatResponse(res, data) || next();
      })
      .catch((err) => {
        next(err);
      });
  };
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HTTPError) {
    return res.status(err.status).json(err.obj ? err.obj : err);
  }
  if (
    err &&
    err.constructor &&
    ['AssertionError'].includes(err.constructor.name)
  ) {
    return res.status(400).json({message: err.message});
  }
  let rnd = randomString();
  console.log(`Error caught ${rnd}: `, err);
  res.status(500).json({
    message: `Internal server error: ${rnd}`,
  });
};

const formatResponse = (res: Response, data: unknown) => {
  if (typeof data === 'undefined') {
    return false;
  }
  if (Buffer.isBuffer(data)) {
    res.send(data);
    return true;
  }
  if (typeof data === 'object') {
    res.json(data);
    return true;
  }
  res.send(data.toString());
  return true;
};
