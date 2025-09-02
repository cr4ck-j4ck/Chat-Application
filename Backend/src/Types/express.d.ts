import { Request } from "express";

declare global {
  declare namespace Express {
    interface Request {
      user: {
        userId: string;
        userName:string;
      };
    }
  }
}
