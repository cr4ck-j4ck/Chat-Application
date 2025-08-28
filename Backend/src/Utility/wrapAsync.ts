import { Request, Response, NextFunction, RequestHandler } from "express";
import { JsonWebTokenError } from "jsonwebtoken";

type Tfunc = (req: Request, res: Response) => Promise<any>;

export function wrapAsyncRouteHandler(func: Tfunc) {
  return (req: Request, res: Response, next: NextFunction) =>
    func(req, res).catch((err) => {
      console.log("Error Catched in the asnyc Wrapper ");
      if(err instanceof JsonWebTokenError){
        return next(err.message)
      }
      next(err);
    });
}
