import { Request, Response } from "express";
import render from "../utils/renderer";

export async function getIndex(_: Request, res: Response) {
  render("index", res);
}
