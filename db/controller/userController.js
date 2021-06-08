import UserModel from "../model/userModel";
import DbMessage from "../../static/db-error";
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
    lastName
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        const exist = await this.doUserExist(username);
        console.log("createUser exist: ", exist);
        if (exist) {
          return reject({
            err: DbMessage.USER_ALREADY_EXISTS,
          });
        } else {
          this.createUserDB(
            username,
            password,
            email,
            firstName,
            lastName)
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
        username,
        password,
        email,
        firstName,
        lastName})
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
        return resolve(false);
      })
    })
  }

  async loginPost(username, password) {
    const user = await UserModel.findOne({username: username});
    if (user) {
      const auth = await bcrypt.compare(password, user.password);
      if (auth) {
        return user;
      } else {
        throw Error("Incorrect password");
      }
    } else throw Error("User not existed!");
  }

  async findById (id) {
    return new Promise((resolve, reject) => {
      UserModel.findById(id, {password: 0}, (err,user) => {
        if (err) {
          return reject("There was a problem finding user");
        }
        else if (!user) {
          return reject("Cannot found");
        }
        else return resolve(user);
      })
    })
  }
}


const userControllerInstance = new UserController();

export default userControllerInstance;
