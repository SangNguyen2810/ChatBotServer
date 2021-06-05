import mongoose from "mongoose";
const { Schema } = mongoose;
import bcrypt from "bcrypt";
const saltRounds = 10;

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

UserSchema.statics.login = async function (username, password) {
  const user = await this.findOne({username: username}) 
  if (user) {
    const auth = await bcrypt.compare (password, user.password);
    if (auth) {
      console.log("found user");
      return user;
    }
    else {
      throw Error("Incorrect Password!");
    }
  }
  else throw ("User not existed!");
}

const UserModel = mongoose.model("User", UserSchema, "User");

export default UserModel;
