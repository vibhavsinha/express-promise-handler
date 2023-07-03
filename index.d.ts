declare module 'express-promise-handler' {
  type ErrorListener = (error: Error) => void;
  type RequestHandler = (req: object, res: object, next: () => void) => void;

  export function subscribeError(cb: ErrorListener): () => void;

  export class HTTPError extends Error {
    constructor(code: number, obj: any);
    code: number;
    obj: any;
  }

  export default function createMiddleware(promiseFunction: (req: object) => any): RequestHandler;
}
