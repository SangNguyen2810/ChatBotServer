import mongoose from 'mongoose';
const { Schema } = mongoose;


const UserSchema = new Schema({
  username: String,
  password: String,
});
const UserModel = mongoose.model("User", UserSchema, "User");


export default UserModel;