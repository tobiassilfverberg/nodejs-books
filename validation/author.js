/**
 * Author Validation Rules
 */
const { body } = require("express-validator");

const createRules = [
  body("first_name").exists().isString().isLength({ min: 2 }),
  body("last_name").exists().isString().isLength({ min: 2 }),
  body("birthyear").exists().isInt().isLength({ min: 3 }),
];

const updateRules = [
  body("first_name").optional().isString().isLength({ min: 2 }),
  body("last_name").optional().isString().isLength({ min: 2 }),
  body("birthyear").optional().isInt().isLength({ min: 3 }),
];

module.exports = {
  createRules,
  updateRules,
};
