const User = require("../models/userModel");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.signup = (req, res, next) => {
  console.log("signup method reached");
  console.log("request values: " + req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("validation Failed.");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        email: email,
        password: hashedPassword,
        name: name,
      });
      return user.save();
    })
    .then((newUser) => {
      res
        .status(201)
        .json({ message: "user created successfully", userId: newUser._Id });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let fetchedUser;
  User.findOne({ email: email })
    .then((userDoc) => {
      if (!userDoc) {
        const error = new Error(
          "Authentication faild, email or password is incorrect"
        );
        error.stausCode = 401;
        throw error;
      }
      fetchedUser = userDoc;
      return bcrypt.compare(password, userDoc.password);
    })
    .then((passwordEquality) => {
      if (!passwordEquality) {
        const error = new Error(
          "Authentication faild, email or password is incorrect"
        );
        error.stausCode = 401;
        throw error;
      }
      const token = jwt.sign(
        { email: fetchedUser.email, userId: fetchedUser._id.toString() },
        "somesupersecretsecret",
        { expiresIn: "1h" }
      );
      res
        .status(200)
        .json({ token: token, userId: fetchedUser._id.toString() });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
