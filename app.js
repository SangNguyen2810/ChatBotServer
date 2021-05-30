import express from "express";
import MongoManager from "./db/mongoManager";
import UserController from "./db/userController";

const startApp = () => {
  console.log("aaa")
  const app = express();
  const port = process.env.PORT || 8000;
  app.get("/hello", (req, res) => res.send("hello world from cules coding"));
  app.listen(port, () => console.log(`Server is running on ${port}`));
};

startApp();


const createUser = async (username, password) => {
  let message = await UserController.createUser(username, password);
  
};


createUser('Sang', '123')