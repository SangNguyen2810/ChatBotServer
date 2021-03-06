import UserModel from "../../graphql/model/userModel.js";
import ChannelModel from "../../graphql/model/channelModel.js";
import MsgModel from "../../graphql/model/msgModel.js";
import MsgController from "../controller/msgController.js";
import DbMessage from "../../static/dbMessage.js";
import apiMessage from "../../static/apiMessage.js";
import bcrypt from "bcrypt";

class UserController {
  constructor() {}

  handleErrors(err) {
    let errors = {};
    if (err._message.includes("User validation failed")) {
      Object.values(err.errors).forEach(({ properties }) => {
        errors[properties.path] = properties.message;
      });
    } else if (err._message.includes("Channel validation failed")) {
      Object.values(err.errors).forEach(({ properties }) => {
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
        this.createUserDB(
          username,
          password,
          email,
          firstName,
          lastName,
          dateOfBirth
        )
          .then((res) => {
            return resolve(res);
          })
          .catch((err) => {
            return reject(err);
          });
      } catch (e) {
        return reject(e);
      }
    });
  }

  createUserDB(username, password, email, firstName, lastName, dateOfBirth) {
    return new Promise((resolve, reject) => {
      UserModel.create({
        username: username,
        password: password,
        email: email,
        firstName: firstName,
        lastName: lastName,
        dateOfBirth: dateOfBirth,
      })
        .then((res) => {
          return resolve({
            ...res._doc,
            id: res._id,
          });
        })
        .catch((err) => {
          const errors = this.handleErrors(err);
          return reject(errors);
        });
    });
  }

  doUserExist(username) {
    return new Promise((resolve, reject) => {
      UserModel.find({ username: username }, (err, docs) => {
        if (err) return reject(err);
        if (docs.length > 0) {
          return resolve(true);
        }
        return resolve(false);
      });
    });
  }

  async loginPost(username, password) {
    return new Promise(async (resolve, reject) => {
      try {
        const user = await UserModel.findOne({ username: username });
        if (user) {
          const auth = await bcrypt.compare(password, user.password);
          if (auth) {
            return resolve(user);
          } else {
            console.log(apiMessage.INCORRECT_PASSWORD);
            return reject(apiMessage.INCORRECT_PASSWORD);
          }
        } else {
          console.log(apiMessage.INCORRECT_USERNAME);
          return reject(apiMessage.INCORRECT_USERNAME);
        }
      } catch (e) {
        console.log(DbMessage.DBERROR_FIND_USER_BY_NAME);
        return reject(DbMessage.DBERROR_FIND_USER_BY_NAME);
      }
    });
  }

  async findById(id) {
    return new Promise(async (resolve, reject) => {
      console.log("User Controller: Finding user by ID");
      UserModel.findById(id, { password: 0 }, (err, user) => {
        if (err) {
          console.log(DbMessage.DBERROR_FIND_USER_BY_ID);
          return reject(DbMessage.DBERROR_FIND_USER_BY_ID);
        } else if (!user) {
          console.log(apiMessage.NOT_FOUND_USER);
          return reject(apiMessage.NOT_FOUND_USER);
        } else return resolve(user);
      });
    });
  }

  async addFriend(userId, friendName) {
    return new Promise(async (resolve, reject) => {
      console.log("Adding friend");
      try {
        const user = await UserModel.findById(userId);
        if (!user) {
          //Wrong ID means Token is wrong/invalidate
          console.log(apiMessage.TOKEN_EXPIRE_INVALIDATE);
          return reject(apiMessage.TOKEN_EXPIRE_INVALIDATE);
        } else
          try {
            const friend = await UserModel.findOne({ username: friendName });
            if (!friend) {
              console.log(apiMessage.NOT_FOUND_USER);
              return reject(apiMessage.NOT_FOUND_USER);
            } else if (user.listFriend.includes(friend._id)) {
              console.log(apiMessage.USER_ALREADY_FRIEND);
              return reject(apiMessage.USER_ALREADY_FRIEND);
            } else {
              try {
                user.listFriend.push(friend._id);
                user.save();
                friend.listFriend.push(user._id);
                friend.save();
                return resolve(true);
              } catch (err) {
                return reject(err.message);
              }
            }
          } catch (e) {
            console.log(DbMessage.DBERROR_FIND_USER_BY_NAME);
            console.log("a");
            return reject(DbMessage.DBERROR_FIND_USER_BY_NAME);
          }
      } catch (e) {
        console.log(DbMessage.DBERROR_FIND_USER_BY_ID);
        return reject(DbMessage.DBERROR_FIND_USER_BY_ID);
      }
    });
  }

