/**
 * Profile Validation Rules
 */
const { body } = require("express-validator");
const models = require("../models");

// Allow everything but password to be updated
const updateRules = [
  body("password").optional().isLength({ min: 6 }),
  body("first_name").optional().isString().isLength({ min: 2 }),
  body("last_name").optional().isString().isLength({ min: 2 }),
];

const addBookRules = [
  body("book_id")
    .exists()
    .bail()
    .custom(async (value) => {
      const book = await new models.Author({ id: value }).fetch({
        require: false,
      });
      if (!book) {
        return Promise.reject(`Book with ID ${value} does not exist.`);
      }

      return Promise.resolve();
    }),
];

module.exports = {
  updateRules,
  addBookRules,
};
