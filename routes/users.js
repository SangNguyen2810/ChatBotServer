import express from "express";
import UserMessage from "../static/userMessage";
import UserController from "../db/controller/userController";
import jwt from "jsonwebtoken";
import config from "../config";

const maxAge = 1 * 24 * 60 * 60; // maxAge of 1 day
const createToken = (id) => {
  return jwt.sign({ id }, config.secret, {
      expiresIn: maxAge
  });
};
const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, password, email, firstName, lastName, dateOfBirth } =
    req.body;
  let errors = [];

  if (!firstName || !lastName || !username || !email || !dateOfBirth) {
    errors.push({ err: UserMessage.FIELDS_CAN_NOT_EMPTY });
  }

  if (password.length < 6) {
    errors.push({ err: UserMessage.PASSWORD_NOT_ENOUGH_LENGTH });
  }

  if (errors.length > 0) {
    res.json({ err: errors });
  } else {
    UserController.createUser(
      username,
      password,
      email,
      firstName,
      lastName,
      dateOfBirth
    ).then ((result) => {
        res.json({result});
      }
    )
  }
});

router.post("/login", async (req, res) => {
  const {username, password} = req.body;
  UserController.loginPost(username, password)
    .then((user) => {
      const token = createToken(user._id);
      res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 7 });
      res.status(201).json({
       user: user._id,
       token: token
      });
    })
    .catch((err) => {
      const message = err.message;
      res.status(400).json({ errors: message })
    })
});



export default router;