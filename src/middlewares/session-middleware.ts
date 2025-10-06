import { Express } from "express";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import session from "express-session";
import prisma from "../prisma";
import config from "../config";

export default function initializeSessionMiddleware(app: Express) {
  app.use(
    session({
      store: new PrismaSessionStore(prisma, {}),
      secret: config.sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 1, // 1 day
      },
    })
  );
}
