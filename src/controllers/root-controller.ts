import { Request, Response } from "express";
import render from "../utils/renderer";

export async function getIndex(req: Request, res: Response) {
  render("index", res, req);
}
