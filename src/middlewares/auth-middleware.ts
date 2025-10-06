import { Request, Response, NextFunction } from "express";

export function checkAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) return res.redirect("/auth/login");
  next();
}

export function checkGuest(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) return res.redirect("/");
  next();
}
