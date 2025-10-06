import { Request, Response } from "express";
import render from "../utils/renderer";

export async function getLogin(_: Request, res: Response) {
  render("login", res);
}

export async function getRegister(_: Request, res: Response) {
  render("register", res);
}
