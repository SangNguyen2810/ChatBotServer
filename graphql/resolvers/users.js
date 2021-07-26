import UserMessage from "../../static/userMessage";

import jwt from "jsonwebtoken";
import config from "../../config"
import UserValidator from "../../utils/user-validator";
import UserModel from "../../graphql/model/userModel.js";
import UserController from "../../db/controller/userController";

const maxAge = 1 * 24 * 60 * 60 * 1000; // maxAge of 1 day
const createToken = (id) => {
  return jwt.sign({ id }, config.secret, {
    expiresIn: maxAge,
  });
};
export default {
  Query: {
    sayHi: () => 'Hello World!'
  },
  Mutation: {
    async register(
      _,
      {
        registerInput: {
          username,
          password,
          email,
          firstName,
          lastName,
          dateOfBirth,
        },
      }
    ) {
      const errors = UserValidator.validateRegisterInput(
        username,
        password,
        email,
        firstName,
        lastName,
        dateOfBirth
      );
      if (errors.length > 0) {
        throw new UserInputError("Errors", { errors });
      }
      const user = await UserModel.findOne({ username });
      if (user) {
        errors.push({ err: UserMessage.USERNAME_IS_TAKEN });
        throw new UserInputError("Errors", { errors });
      }else{
        const res = await UserController.createUser(username,password,email,firstName,lastName,dateOfBirth)
        return res;
      }
    },
  },
};
