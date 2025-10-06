import { Express } from "express";
import initializeSessionMiddleware from "./session-middleware";

export const initializeMiddlewares = (app: Express) => {
  initializeSessionMiddleware(app);
};
