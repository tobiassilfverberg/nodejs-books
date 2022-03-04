/**
 * Profile Controller
 */

const bcrypt = require("bcrypt");
const debug = require("debug")("books:profile_controller");
const { matchedData, validationResult } = require("express-validator");
const models = require("../models");
const User = require("../models/User");

/**
 * Get authenticated users profile
 *
 * GET /
 */
const getProfile = async (req, res) => {
  try {
    const user = await models.User.fetchById(req.user.user_id);

    res.send({
      status: "success",
      data: {
        user,
      },
    });
  } catch {
    res.status(404).send({
      status: "no info for u",
    });
  }
};

/**
 * Update an authenticated users profile
 *
 * PUT /
 */
const updateProfile = async (req, res) => {
  // check for any validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).send({ status: "fail", data: errors.array() });
  }

  // get only the validated data from the request
  const validData = matchedData(req);
  if (validData.password) {
    try {
      validData.password = await bcrypt.hash(
        validData.password,
        models.User.hashSaltRounds
      );
    } catch (error) {
      res.status(500).send({
        status: "error",
        message: "Exception thrown in database when hashing the password.",
      });
      throw error;
    }
  }

  try {
    const updatedUser = await req.user.save(validData);
    debug("Updated user successfully: %O", updatedUser);

    res.send({
      status: "success",
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    res.status(500).send({
      status: "error",
      message: "Exception thrown in database when updating a new user.",
    });
    throw error;
  }
};

/**
 * Get authenticated users books
 *
 * GET /books
 */
const getBooks = async (req, res) => {
  // lazy load books
  const user = await models.User.fetchById(req.user.user_id);
  // await req.user.load(["books"]);

  // const user = await new models.User({ id: req.user.id }).fetch({
  //   withRelated: "books",
  // });

  res.send({
    status: "success",
    data: {
      books: user.related("books"),
    },
  });
};

/**
 * Add a book to the authenticated user
 *
 * POST /books
 * {
 *   book_id: 5
 * }
 */
const addBook = async (req, res) => {
  // check for any validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).send({ status: "fail", data: errors.array() });
  }

  // get only the validated data from the request
  const validData = matchedData(req);

  // lazy-load book relationship
  await req.user.load("books");

  // get the users books
  const books = req.user.related("books");

  // check if book is already in users list
  /* let existing_book = null;
  books.forEach((book) => {
    if (book.id == validData.book_id) {
      existing_book = book;
    }
  }); */

  const existing_book = books.find((book) => book.id == validData.book_id);

  if (existing_book) {
    return res.send({
      status: "fail",
      data: "Book already exists.",
    });
  }

  try {
    const result = await req.user.books().attach(validData.book_id);
    // ta bort specifik bok
    //const result = await req.user.books().detach(validData.book_id);
    // ta bort alla böcker
    // const result = await req.user.books().detach();
    debug("Added book to user successfully: %O", result);

    res.send({
      status: "success",
      data: {
        result,
      },
    });
  } catch (error) {
    res.status(500).send({
      status: "error",
      message: "Exception thrown in database when adding a book to a user.",
    });
    throw error;
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getBooks,
  addBook,
};
