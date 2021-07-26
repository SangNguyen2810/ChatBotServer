import UserMessage from "../static/userMessage.js";


class UserValidator{
  constructor(){

  }

  validateRegisterInput(username, password, email, firstName, lastName, dateOfBirth){
    const errors = [];
    if (!firstName) {
      errors.push({err: UserMessage.FIRST_NAME_CAN_NOT_EMPTY})
    }
    if (!lastName) {
      errors.push({err: UserMessage.LAST_NAME_CAN_NOT_EMPTY})
    }
    if (!username) {
      errors.push({err: UserMessage.USERNAME_CAN_NOT_EMPTY})
    }
    if (!password) {
      errors.push({err: UserMessage.PASSWORD_CAN_NOT_EMPTY})
    }
    if (!email) {
      errors.push({err: UserMessage.EMAIL_CAN_NOT_EMPTY})
    }
    if (!dateOfBirth) {
      errors.push({err: UserMessage.DATE_OF_BIRTH_CAN_NOT_EMPTY})
    }
  
    console.log(JSON.stringify(errors));
    if (password.length < 6) {
      errors.push({err: UserMessage.PASSWORD_NOT_ENOUGH_LENGTH});
    }
    return errors;
  }


}


const userValidator = new UserValidator();
export default userValidator;