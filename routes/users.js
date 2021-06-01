import express from "express";
import UserMessage from "../static/userMessage";
import UserController from "../db/controller/userController";

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
    );
  }
});
