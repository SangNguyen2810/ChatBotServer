import UserModel from "../model/userModel";
import DbMessage from "../../static/dbMessage";
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
          return resolve({
            err: DbMessage.USER_ALREADY_EXISTS,
            username,
            password,
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
              console.log("Sang dep trai res: ",res);
              return resolve({message: DbMessage.CREATE_USER_SUCCESS});
            })
            .catch((err) => {
              console.log("Sang dep trai res: ",err);
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
        lastName,
        dateOfBirth
      }).then((user) => {
          return resolve(true);
        }
      ).catch((err) => {
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
}


const userControllerInstance = new UserController();

export default userControllerInstance;
