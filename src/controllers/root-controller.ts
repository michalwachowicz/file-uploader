import { Request, Response } from "express";
import { renderIndex } from "../utils/renderer";

export async function getIndex(req: Request, res: Response) {
  renderIndex(res, req);
}
