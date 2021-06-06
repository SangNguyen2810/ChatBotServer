import express from "express";
import MongoManager from "./db/mongoManager";
import UserController from "./db/controller/userController";
import router from "./routes/users.js";
import authenticateJWT from "./middleware/authMiddleware.js";
import cookieParser from 'cookie-parser';
import cors from "cors";



const startApp = () => {
  const app = express();
  const port = process.env.PORT || 8000;

  

  //Adding authentication JWT for every route, except login/register
  app.all('*',authenticateJWT);
  app.use("/user",router);
  
};

startApp();

// const createUser = async (username, password, email, firstName, lastName, dateOfBirth) => {
//   let message = await UserController.createUser(username, password, email, firstName, lastName, dateOfBirth);
//
// };
//
//
// createUser('Sang', '123',"1","1","1",1)