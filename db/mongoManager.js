import mongoose from "mongoose";
import dbConfig from  "./../configs/dbConfig";

const url = dbConfig.dbUrl;

class MongoManager {
  constructor() {
    this.connectDb();
  }

  connectDb() {
    const connectMongo = async () => {
      await mongoose.connect(url, {
        useNewUrlParser: true,
        useFindAndModify: false,
        useCreateIndex: true,
        useUnifiedTopology: true,
      });
    };

    connectMongo();

    const db = mongoose.connection;
    db.on("error", console.error.bind(console, "connection error:"));
    db.once("open", function () {
      console.log("DB connected");
    });

  }

}

const mongoManagerInstance = new MongoManager();

export default mongoManagerInstance;
