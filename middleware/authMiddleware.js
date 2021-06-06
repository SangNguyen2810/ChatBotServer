import jwt from "jsonwebtoken";
import connect from "../db/mongoManager";
import config from "../config";
import UserController from "../db/model/userModel";

const maxAge = 1 * 60 * 60;
const authenticateJWT = (req,res,next) => {
    //Adding authentication for every route, except login/register
    if (req.path == "/user/register"|| req.path == "/user/login" ) {
        console.log("abcd");
        return next();
    }
    else {
        const token = req.cookies.jwt;
        if (token){
            jwt.verify(token, config.secret, (err, decodedToken) => {
                if (err) {
                    console.log(err.message);
                    res.status(403).send("INVALIDATED TOKEN");
                    res.redirect("/login");
                }
                else {
                    //Sending userID after decoded
                    req.userId = decodedToken;
                    next();
                }
            })
        }
        else {
            console.log("abcd");
            res.sendStatus(401);
        }
    }
}

export default authenticateJWT;