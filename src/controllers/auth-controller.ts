import { Request, Response, NextFunction } from "express";
import passport from "passport";
import bcrypt from "bcrypt";
import UserService from "../services/user-service";
import { render } from "../utils/renderer";
import { registerSchema, loginSchema } from "../schemas/auth-schema";
import { formatZodErrors } from "../utils/zod-formatter";
import { User } from "@prisma/client";

export async function getLogin(_: Request, res: Response) {
  render("login", res);
}

export async function getRegister(_: Request, res: Response) {
  render("register", res);
}

export async function postLogin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { error } = loginSchema.safeParse(req.body);

  if (error) {
    return render("login", res, req, { errors: formatZodErrors(error) });
  }

  passport.authenticate(
    "local",
    (err: Error | null, user: User | false, info: { message: string }) => {
      if (err) return next(err);

      if (!user) {
        return render("login", res, req, {
          status: 401,
          errors: { _error: info?.message || "Invalid credentials" },
          values: req.body,
        });
      }

      req.logIn(user, (loginErr) => {
        if (loginErr) return next(loginErr);
        return res.redirect("/");
      });
    }
  )(req, res, next);
}

export async function postRegister(req: Request, res: Response) {
  const { username, password } = req.body;
  const { error } = registerSchema.safeParse(req.body);
  const errors = error ? formatZodErrors(error) : {};

  const user = await UserService.getUserByUsername(username);
  if (user) errors.username = "Username already exists";

  if (Object.keys(errors).length > 0) {
    return render("register", res, req, { errors });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await UserService.createUser({
    username,
    password: hashedPassword,
  });

  res.redirect("/auth/login");
}

export async function postLogout(req: Request, res: Response) {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: "Failed to logout" });
    res.redirect("/");
  });
}
