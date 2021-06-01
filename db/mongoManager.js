import mongoose from "mongoose";

class MongoManager {
  constructor() {
    this.connectDb();
  }

  connectDb() {
    const connectMongo = async () => {
      await mongoose.connect("mongodb://localhost:27017/ChatBot", {
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