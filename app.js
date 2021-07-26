import express from "express";
import authenticateJWT from "./middleware/authMiddleware.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { ApolloServer } from "apollo-server-express";
import typeDefs from "./graphql/typeDefs.js";
import resolvers from "./graphql/resolvers";
import mongoose from "mongoose";
import dbConfig from "./configs/dbConfig.js";

async function startServer() {
  const PORT = process.env.port || 5000;
  const corsOptions = {
    origin: "https://studio.apollographql.com",
    credentials: true,
  };

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    cors: corsOptions,
  });
  await server.start();
  const app = express();
  app.use('*',cors(corsOptions));

  server.applyMiddleware({ app });
  await mongoose
    .connect(dbConfig.MONGODB, {
      useNewUrlParser: true,
      useFindAndModify: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("MongoDB Connected");
    })

    .catch((err) => {
      console.error(err);
    });

  await new Promise((resolve) => app.listen({ port: 5000 }, resolve));
  console.log(`🚀 Server ready at http://localhost:5000${server.graphqlPath}`);
}

startServer();
