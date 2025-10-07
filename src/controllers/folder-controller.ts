import { Request, Response } from "express";
import render from "../utils/renderer";
import FolderService from "../services/folder-service";

export async function getFolder(req: Request, res: Response) {
  const folder = await FolderService.getFolderById(req.params.id || "");

  if (!folder) {
    return render("error", res, req, {
      status: 404,
      message: "Folder not found",
    });
  }

  const folders = folder.subfolders || [];
  const files = folder.files || [];

  const isOwner = folder.ownerId === req.user?.id;

  if (!isOwner) {
    const isShareValid = await FolderService.hasValidShareInAncestors(folder);

    if (!isShareValid) {
      return render("error", res, req, {
        status: 403,
        message: "You are not allowed to access this folder",
      });
    } else {
      return render("folder", res, req, {
        folder,
        folders,
        files,
      });
    }
  }

  const allFolders = await FolderService.getFolderTreeForOwner(
    req.user?.id || ""
  );

  render("index", res, req, { folder, allFolders, folders, files });
}
