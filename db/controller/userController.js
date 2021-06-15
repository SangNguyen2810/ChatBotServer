import UserModel from "../model/userModel";
import ChannelModel from "../model/channelModel";
import DbMessage from "../../static/dbMessage";
import apiMessage from "../../static/apiMessage";
import connect from '../mongoManager';
import bcrypt from 'bcrypt';

class UserController {
  constructor() {
  }

  handleErrors(err) {
    let errors = {};
    if (err._message.includes('User validation failed')) {
      Object.values(err.errors).forEach(({properties}) => {
        errors[properties.path] = properties.message;
      });
    }
    return errors;
  }

  async createUser(
    username,
    password,
    email,
    firstName,
    lastName,
    dateOfBirth
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        const exist = await this.doUserExist(username);
        console.log("createUser exist: ", exist);
        if (exist) {
          return reject({
            err: DbMessage.USER_ALREADY_EXISTS,
            username,
          });
        } else {
          this.createUserDB(
            username,
            password,
            email,
            firstName,
            lastName,
            dateOfBirth)
            .then((res) => {
              return resolve({ 
                id: res,
                message: DbMessage.CREATE_USER_SUCCESS
              });
            })
            .catch((err) => {
              return reject(err);
            });
        }
      } catch (e) {

        return reject(e);
      }
    })
  }

  createUserDB(username, password, email, firstName, lastName, dateOfBirth) {
    return new Promise((resolve, reject) => {
      UserModel.create({
        username: username,
        password: password,
        email: email,
        firstName: firstName,
        lastName: lastName,
        dateOfBirth: dateOfBirth})
        .then((user) => {
          return resolve(user._id);
        })
        .catch((err) => {
          const errors = this.handleErrors(err);
          return reject(errors);
        })
    })
  }

  doUserExist(username) {
    return new Promise((resolve, reject) => {
      UserModel.find({username: username}, (err, docs) => {
        if (err) return reject(err);
        if (docs.length > 0) {
          return resolve(true);
        }
        ;
        return resolve(false);
      })
    })
  }

  async loginPost(username, password) {
    return new Promise (async (resolve, reject) => {
      try {
        const user = await UserModel.findOne({username: username});
        if (user) {
          const auth = await bcrypt.compare(password, user.password);
          if (auth) {
            return resolve(user);
          } 
          else {
            console.log(apiMessage.INCORRECT_PASSWORD);
            return reject(apiMessage.INCORRECT_PASSWORD);
          }
        } 
        else {
          console.log(apiMessage.INCORRECT_USERNAME)
          return reject(apiMessage.INCORRECT_USERNAME);
        }
      }
      catch (e) {
        console.log(DbMessage.DBERROR_FIND_USER_BY_NAME);
        return reject (DbMessage.DBERROR_FIND_USER_BY_NAME);
      }
    })
  }

  async findById (id) {
    return new Promise(async (resolve, reject) => {
      console.log('User Controller: Finding user by ID');
      UserModel.findById(id, {password: 0}, (err,user) => {
        if (err) {
          console.log(DbMessage.DBERROR_FIND_USER_BY_ID);
          return reject(DbMessage.DBERROR_FIND_USER_BY_ID);
        }
        else if (!user) {
          console.log(apiMessage.NOT_FOUND_USER);
          return reject(apiMessage.NOT_FOUND_USER);
        }
        else return resolve(user);
      })
    })
  }

  async addFriend (user_id, friendName) {
    return new Promise (async (resolve, reject) => {
      console.log("Adding friend");
      try {
        const user = await UserModel.findById(user_id);
        if (!user) {
          //Wrong ID means Token is wrong/invalidate
          console.log(apiMessage.TOKEN_EXPIRE_INVALIDATE);
          return reject(apiMessage.TOKEN_EXPIRE_INVALIDATE);
        }
        else try {
          const friend = await UserModel.findOne({username: friendName})
          if (!friend) {
            console.log(apiMessage.NOT_FOUND_USER);
            return reject (apiMessage.NOT_FOUND_USER);
          }
          else if (user.listFriend.includes(friend._id)) {
            console.log(apiMessage.USER_ALREADY_FRIEND);
            return reject (apiMessage.USER_ALREADY_FRIEND);
          }
          else {
            try {
              user.listFriend.push(friend._id);
              user.save();
              friend.listFriend.push(user._id);
              friend.save();
              return resolve(true);
            }
            catch (err) {
              return reject(err.message);
            }
          }
        } 
        catch (e) {
          console.log (DbMessage.DBERROR_FIND_USER_BY_NAME);
          console.log("a");
          return reject (DbMessage.DBERROR_FIND_USER_BY_NAME);
        }
      } 
      catch (e) {
        console.log(DbMessage.DBERROR_FIND_USER_BY_ID);
        return reject(DbMessage.DBERROR_FIND_USER_BY_ID);
      }
    })
  }

  async joinChannel (user_id, channel_id) {
    return new Promise (async (resolve, reject) => {
      try {
        const user = await UserModel.findById(user_id);
        if (!user) {
          //Wrong ID means Token is wrong/invalidate
          console.log(apiMessage.TOKEN_EXPIRE_INVALIDATE);
          return reject(apiMessage.TOKEN_EXPIRE_INVALIDATE);
        }
        else if (user.listChannel.includes(channel_id)) {
          console.log(apiMessage.USER_ALREADY_IN_CHANNEL);
          return reject (apiMessage.USER_ALREADY_IN_CHANNEL);
        }
        else try {
          const channel = await ChannelModel.findById(channel_id);
          if (!channel) {
            console.log(apiMessage.NOT_FOUND_CHANNEL);
            return reject (apiMessage.NOT_FOUND_CHANNEL);
          }
          else {
            try {
              user.listChannel.push(channel._id);
              channel.listUser.push(user._id);
              user.save();
              channel.save();
              return resolve(channel);
            }
            catch (err) {
              return reject(err.message);
            }
          }
        }
        catch (e) {
          console.log(DbMessage.DBERROR_FIND_CHANNEL_BY_ID);
          return reject (DbMessage.DBERROR_FIND_CHANNEL_BY_ID);
        }
      }
      catch (e) {
        console.log(DbMessage.DBERROR_FIND_USER_BY_ID);
        return reject(DbMessage.DBERROR_FIND_USER_BY_ID);
      }
    })
  }

  async createChannel (user_id, channel_name) {
    return new Promise (async (resolve, reject) => {
      try {
        const user = await UserModel.findById(user_id);
        if (!user) {
          //Wrong ID means Token is wrong/invalidate
          console.log(apiMessage.TOKEN_EXPIRE_INVALIDATE);
          return reject(apiMessage.TOKEN_EXPIRE_INVALIDATE);
        }
        else {
          try {
            await ChannelModel.create({
              channel_name: channel_name,
              listUser: [user_id]
            }).then((channel) => {
              user.listChannel.push(channel._id);
              user.save();
              return resolve(channel);
            })
          }
          catch (e) {
            console.log(DbMessage.DBERROR_CREATING_CHANNEL);
            return reject (DbMessage.DBERROR_CREATING_CHANNEL);
          }
        }
      }
      catch (e) {
        console.log(DbMessage.DBERROR_FIND_USER_BY_ID);
        return reject (DbMessage.DBERROR_FIND_USER_BY_ID);
      }
    })
  }

}


const userControllerInstance = new UserController();

export default userControllerInstance;
