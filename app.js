import express from "express";
import MongoManager from "./db/mongoManager";
import UserController from "./db/controller/userController";
import router from "./routes/users.js";
import authenticateJWT from "./middleware/authMiddleware.js";
import cookieParser from 'cookie-parser';
import cors from "cors";
import csrf from 'csurf'
import bodyParser from "body-parser";

const startApp = () => {
  const app = express();
  const port = process.env.PORT || 8000;
  const corsOptions = {
    origin: "http://localhost:3000",
    credentials: true,
  }
  app.use(cors(corsOptions));
  app.use(bodyParser.urlencoded({extended: true}));

  app.get("/hello", (req, res) => res.send("hello world from cules coding"));
  app.listen(port, () => console.log('Server is running on ${port}'));
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(cookieParser());


  app.use(express.json());
  app.use(express.urlencoded({extended: true}));
  app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    next();
  });

  //Adding authentication JWT for every route, except login/register
  app.all('*', authenticateJWT);
  app.use("/user", router);

};

startApp();

// const createUser = async (username, password, email, firstName, lastName, dateOfBirth) => {
//   let message = await UserController.createUser(username, password, email, firstName, lastName, dateOfBirth);
//
// };
//
//
// createUser('Sang', '123',"1","1","1",1)