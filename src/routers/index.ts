import { Express } from "express";
import authRouter from "./auth-router";
import folderRouter from "./folder-router";
import rootRouter from "./root-router";

export function initializeRouters(app: Express) {
  app.use("/auth", authRouter);
  app.use("/folder", folderRouter);
  app.use("/", rootRouter);
}
