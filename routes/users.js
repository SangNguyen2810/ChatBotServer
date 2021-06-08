import express from "express";
import UserMessage from "../static/userMessage";
import UserController from "../db/controller/userController";
import jwt from "jsonwebtoken";
import config from "../config";
import apiMessage from "../static/apiMessage";

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

  console.log(password);
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
      dateOfBirth)
      .then ((result) => {
        res.status(201).json({
          message: result.message, //Register succeed
        });
      })
      .catch((err)=>{
        res.json({err})
      })
  }
});

router.post("/login", async (req, res) => {
  const {username, password} = req.body;
  UserController.loginPost(username, password)
    .then((user) => {
      const token = createToken(user._id);
      res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 7 });
      res.status(201).json({
        message: apiMessage.LOGIN_SUCCEED,
        user: user.username,
        email: user.email
      });
    })
    .catch((err) => {
      const message = err.message;
      res.status(400).json({ errors: message })
    })
});

router.get("/me", async (req,res) => {
  console.log(req.cookies);
  const token = req.cookies.jwt;
    if (token){
        jwt.verify(token, config.secret, (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.status(403);
            }
            else {
                //Sending userID after decoded
                UserController.findById(decodedToken.id)
                  .then((user) => {
                    res.json(user)
                  })
                  .catch((err) => {
                    res.send(apiMessage.TOKEN_EXPIRE_INVALIDATE);
                  })
            }
        })
    }
})



export default router;