/**
 * Middleware for validating request data using Joi schemas
 * @param {Object} schema - Joi validation schema
 * @param {String} property - Which part of the request to validate (body, params, query)
 * @returns {Function} Express middleware function
 */
const validator = (schema, property = "body") => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], { abortEarly: false });

    if (!error) {
      return next();
    }

    const errors = error.details.map((detail) => ({
      message: detail.message,
      path: detail.path,
    }));

    return res.status(400).json({
      status: "error",
      message: "Validation error",
      errors,
    });
  };
};

module.exports = validator;
