import UserModel from "../model/userModel";
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
        username,
        password,
        email,
        firstName,
        lastName,
        dateOfBirth})
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
    const user = await UserModel.findOne({username: username});
    if (user) {
      const auth = await bcrypt.compare(password, user.password);
      if (auth) {
        return user;
      } else {
        throw Error(apiMessage.INCORRECT_PASSWORD);
      }
    } else throw Error(apiMessage.INCORRECT_USERNAME);
  }

  async findById (id) {
    return new Promise((resolve, reject) => {
      console.log('User Controller: Finding user by ID');
      UserModel.findById(id, {password: 0}, (err,user) => {
        if (err) {
          console.log('findByID err');
          return reject(DbMessage.DBERROR_FIND_USER_BY_ID);
        }
        else if (!user) {
          console.log("findByID: not found user");
          return reject(apiMessage.NOT_FOUND_USER);
        }
        else return resolve(user);
      })
    })
  }
}


const userControllerInstance = new UserController();

export default userControllerInstance;
