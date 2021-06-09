import mongoose from "mongoose";
const { Schema } = mongoose;
import dbMessage from '../../static/dbMessage';

const ChannelSchema = new Schema(
  { 
    /*
    channel_id: {
      type: Number,
      required: [true, dbMessage.ERROR_EMPTY_CHANNEL_ID],
      unique: true
    },*/
    channel_name: {
      type: String,
      required: [true, dbMessage.ERROR_EMPTY_CHANNELNAME]
    },
    num_message: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: {
      createdAt: 'created_at',
    }
  }
);

const ChannelModel = mongoose.model("Channel", ChannelSchema, "Channel");

export default ChannelModel;
