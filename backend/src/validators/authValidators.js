const { body } = require('express-validator');

const signupValidator = [
  body('name').isString().trim().isLength({ min: 2, max: 80 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isString().isLength({ min: 8, max: 128 }),
  body('role').optional().isIn(['donor', 'creator', 'admin'])
];

const loginValidator = [
  body('email').isEmail().normalizeEmail(),
  body('password').isString().isLength({ min: 1, max: 128 })
];

module.exports = { signupValidator, loginValidator };
