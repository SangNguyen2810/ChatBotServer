import MsgModel from "../../graphql/model/msgModel.js";
import ChannelModel from "../../graphql/model/channelModel.js";
import UserModel from "../../graphql/model/userModel.js";
import DbMessage from "../../static/dbMessage.js";
import apiMessage from "../../static/apiMessage.js";
const MAX_MONGODB_CHAR_LENGTH = 10;

class MsgController {
  constructor() {
  }

  handleErrors(err) {
    let errors = {};
    if (err._message.includes('Chat validation failed')) {
      Object.values(err.errors).forEach(({properties}) => {
        errors[properties.path] = properties.message;
      });
    }
    return errors;
  }

  chunkMsg(message) {
    const numChunks = Math.ceil(message.length/MAX_MONGODB_CHAR_LENGTH);
    const chunks = new Array(numChunks);
    for (let i = 0, o = 0; i < numChunks; ++i, o += MAX_MONGODB_CHAR_LENGTH) {
      chunks[i] = message.substr(o, MAX_MONGODB_CHAR_LENGTH);
    }
    return chunks;
  }

  async createMsg(
    channelId,
    userId,
    message
  ) {
    return new Promise(async (resolve, reject) => {
      //Split message into chunk of messages with approriate length to put in db
      try {
        const user = await UserModel.findById(userId, {password: 0});
        if (!user) {
          //Wrong ID means Token is wrong/invalidate
          console.log(apiMessage.TOKEN_EXPIRE_INVALIDATE);
          return reject(apiMessage.TOKEN_EXPIRE_INVALIDATE);
        }
        else try {
          const channel = await ChannelModel.findById(channelId);
          if (!channel) {
            console.log(apiMessage.NOT_FOUND_CHANNEL);
            return reject (apiMessage.NOT_FOUND_CHANNEL);
          }
          else if (!channel.listUser.includes(userId)) {
            console.log(apiMessage.USER_NOT_IN_CHANNEL);
            return reject (apiMessage.USER_NOT_IN_CHANNEL);
          }
          else {
            const messageId = channel.numMessage;
            const chunkMsg = this.chunkMsg(message);
            let msgType = 0; //normal message
            if (chunkMsg.length >1 )
            {
              msgType = 1; //multi message
            }
            const errors = [];
            for (let i = 0; i< chunkMsg.length; ++i) {
              let msg = chunkMsg[i];
              try {
                await MsgModel.create({
                  channelId: channelId,
                  messageId: messageId,
                  partId: i,
                  username: user.username,
                  msgType: msgType,
                  messageText: msg
                })
              }
              catch (e) {
                //de tam
                const errorAt = (`error at ${i} chunk`);
                const error = {
                  errorAt: errorAt,
                  error: e,
                };
                errors.push(error);
              }   
            }
            if (errors.length == chunkMsg.length) {
              return reject (apiMessage.ALL_MSG_FAIL);
            }
            else {
              channel.numMessage = channel.numMessage+1;
              channel.save();
              if (errors.length == 0) {
                return resolve({
                  username: user.username,
                  //Message created time = channel current updated time
                  createdAt: channel.updatedAt, 
                });
              }
              else {
                const error = {};
                error['message'] = apiMessage.MSG_FAIL;
                errors.forEach((err) => {
                  error[err.errorAt] = err.error;
                });
                return reject(error);
              }
            }
          }
        } 
        catch (e) {
          console.log(e);
          console.log(DbMessage.DBERROR_FIND_CHANNEL_BY_ID);
          return reject (DbMessage.DBERROR_FIND_CHANNEL_BY_ID);
        }
      }
      catch (e) {
        console.log(DbMessage.DBERROR_FIND_USER_BY_ID);
        return reject(DbMessage.DBERROR_FIND_USER_BY_ID);
      }
    })
  }

  async getFullTextMsg (message) {
    return new Promise (async (resolve, reject) => {
      MsgModel
        .find({messageId: message.messageId})
        .exec(function (err, messages) {
          if (err) {
            return reject (err);
          }
          else {
            let messageText = '';
            messages.forEach((message) => {
              messageText = messageText + message.messageText;
            })
            const result = {
              content: messageText,
              channelId: message.channelId,
              messageId: message.messageId,
              msgType: message.msgType,
              sendTime: message.created_at,
            };
            return resolve(result);
          }
        })
    })
  }
}


const msgControllerInstance = new MsgController();

export default msgControllerInstance;