/**
 * Book Validation Rules
 */
const { body } = require("express-validator");

const createRules = [
  body("title").exists().isString().isLength({ min: 1 }),
  body("isbn").optional().isString().isLength({ min: 8 }),
  body("pages").exists().isInt().isLength({ min: 1 }),
  body("author_id")
    .exists()
    .bail()
    .custom(async (value) => {
      const author = await new models.Author({ id: value }).fetch({
        require: false,
      });
      if (!author) {
        return Promise.reject(`Author with ID ${value} does not exist.`);
      }

      return Promise.resolve();
    }),
];

const updateRules = [
  body("title").optional().isString().isLength({ min: 1 }),
  body("isbn").optional().isString().isLength({ min: 8 }),
  body("pages").optional().isInt().isLength({ min: 1 }),
  body("author_id")
    .optional()
    .custom(async (value) => {
      const author = await new models.Author({ id: value }).fetch({
        require: false,
      });
      if (!author) {
        return Promise.reject(`Author with ID ${value} does not exist.`);
      }

      return Promise.resolve();
    }),
];

module.exports = {
  createRules,
  updateRules,
};
