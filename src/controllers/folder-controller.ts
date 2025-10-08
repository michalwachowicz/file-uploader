import { Request, Response } from "express";
import { render, renderIndex } from "../utils/renderer";
import FolderService from "../services/folder-service";
import { createFolderSchema } from "../schemas/folder-schema";
import { formatZodErrors } from "../utils/zod-formatter";

export async function getFolder(req: Request, res: Response) {
  const folder = await FolderService.getFolderById(req.params.id || "");

  if (!folder) {
    return render("error", res, req, {
      status: 404,
      message: "Folder not found",
    });
  }

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
        folders: folder.subfolders || [],
        files: folder.files || [],
      });
    }
  }

  renderIndex(res, req, { folder });
}

export async function createFolder(req: Request, res: Response) {
  if (!req.user) {
    return render("error", res, req, {
      status: 401,
      message: "Unauthorized",
    });
  }

  const ownerId = req.user.id;
  const { error, data } = createFolderSchema.safeParse(req.body);

  if (error) {
    return renderIndex(res, req, {
      errors: formatZodErrors(error),
      folder: req.body.parentId
        ? (await FolderService.getFolderById(req.body.parentId)) || undefined
        : undefined,
    });
  }

  const { folderName } = data;
  const { parentId } = req.body;

  if (parentId) {
    const parentFolder = await FolderService.getFolderById(parentId);

    if (!parentFolder) {
      return render("error", res, req, {
        status: 404,
        message: "Parent folder not found",
      });
    }

    if (parentFolder.ownerId !== ownerId) {
      return render("error", res, req, {
        status: 403,
        message: "You are not allowed to create a folder in this parent folder",
      });
    }
  }

  const existingFolder = await FolderService.getFolderByNameInParent(
    folderName,
    parentId || null,
    ownerId
  );

  if (existingFolder) {
    return renderIndex(res, req, {
      errors: {
        folderName: "A folder with this name already exists",
      },
    });
  }

  const folder = await FolderService.createFolder(
    ownerId,
    folderName,
    parentId
  );
  res.redirect(`/folders/${folder.id}`);
}
