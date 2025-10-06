import { Express } from "express";
import authRouter from "./auth-router";
import rootRouter from "./root-router";

export function initializeRouters(app: Express) {
  app.use("/auth", authRouter);
  app.use("/", rootRouter);
}
