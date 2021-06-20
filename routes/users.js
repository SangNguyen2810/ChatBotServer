import express from "express";
import UserMessage from "../static/userMessage";
import UserController from "../db/controller/userController";
import MsgController from "../db/controller/msgController";
import jwt from "jsonwebtoken";
import config from "../config";
import apiMessage from "../static/apiMessage";
import mongoose from 'mongoose';
import MsgModel from "../db/model/msgModel";
import cookieParser from 'cookie-parser';

const maxAge = 1 * 24 * 60 * 60; // maxAge of 1 day
const createToken = (id) => {
  return jwt.sign({id}, config.secret, {
    expiresIn: maxAge
  });
};
const router = express.Router();

router.post("/register", async (req, res) => {
  const {username, password, email, firstName, lastName, dateOfBirth} =
    req.body;
  let errors = [];

  if (!firstName) {
    errors.push({err: UserMessage.FIRST_NAME_CAN_NOT_EMPTY})
  }
  if (!lastName) {
    errors.push({err: UserMessage.LAST_NAME_CAN_NOT_EMPTY})
  }
  if (!username) {
    errors.push({err: UserMessage.USERNAME_CAN_NOT_EMPTY})
  }
  if (!password) {
    errors.push({err: UserMessage.PASSWORD_CAN_NOT_EMPTY})
  }
  if (!email) {
    errors.push({err: UserMessage.EMAIL_CAN_NOT_EMPTY})
  }
  if (!dateOfBirth) {
    errors.push({err: UserMessage.DATE_OF_BIRTH_CAN_NOT_EMPTY})
  }

  console.log(JSON.stringify(errors));
  if (password.length < 6) {
    errors.push({err: UserMessage.PASSWORD_NOT_ENOUGH_LENGTH});
  }

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
      res.cookie('jwt', token, {httpOnly: true,maxAge: maxAge * 7});
      res.status(201).json({
        message: apiMessage.LOGIN_SUCCEED,
        user: username,
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

//chat in channel
router.post("/chat/:channelId", async (req,res) => {
  const {message} = req.body;
  const c_id = mongoose.Types.ObjectId(req.params.channelId);
  MsgController.createMsg(c_id, req.userId, message) //userId get from authMiddleware
    .then((result) => {
      res.status(201).json({
        message: apiMessage.CHAT_SUCCEED,
        channelId: req.params.channelId,
        username: result.username,
        chatMessage: message,
        createdAt: result.createdAt
      });
    })
    .catch((err) => {
      res.status(400).send(err);
    })
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
  const {channel_name} = req.body;
  UserController.createChannel(req.userId, channel_name) //userId get from authMiddleware
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