import assert from 'node:assert/strict';
import express from 'express';
import eph, {HTTPError, errorHandler} from 'express-promise-handler';
import {before, after, describe, it} from 'node:test';
import {Server} from 'node:http';
import type {AddressInfo} from 'node:net';
const app = express();

const cases = [
  {
    path: '/success-string',
    handler: async () => 1,
    expect: {status: 200, match: /^1$/, type: 'text/html'},
  },
  {
    path: '/success-object',
    handler: async () => ({a: 1}),
    expect: {status: 200, text: '{"a":1}', type: 'application/json'},
  },
  {
    path: '/success-buffer',
    handler: async () => Buffer.from([0x23, 0x48]),
    expect: {status: 200, type: 'application/octet-stream', text: '#H'},
  },
  {
    path: '/success-null',
    handler: async () => null,
    // returns application/json which is not ideal
    expect: {status: 200, text: 'null'},
  },
  {
    path: '/success-undefined',
    handler: async () => undefined,
    expect: {status: 404, match: 'Cannot GET'},
  },
  {
    path: '/assertion-error',
    handler: async () => {
      assert.fail('1');
    },
    expect: {status: 400, text: '{"message":"1"}'},
  },
  {
    path: '/error-sync',
    handler: () => {
      throw new HTTPError(401, {message: '1'});
    },
    expect: {status: 401, text: '{"message":"1"}'},
  },
  {
    path: '/regular-error',
    handler: async () => {
      throw new Error('1');
    },
    expect: {status: 500, match: /^{"message":"Internal server error: \w+"}/},
  },
  {
    path: '/throw',
    handler: async () => {
      throw '1';
    },
    expect: {status: 500, match: /^{"message":"Internal server error: \w+"}$/},
  },
  {
    path: '/error-message',
    handler: async () => {
      throw new HTTPError(405, {message: '1'});
    },
    expect: {status: 405, text: '{"message":"1"}'},
  },
  {
    path: '/error-msg-object',
    handler: async () => {
      throw new HTTPError(405, {message: '1', code: 1});
    },
    expect: {status: 405, match: '{"message":"1","code":1}'},
  },
  {
    path: '/error-object',
    handler: async () => {
      // @ts-ignore
      throw new HTTPError(405, {code: 1});
    },
    expect: {status: 405, text: '{"code":1,"message":"{\\"code\\":1}"}'},
  },
];

cases.forEach((c) => {
  app.get(c.path, eph(c.handler));
});

app.use(errorHandler);

let server: Server;
let url: string;

describe('eph', () => {
  before(async () => {
    await new Promise<void>((r) => {
      server = app.listen(0, r);
    });
    const {address: host, port} = server.address() as AddressInfo;
    const hostStr = host.includes(':') ? `[${host}]` : host;
    url = `http://${hostStr}:${port}`;
    console.log({url});
  });
  after(async () => {
    await new Promise((r) => {
      server.close(r);
    });
  });
  cases.forEach((c) => {
    it(c.path.slice(1), async () => {
      const response = await fetch(url + c.path);
      assert.deepEqual(response.status, c.expect.status);
      const textOutput = await response.text();
      if (c.expect.match) assert.match(textOutput, new RegExp(c.expect.match));
      if (c.expect.text) assert.equal(textOutput, c.expect.text);
      const responseType = response.headers.get('content-type');
      assert.ok(responseType);
      if (c.expect.type && responseType) assert.match(responseType, new RegExp(c.expect.type));
    });
  });
});
