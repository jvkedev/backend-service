import { IStudent } from "../models/user.ts";

// Extends Express Request type to include authenticated user object
declare global {
  namespace Express {
    interface Request {
      user?: IStudent;
    }
  }
}
