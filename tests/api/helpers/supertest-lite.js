import http from 'node:http';

/**
 * Minimal request helper against an Express app (avoids adding supertest yet).
 * Reason: keep Phase 1 dependencies lean while enabling HTTP-level tests.
 *
 * @param {import('express').Express} app
 */
export default function request(app) {
  return {
    get(path) {
      return send(app, 'GET', path);
    },
    post(path, body) {
      return send(app, 'POST', path, body);
    },
    put(path, body) {
      return send(app, 'PUT', path, body);
    },
    patch(path, body) {
      return send(app, 'PATCH', path, body);
    },
    delete(path) {
      return send(app, 'DELETE', path);
    },
  };
}

/**
 * @param {import('express').Express} app
 * @param {string} method
 * @param {string} path
 * @param {unknown} [body]
 * @param {Record<string, string>} [headers]
 */
export function send(app, method, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        server.close();
        reject(new Error('Failed to bind test server'));
        return;
      }

      const payload = body === undefined ? null : JSON.stringify(body);
      const req = http.request(
        {
          hostname: '127.0.0.1',
          port: address.port,
          path,
          method,
          headers: {
            Accept: 'application/json',
            ...(payload
              ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
              : {}),
            ...headers,
          },
        },
        (res) => {
          const chunks = [];
          res.on('data', (c) => chunks.push(c));
          res.on('end', () => {
            const raw = Buffer.concat(chunks).toString('utf8');
            let parsed;
            try {
              parsed = raw ? JSON.parse(raw) : null;
            } catch {
              parsed = raw;
            }
            server.close(() => {
              resolve({
                status: res.statusCode,
                headers: res.headers,
                body: parsed,
                text: raw,
              });
            });
          });
        }
      );

      req.on('error', (err) => {
        server.close(() => reject(err));
      });

      if (payload) req.write(payload);
      req.end();
    });
  });
}

/**
 * Fluent chain supporting headers for authenticated calls.
 * @param {import('express').Express} app
 */
export function agent(app) {
  return {
    get(path) {
      return {
        set(headerMap) {
          return send(app, 'GET', path, undefined, headerMap);
        },
        then(onFulfilled, onRejected) {
          return send(app, 'GET', path).then(onFulfilled, onRejected);
        },
      };
    },
    post(path) {
      return {
        set(headerMap) {
          return {
            send(body) {
              return send(app, 'POST', path, body, headerMap);
            },
          };
        },
        send(body) {
          return send(app, 'POST', path, body);
        },
      };
    },
  };
}
