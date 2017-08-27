
exports.HTTPError = class HTTPError extends Error {
  /**
   * @param {integer} code
   * @param {any} obj
   */
  constructor(code, obj) {
    super(obj);
    this.code = code;
  }
};

exports.default = (promiseFunction) => {
  return (req, res) => {
    new Promise((resolve, reject) => {
      resolve(promiseFunction(req));
    })
      .catch((e) => {
        console.log('Error caught: ', e);
        res.status(e.code || 500);
        return e.message || 'Internal server error';
      })
      .then((data) => {
        if (typeof data === 'object') {
          return res.json(data);
        } else if (typeof data === 'string') {
          return res.send(data);
        }
        res.send(data.toString());
      });
  };
};
