import UserModel from "../model/userModel";
import DbMessage from "../../static/dbMessage";
import connect from '../mongoManager';

class UserController {
  constructor() {}
  async createUser(
    username,
    password,
    email,
    firstName,
    lastName,
    dateOfBirth
  ) {
    const exist = await this.doUserExist(username);
    console.log("createUser exist: ", exist);
    if (exist) {
      return {
        err: DbMessage.USER_ALREADY_EXISTS,
        username,
        password,
      };
    } else {
      this.createUserDB(
        username,
        password,
        email,
        firstName,
        lastName,
        dateOfBirth
      )
        .then((res) => {
          if (res.err === null) {
            return DbMessage.CREATE_USER_SUCCESS;
          }
        })
        .catch((err) => {
          return err.err;
        });
    }
  }

  createUserDB(username, password, email, firstName, lastName, dateOfBirth) {
    return new Promise ((resolve, reject) => {
      let user = new UserModel({
        username,
        password,
        email,
        firstName,
        lastName,
        dateOfBirth
      });
      try {
        user.save();
        return resolve(true);
      }
      catch (err) {
        console.log("[Error] [UserController] createUserDB error: ", err);
        return reject({ err: DbMessage.USER_SAVED_ERROR })
      }
    })
  }

  doUserExist(username) {
    return new Promise((resolve, reject) => {
      UserModel.find({username: username}, (err, docs) => {
        if (err) throw err;
        if (docs.length>0) {
          return resolve(true);
        };
        return resolve(false);
      }) 
    })
  }

  login_post(username, password) {
    return UserModel.login(username, password)
      
  }
}


const userControllerInstance = new UserController();

export default userControllerInstance;
