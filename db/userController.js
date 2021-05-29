import UserModel from "./userModel";

const addUser = (username, password) => {
  const loggedInUser = new UserModel({ username, password });
  loggedInUser.save((err, a) => {
    console.log("Sang dep trai err, a:", err, a);
  });
};

export { addUser };