  async joinChannel(userId, channelId) {
    return new Promise(async (resolve, reject) => {
      try {
        const user = await UserModel.findById(userId);
        if (!user) {
          //Wrong ID means Token is wrong/invalidate
          console.log(apiMessage.TOKEN_EXPIRE_INVALIDATE);
          return reject(apiMessage.TOKEN_EXPIRE_INVALIDATE);
        } else if (user.listChannel.includes(channelId)) {
          console.log(apiMessage.USER_ALREADY_IN_CHANNEL);
          return reject(apiMessage.USER_ALREADY_IN_CHANNEL);
        } else
          try {
            const channel = await ChannelModel.findById(channelId);
            if (!channel) {
              console.log(apiMessage.NOT_FOUND_CHANNEL);
              return reject(apiMessage.NOT_FOUND_CHANNEL);
            } else {
              try {
                user.listChannel.push(channel._id);
                channel.listUser.push(user._id);
                user.save();
                channel.save();
                return resolve(channel);
              } catch (err) {
                return reject(err.message);
              }
            }
          } catch (e) {
            console.log(DbMessage.DBERROR_FIND_CHANNEL_BY_ID);
            return reject(DbMessage.DBERROR_FIND_CHANNEL_BY_ID);
          }
      } catch (e) {
        console.log(DbMessage.DBERROR_FIND_USER_BY_ID);
        return reject(DbMessage.DBERROR_FIND_USER_BY_ID);
      }
    });
  }

  async createChannel(userId, channelName) {
    return new Promise(async (resolve, reject) => {
      try {
        const user = await UserModel.findById(userId);
        if (!user) {
          //Wrong ID means Token is wrong/invalidate
          console.log(apiMessage.TOKEN_EXPIRE_INVALIDATE);
          return reject(apiMessage.TOKEN_EXPIRE_INVALIDATE);
        } else {
          try {
            await ChannelModel.create({
              channelName: channelName,
              listUser: [userId],
            }).then((channel) => {
              user.listChannel.push(channel._id);
              user.save();
              return resolve(channel);
            });
          } catch (e) {
            const errors = this.handleErrors(e);
            console.log(DbMessage.DBERROR_CREATING_CHANNEL);
            return reject(errors);
          }
        }
      } catch (e) {
        console.log(DbMessage.DBERROR_FIND_USER_BY_ID);
        return reject(DbMessage.DBERROR_FIND_USER_BY_ID);
      }
    });
  }

  async getChannel(userId) {
    return new Promise(async (resolve, reject) => {
      await UserModel.findById(userId)
        .populate({
          path: "listChannel",
          select: ["channelName", "_id", "listUser"],
          perDocumentLimit: 100,
          options: {
            sort: { updatedAt: -1 },
          },
        })
        .exec(async function (err, user) {
          if (err) {
            return reject(err);
          } else {
            console.log("Sang dep trai user: ", user);
            let channels = user.listChannel;
            async function res(channels) {
              async function getMsgChannel(channel) {
                return new Promise(async (resolve) => {
                  try {
                    const msg = await MsgModel.find({ channelId: channel._id })
                      .sort({ createdAt: -1 })
                      .limit(1)
                      .exec();

                    const lastMessage = msg[0];
                    if (lastMessage) {
                      if (lastMessage.msgType == 0) {
                        const channelRes = {
                          channel: channel,
                          lastConversation: {
                            content: lastMessage.messageText,
                            channelId: lastMessage.channelId,
                            messageId: lastMessage.messageId,
                            msgType: lastMessage.msgType,
                            sendTime: lastMessage.created_at,
                          },
                        };
                        return resolve(channelRes);
                      } else if (lastMessage.msgType == 1) {
                        const text = await MsgController.getFullTextMsg(msg[0]);
                        const channelRes = {
                          channel: channel,
                          lastConversation: text,
                        };
                        return resolve(channelRes);
                      }
                    } else {
                      const channelRes = {
                        channel: channel,
                        lastConversation: null,
                      };
                      return resolve(channelRes);
                    }
                  } catch (e) {
                    const error = {
                      channel: channel,
                      error: e,
                    };

                    return resolve(error);
                  }
                });
              }
              const result = await Promise.all(channels.map(getMsgChannel));
              return result;
            }
            try {
              const result = await res(channels);
              return resolve(result);
            } catch (e) {
              return reject(e);
            }
          }
        });
    });
  }
}

const userControllerInstance = new UserController();

export default userControllerInstance;
