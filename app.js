import express from "express";
import MongoManager from "./db/mongoManager";
import UserController from "./db/controller/userController";
import router from "./routes/users.js";



const startApp = () => {
  const app = express();
  const port = process.env.PORT || 8001;
  app.get("/hello", (req, res) => res.send("hello world from cules coding"));
  app.listen(port, () => console.log(`Server is running on ${port}`));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
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