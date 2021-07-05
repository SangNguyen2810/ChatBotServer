import express from "express";
import MongoManager from "./db/mongoManager";

import userRouter from "./routes/users.js";
import chatRouter from "./routes/chat.js";
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

  app.get("/hello", (req, res) => res.send("hello world from cules coding"));
  app.listen(port, () => console.log(`Server is running on ${port}`));
  app.use(cookieParser());


  app.use(express.json());
  app.use(express.urlencoded({extended: true}));
  //tam thoi bo qua------
  app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    next();
  });

  //Adding authentication JWT for every route, except login/register
  app.all('*',authenticateJWT);
  app.use("/user",userRouter);
  app.use("/chat",chatRouter);
};

startApp();

  
