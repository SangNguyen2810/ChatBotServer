import jwt from "jsonwebtoken";
import connect from "../db/mongoManager.js";
import config from "../config.js";
import UserModel from "../db/model/userModel.js";
import DbMessage from "../static/dbMessage.js";
import apiMessage from "../static/apiMessage.js";

const maxAge = 1 * 60 * 60;
const authenticateJWT = (req,res,next) => {
    //Adding authentication for every route, except login/register
    if (req.path == "/user/register"|| req.path == "/user/login" ) {
        return next();
    }
    else {
        const token = req.cookies.jwt;
        if (token){
            jwt.verify(token, config.secret, (err, decodedToken) => {
                if (err) {
                    console.log(err.message);
                    res.status(403);
                    res.redirect("/login");
                }
                else {
                    UserModel.findById(decodedToken.id, (err, user) => {
                        if (err) {
                            res.send(DbMessage.DBERROR_FIND_USER_BY_ID);
                        }
                        else if (!user) {
                            res.send(apiMessage.TOKEN_EXPIRE_INVALIDATE);
                        }
                        else {
                            req.userId = decodedToken.id;
                            next();
                        }
                    })
                }
            })
        }
        else {
            res.sendStatus(401);
        }
    }
}

export default authenticateJWT;