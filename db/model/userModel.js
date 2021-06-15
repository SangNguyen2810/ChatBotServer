import mongoose from "mongoose";
const { Schema } = mongoose;
import bcrypt from "bcrypt";
import dbMessage from '../../static/dbMessage';
import { isEmail } from 'validator';
const saltRounds = 10;

const UserSchema = new Schema({
  username: {
    type: String,
    required: [true, dbMessage.ERROR_EMPTY_USERNAME],
    unique: true
  },
  password: {
    type: String,
    required: [true, dbMessage.ERROR_EMPTY_PASSWORD],
    minlength: [6, dbMessage.ERROR_PASSWORD_INSUFFICIENT_LENGTH]
  },
  email: {
    type: String,
    required: [true, dbMessage.ERROR_EMPTY_EMAIL],
    validate: [isEmail, dbMessage.ERROR_INVALIDATE_EMAIL]
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  listFriend: [{
    type: Schema.Types.ObjectId
  }],
  listChannel: [{
    type: Schema.Types.ObjectId
  }]
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});


const UserModel = mongoose.model("User", UserSchema, "User");

export default UserModel;
