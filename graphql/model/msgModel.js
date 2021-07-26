import mongoose from "mongoose";
const { Schema } = mongoose;
import dbMessage from '../../static/dbMessage.js';

const MsgSchema = new Schema(
  {
    channelId: {
      type: Schema.Types.ObjectId,
      required: [true, dbMessage.ERROR_EMPTY_CHANNEL_ID]
    },
    messageId: {
      type: Number,
      required: [true, dbMessage.ERROR_EMPTY_MESSAGE_ID],
    },
    partId:{//Part of the message
      type: Number,
      required: [true, dbMessage.ERROR_EMPTY_PART_ID],
    },
    username: {
      type: String,
      required: [true, dbMessage.ERROR_EMPTY_USERNAME]
    },
    msgType: {
      type: Number,
      required: true,
    },
    messageText: {
      type: String,
    }
  },
  {
    timestamps: {
      createdAt: 'created_at'
    }
  }
);

MsgSchema.index({
  channel_id: 1,
  message_id: 1,
  part_id: 1
}, {
  unique: true
})


const MsgModel = mongoose.model("Message" ,MsgSchema, "Message");

export default MsgModel;
