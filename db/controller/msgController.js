import MsgModel from "../model/msgModel";
import ChannelModel from "../model/channelModel";
import UserModel from "../model/userModel";
import DbMessage from "../../static/dbMessage";
import apiMessage from "../../static/apiMessage";
import connect from '../mongoManager';
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
    channel_id,
    user_id,
    message
  ) {
    return new Promise(async (resolve, reject) => {
      //Split message into chunk of messages with approriate length to put in db
      try {
        const user = await UserModel.findById(user_id, {password: 0});
        if (!user) {
          //Wrong ID means Token is wrong/invalidate
          console.log(apiMessage.TOKEN_EXPIRE_INVALIDATE);
          return reject(apiMessage.TOKEN_EXPIRE_INVALIDATE);
        }
        else try {
          const channel = await ChannelModel.findById(channel_id);
          if (!channel) {
            console.log(apiMessage.NOT_FOUND_CHANNEL);
            return reject (apiMessage.NOT_FOUND_CHANNEL);
          }
          else if (!channel.listUser.includes(user_id)) {
            console.log(apiMessage.USER_NOT_IN_CHANNEL);
            return reject (apiMessage.USER_NOT_IN_CHANNEL);
          }
          else {
            const message_id = channel.num_message;
            const chunkMsg = this.chunkMsg(message);
            for (let i = 0; i< chunkMsg.length; ++i) {
              let msg = chunkMsg[i];
              try {
                console.log(i);
                await MsgModel.create({
                  channel_id: channel_id,
                  message_id: message_id,
                  part_id: i,
                  username: user.username,
                  message_text: msg
                })
              }
              catch (e) {
                //de tam
                console.log('error at:' + i + 'th chunk of total ' + chunkMsg.length + ' chunks');
                console.log(DbMessage.DBERROR_SAVING_MESSAGE);
                if (i != 0){
                  channel.num_message = channel.num_message+1;
                  channel.save();
                }
                return reject (DbMessage.DBERROR_SAVING_MESSAGE);
              }   
            }
            channel.num_message = channel.num_message+1;
            channel.save();
            return resolve({
              username: user.username,
              //Message created time = channel current updated time
              createdAt: channel.updatedAt, 
            });
          }
        } 
        catch (e) {
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
}


const msgControllerInstance = new MsgController();

export default msgControllerInstance;