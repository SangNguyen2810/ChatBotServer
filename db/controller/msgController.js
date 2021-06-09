import MsgModel from "../model/msgModel";
import ChannelModel from "../model/channelModel";
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
    username,
    message
  ) {
    return new Promise(async (resolve, reject) => {
      //Split message into chunk of messages with approriate length to put in db

      ChannelModel.findById({_id: channel_id}, (err, channel) => {
        if (err) {
          return reject (err.message);
        }
        else {
          console.log("findID");
          const message_id = channel.num_message;
          console.log(message_id);
          const chunkMsg = this.chunkMsg(message);
          for (let i = 0; i< chunkMsg.length; ++i) {
            let msg = chunkMsg[i];
            MsgModel.create({
              channel_id: channel_id,
              message_id: message_id,
              part_id: i,
              username: username,
              message_text: msg
            }).catch((err) => {
              return reject (err.message);
            }) 
          }
          channel.num_message = channel.num_message+1;
          channel.save();
          return resolve(true);
        }
      })
    })
  }
}


const msgControllerInstance = new MsgController();

export default msgControllerInstance;