import { Request, Response, NextFunction } from "express";

export const errorHandle = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = res.statusCode || 500;

  res.status(statusCode).json({
    message: err.message,
    stack: err.stack,
  });
};
