/**
 * Authentication Middleware
 */

const bcrypt = require("bcrypt");
const debug = require("debug")("books:auth");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

/**
 * HTTP Basic Authentication
 */
const basic = async (req, res, next) => {
  // make sure authorization header exists, otherwise bail
  if (!req.headers.authorization) {
    debug("Autorization header missing");

    return res.status(401).send({
      status: "fail",
      data: "Authorization required",
    });
  }

  debug("Authorization header: %o", req.headers.authorization);
  const [authSchema, base64Payload] = req.headers.authorization.split(" ");

  // if authSchema isn't "basic", then bail
  if (authSchema.toLowerCase() !== "basic") {
    debug("Authorization schema isn't basic");

    return res.status(401).send({
      status: "fail",
      data: "Authorization required",
    });
  }

  // Decode payload from base64 -> ascii
  const decodedPayload = Buffer.from(base64Payload, "base64").toString("ascii");

  // Split decoded payload inte "<usernam>:<password>"
  const [username, password] = decodedPayload.split(":");

  const user = await User.login(username, password);
  if (!user) {
    return res.status(401).send({
      status: "fail",
      data: "Authorization failed",
    });
  }

  // Finally, attach user to request
  req.user = user;

  // pass request along
  next();
};

/**
 * Validate JWT Token
 */
const validateJwtToken = (req, res, next) => {
  // make sure authorization header exists, otherwise bail
  if (!req.headers.authorization) {
    debug("Autorization header missing");

    return res.status(401).send({
      status: "fail",
      data: "Authorization required",
    });
  }

  // split authorization header into "authSchema token"
  const [authSchema, token] = req.headers.authorization.split(" ");
  if (authSchema.toLowerCase() !== "bearer") {
    return res.status(401).send({
      status: "fail",
      data: "Authorization required",
    });
  }

  // verify token (and extract payload)
  try {
    req.user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    return res.status(401).send({
      status: "fail",
      data: "Authorization failed",
    });
  }

  // pass request along
  next();
};

module.exports = {
  basic,
  validateJwtToken,
};
