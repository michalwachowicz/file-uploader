import bcrypt from "bcrypt";
import { Express } from "express";
import { Strategy as LocalStrategy } from "passport-local";
import passport from "passport";
import UserService from "../services/user-service";
import { User as PrismaUser } from "@prisma/client";

declare global {
  namespace Express {
    interface User extends PrismaUser {}
  }
}

export default function initializePassportMiddleware(app: Express) {
  passport.use(
    new LocalStrategy(
      { usernameField: "username", passwordField: "password" },
      async (username, password, done) => {
        try {
          const user = await UserService.getUserByUsername(username);

          if (!user)
            return done(null, false, { message: "Incorrect username." });

          const ok = await bcrypt.compare(password, user.password);
          if (!ok) return done(null, false, { message: "Incorrect password." });

          return done(null, user);
        } catch (err) {
          return done(err as Error, false);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser((id, done) => {
    if (!id || typeof id !== "string") {
      done(new Error("Invalid user ID"), false);
      return;
    }

    UserService.getUserById(id).then((user) => done(null, user));
  });

  app.use(passport.session());
}
