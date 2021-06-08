import mongoose from "mongoose";
const { Schema } = mongoose;
import bcrypt from "bcrypt";
import { isEmail } from 'validator';
const saltRounds = 10;

const UserSchema = new Schema({
  username: {
    type: String,
    required: [true, 'Please enter an username'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Please enter a password'],
    minlength: [6, 'minimum password length is 6']
  },
  email: {
    type: String,
    required: [true, 'Please enter an email'],
    validate: [isEmail, 'Please enter a validate email']
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },

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
