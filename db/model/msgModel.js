import mongoose from "mongoose";
const { Schema } = mongoose;
import dbMessage from '../../static/dbMessage';

const MsgSchema = new Schema(
  {
    channel_id: {
      type: Schema.Types.ObjectId,
      required: [true, dbMessage.ERROR_EMPTY_CHANNEL_ID]
    },
    message_id: {
      type: Number,
      required: [true, dbMessage.ERROR_EMPTY_MESSAGE_ID],
    },
    part_id:{//Part of the message
      type: Number,
      required: [true, dbMessage.ERROR_EMPTY_PART_ID],
    },
    username: {
      type: String,
      required: [true, dbMessage.ERROR_EMPTY_USERNAME]
    },
    message_text: {
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
