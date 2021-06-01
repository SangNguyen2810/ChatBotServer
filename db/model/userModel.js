import mongoose from "mongoose";
const { Schema } = mongoose;

const UserSchema = new Schema({
  username: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
  },
  firstName: {
    type: String,
    require: true,
  },
  lastName: {
    type: String,
    require: true,
  },
  dateOfBirth: {
    type: Date,
    require: true,
  },

});
const UserModel = mongoose.model("User", UserSchema, "User");

export default UserModel;
