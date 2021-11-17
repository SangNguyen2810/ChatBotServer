import UserMessage from "../../static/userMessage";

import jwt from "jsonwebtoken";
import config from "../../config";
import UserValidator from "../../utils/user-validator";
import UserModel from "../../graphql/model/userModel.js";
import UserController from "../../db/controller/userController";
import {  UserInputError } from 'apollo-server'

const maxAge = 1 * 24 * 60 * 60 * 1000; // maxAge of 1 day
const createToken = (id) => {
  return jwt.sign({ id }, config.secret, {
    expiresIn: maxAge,
  });
};
export default {
  Query: {
    sayHi: () => "Hello World!",
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
      let errors = UserValidator.validateRegisterInput(
        username,
        password,
        email,
        firstName,
        lastName,
        dateOfBirth
      );
      if (Object.keys(errors).length > 0) {
        console.log("Sang dep trai error 1: ", errors);
        throw new Error("Errors", errors);
      }
      const user = await UserModel.findOne({ username });
      if (user) {
        console.log("Sang dep trai error 2: ", errors);
        throw new UserInputError("Sanbggg", UserMessage.USERNAME_IS_TAKEN);
      } else {
        const res = await UserController.createUser(
          username,
          password,
          email,
          firstName,
          lastName,
          dateOfBirth
        );
        return res;
      }
    },
  },
};
