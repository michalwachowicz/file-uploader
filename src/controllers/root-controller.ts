import { Request, Response } from "express";
import render from "../utils/renderer";
import FolderService from "../services/folder-service";

export async function getIndex(req: Request, res: Response) {
  const allFolders = await FolderService.getFolderTreeForOwner(
    req.user?.id || ""
  );

  const folders = req.user?.folders || [];
  const files = req.user?.files || [];

  render("index", res, req, { allFolders, folders, files });
}
