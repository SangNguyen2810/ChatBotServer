import mongoose from "mongoose";
const { Schema } = mongoose;
import dbMessage from '../../static/dbMessage.js';

const ChannelSchema = new Schema(
  { 
    channelName: {
      type: String,
      required: [true, dbMessage.ERROR_EMPTY_CHANNELNAME]
    },
    numMessage: {
      type: Number,
      default: 0
    },
    listUser: [{
      type: Schema.Types.ObjectId,
      ref: "User",
    }]
  },
  {
    timestamps: {
      createdAt: 'created_at',
    }
  }
);

const ChannelModel = mongoose.model("Channel", ChannelSchema, "Channel");

export default ChannelModel;
