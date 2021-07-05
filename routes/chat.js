import express from "express";
import UserMessage from "../static/userMessage";
import MsgController from "../db/controller/msgController";
import apiMessage from "../static/apiMessage";
import mongoose from 'mongoose';

const router = express.Router();
//chat in channel
router.post("/:channelId", async (req,res) => {
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

  export default router;