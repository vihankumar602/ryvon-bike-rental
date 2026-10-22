const { ZodError } = require('zod');
const { badRequest } = require('../utils/errors');

/** validate({ body, query, params }) - replaces each with the parsed (trimmed/coerced/stripped) value. */
module.exports = (schemas) => (req, res, next) => {
  try {
    for (const part of ['params', 'query', 'body']) {
      if (schemas[part]) {
        const input = part === 'body' && req.body === undefined ? {} : req[part];
        req[part] = schemas[part].parse(input);
      }
    }
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const details = err.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
      return next(badRequest('Validation failed', details));
    }
    next(err);
  }
};
