import express from "express";
import UserMessage from "../static/userMessage.js";
import UserController from "../db/controller/userController.js";
import MsgController from "../db/controller/msgController.js";
import jwt from "jsonwebtoken";
import config from "../config.js";
import apiMessage from "../static/apiMessage.js";
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import UserValidator from '../utils/userValidator'

const maxAge = 1 * 24 * 60 * 60 * 1000; // maxAge of 1 day
const createToken = (id) => {
  return jwt.sign({id}, config.secret, {
    expiresIn: maxAge
  });
};
const router = express.Router();

router.post("/register", async (req, res) => {
  const {username, password, email, firstName, lastName, dateOfBirth} =
    req.body;
  let errors = UserValidator.validateRegisterInput(username, password, email, firstName, lastName, dateOfBirth);
  
  if (errors.length > 0) {
    res.json({err: errors});
  } else {
    UserController.createUser(
      username,
      password,
      email,
      firstName,
      lastName,
      dateOfBirth)
      .then((result) => {
        res.status(201).json({
          message: result.message, //Register succeed
        });
      })
      .catch((err) => {
        res.json({err})
      })
  }
});

router.post("/login", async (req, res) => {
  const {username, password} = req.body;
  UserController.loginPost(username, password)
    .then((user) => {
      const token = createToken(user._id);
      res.cookie('jwt', token, {httpOnly: true,maxAge: maxAge * 7,sameSite:'strict'});
      res.status(201).json({
        message: apiMessage.LOGIN_SUCCEED,
        user: {
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        },
        token: token
      });
    })
    .catch((err) => {
      res.status(400).json({errors: err})
    })
});

//check status
router.get("/me", async (req, res) => {
  UserController.findById(req.userId)
    .then((user) => {
      res.json(user)
    })
    .catch((err) => {
      res.send(apiMessage.TOKEN_EXPIRE_INVALIDATE);
    });
})

//getData
router.get("/profile", async (req,res) => {
  const {userId} = req.body;
  const u_id = mongoose.Types.ObjectId(userId);
  UserController.findById(u_id)
  .then((user) => {
    let result = {
      userId: user._id,
      username: user.username,
      name: user.lastName + user.firstName,
    };
    res.json(result);
  })
  .catch((err) => {
    res.send(apiMessage.NOT_FOUND_USER);
  });
})

//adding Friend
router.post("/addFriend", async (req,res) => {
  const {friendName} = req.body;
  UserController.addFriend(req.userId,friendName) //userId get from authMiddleware
    .then((result) => {
      res.status(201).json({message: apiMessage.ADD_FRIEND_SUCCEED});
    })
    .catch((err) => {
      res.status(400).json({error: err});
    })
})

//creating channel
router.post("/createChannel", async (req,res) => {
  const {channelName} = req.body;
  UserController.createChannel(req.userId, channelName) //userId get from authMiddleware
    .then((channel) => {
      res.status(201).json({
        message: apiMessage.CREATING_CHANNEL_SUCCEED,
        channelName: channel.channel_name,
        currentUser: channel.listUser.length
      })
    })
    .catch((err) => {
      res.status(400).json({error: err});
    })
})

router.post("/testApi", async (req,res) => {
  res.status(201).json({
    message: 'Sang dep trai'
  })
})


//join channel
router.post("/joinChannel", async (req,res) => {
  const {channelId} = req.body;
  const c_id = mongoose.Types.ObjectId(channelId);
  UserController.joinChannel(req.userId, c_id) //userId get from authMiddleware
    .then((channel) => {
      res.status(201).json({
        message: apiMessage.JOIN_CHANNEL_SUCCEED,
        channelName: channel.channel_name,
        currentUser: channel.listUser.length
      })
    })
    .catch((err) => {
      res.status(400).json({error: err});
    })
})

//get Top channel
router.get("/topChannel", async (req,res) => {
  UserController.getChannel(req.userId)
    .then((result) => {
      res.status(201).json(result);
    })
    .catch((err) => {
      res.status(400).json(err);
    })
})


router.get("/logout", async (req,res) => {
  res.cookie('jwt','',{maxAge: 1});
  res.json(apiMessage.LOGOUT_DONE);
  //res.redirect('/');
})


export default router;