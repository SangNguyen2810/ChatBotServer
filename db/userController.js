import UserModel from "./userModel";
import DbMessage from "../static/dbMessage";

class UserController {
  constructor() {}

  async createUser(username, password) {
    const exist = await this.doUserExist(username);
    console.log("createUser exist: ", exist);
    if (exist) {
      return {
        err: DbMessage.USER_ALREADY_EXISTS,
        username,
        password,
      };
    } else {
      this.createUserDB(username, password)
      .then((res)=>{
        if(res.err === null) {
          return DbMessage.CREATE_USER_SUCCESS
        }
      })
      .catch((err)=>{
        return err.err;
      })
    }
  }

  createUserDB(username, password) {
    return new Promise((resolve, reject) => {
      const loggedInUser = new UserModel({ username, password });
      loggedInUser.save((err, a) => {
        if (err) {
          console.log("[Error] [UserController] createUserDB error: ", err);
          return reject({ err: DbMessage.USER_SAVED_ERROR });
        }
        return resolve({ err: null });
      });
    });
  }

  doUserExist(username) {
    return new Promise((resolve, reject) => {
      UserModel.find({ username }, (e, docs) => {
        if (docs.length) {
          return resolve(true);
        }
        return resolve(false);
      });
    });
  }
}

const userControllerInstance = new UserController();

export default userControllerInstance;
