import { Request, Response, NextFunction } from "express";
import passport from "passport";
import bcrypt from "bcrypt";
import render from "../utils/renderer";
import UserService from "../services/user-service";

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
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/auth/login",
  })(req, res, next);
}

export async function postRegister(req: Request, res: Response) {
  const { username, password, passwordConfirm } = req.body;

  const user = await UserService.getUserByUsername(username);
  if (user) {
    return res.status(400).json({ message: "Username already exists" });
  }

  if (password !== passwordConfirm) {
    return res.status(400).json({ message: "Passwords do not match" });
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
    if (err) {
      return res.status(500).json({ message: "Failed to logout" });
    }

    res.redirect("/");
  });
}
