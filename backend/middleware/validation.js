const { body, param, query } = require('express-validator');

// Email validation
const validateEmail = () => {
  return body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
    .isLength({ max: 255 })
    .withMessage('Email must be less than 255 characters');
};

// Password validation
const validatePassword = (fieldName = 'password') => {
  return body(fieldName)
    .trim()
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#)')
    .not()
    .matches(/^(.{0,7}|[^0-9]*|[^A-Z]*|[^a-z]*|[a-zA-Z0-9]*)$/)
    .withMessage('Password is too weak');
};

// Full name validation
const validateFullName = () => {
  return body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Full name can only contain letters, spaces, hyphens, and apostrophes')
    .escape();
};

// MongoDB ObjectId validation
const validateObjectId = (paramName = 'id') => {
  return param(paramName)
    .isMongoId()
    .withMessage('Invalid ID format');
};

// Pagination validation
const validatePagination = () => {
  return [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer')
      .toInt(),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
      .toInt()
  ];
};

// Sanitize string input
const sanitizeString = (fieldName) => {
  return body(fieldName)
    .trim()
    .escape()
    .isLength({ max: 500 })
    .withMessage(`${fieldName} must be less than 500 characters`);
};

module.exports = {
  validateEmail,
  validatePassword,
  validateFullName,
  validateObjectId,
  validatePagination,
  sanitizeString
};

