import mongoose from "mongoose";
mongoose.connect("mongodb://localhost:27017/ChatBot", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connectMongo = async () => {
  await mongoose.connect("mongodb://localhost:27017/ChatBot", {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true,
  });
};

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("DB connected");
});

export default connectMongo;
