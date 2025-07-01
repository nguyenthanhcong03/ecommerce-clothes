const Joi = require("joi");

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

// Schema validation cho tin nhắn chat
const chatMessageSchema = Joi.object({
  message: Joi.string().trim().min(1).max(500).required().messages({
    "string.empty": "Tin nhắn không được để trống",
    "string.min": "Tin nhắn phải có ít nhất 1 ký tự",
    "string.max": "Tin nhắn không được vượt quá 500 ký tự",
    "any.required": "Tin nhắn là bắt buộc",
  }),
});

// Middleware validate tin nhắn chat
const validateChatMessage = validator(chatMessageSchema, "body");

module.exports = {
  validator,
  validateChatMessage,
};
