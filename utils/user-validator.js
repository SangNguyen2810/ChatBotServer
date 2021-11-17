import UserMessage from "../static/userMessage.js";

class UserValidator {
  constructor() {}

  validateRegisterInput(
    username,
    password,
    email,
    firstName,
    lastName,
    dateOfBirth
  ) {
    let error = {};
    if (!firstName) {
      error = UserMessage.FIRST_NAME_CAN_NOT_EMPTY;
      return error;
    }
    if (!lastName) {
      error = UserMessage.LAST_NAME_CAN_NOT_EMPTY;
      return error;
    }
    if (!username) {
      error = UserMessage.USERNAME_CAN_NOT_EMPTY;
      return error;
    }
    if (!password) {
      error = UserMessage.PASSWORD_CAN_NOT_EMPTY;
      return error;
    }
    if (!email) {
      error = UserMessage.EMAIL_CAN_NOT_EMPTY;
      return error;
    }
    if (!dateOfBirth) {
      error = UserMessage.DATE_OF_BIRTH_CAN_NOT_EMPTY;
      return error;
    }
    if (password.length < 6) {
      error = UserMessage.PASSWORD_NOT_ENOUGH_LENGTH;
      return error;
    }
    return error;
  }
}

const userValidator = new UserValidator();
export default userValidator;
