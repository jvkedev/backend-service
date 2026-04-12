import jwt, { SignOptions } from "jsonwebtoken";
import env from "../config/env.js";

const generateToken = (userId: string) => {
  return jwt.sign({ id: userId }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"],
  });
};

export default generateToken;
