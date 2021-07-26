const { gql } = require("apollo-server");

module.exports = gql`
  type User {
    id: ID!
    username: String!
    password: String!
    email: String!
    firstName: String!
    lastName: String!
    token: String!
    dateOfBirth: String!
    listFriend: [User]
    listChannel: [Channel]
  }

  type Channel {
    id: ID!
    channelName: String!
    numMessage: Int!
    createdAt: String!
    admin: User
    listUser: [User]
  }

  type Message {
    channelId: String!
    messageId: String!
    partId: Int!
    userName: String!
    msgType: String!
    messageText: String
  }

  input RegisterInput {
    username: String!
    password: String!
    email: String!
    firstName: String!
    lastName: String!
    dateOfBirth: String!
    confirmPassword: String!
  }

  type Query {
    sayHi: String!
  }

  type Mutation {
    register(registerInput: RegisterInput): User!
    login(username: String!, password: String!): User!
  }
`;
