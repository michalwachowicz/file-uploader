import { Request, Response } from "express";
import { render, renderIndex } from "../utils/renderer";
import FolderService from "../services/folder-service";
import {
  createFolderSchema,
  renameFolderSchema,
} from "../schemas/folder-schema";
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

export async function deleteFolder(req: Request, res: Response) {
  if (!req.user) {
    return render("error", res, req, {
      status: 401,
      message: "Unauthorized",
    });
  }

  const folder = await FolderService.getFolderById(req.params.id || "");

  if (!folder) {
    return render("error", res, req, {
      status: 404,
      message: "Folder not found",
    });
  }

  if (folder.ownerId !== req.user.id) {
    return renderIndex(res, req, {
      errors: {
        deleteItem: "You are not allowed to delete this folder",
      },
    });
  }

  await FolderService.deleteFolder(req.params.id || "");
  res.redirect(folder.parentId ? `/folders/${folder.parentId}` : "/");
}

export async function renameFolder(req: Request, res: Response) {
  if (!req.user) {
    return render("error", res, req, {
      status: 401,
      message: "Unauthorized",
    });
  }

  const ownerId = req.user.id;
  const { error, data } = renameFolderSchema.safeParse(req.body);

  if (error) {
    const folder = await FolderService.getFolderById(req.params.id || "");
    const parentFolder = folder?.parentId
      ? await FolderService.getFolderById(folder.parentId)
      : null;
    return renderIndex(res, req, {
      errors: formatZodErrors(error),
      folder: parentFolder || undefined,
      formValues: {
        name: req.body.name || "",
      },
    });
  }

  const { name } = data;
  const folderId = req.params.id || "";

  const folder = await FolderService.getFolderById(folderId);

  if (!folder) {
    return render("error", res, req, {
      status: 404,
      message: "Folder not found",
    });
  }

  if (folder.ownerId !== ownerId) {
    const parentFolder = folder.parentId
      ? await FolderService.getFolderById(folder.parentId)
      : null;
    return renderIndex(res, req, {
      errors: {
        name: "You are not allowed to rename this folder",
      },
      folder: parentFolder || undefined,
      formValues: { name },
    });
  }

  const existingFolder = await FolderService.getFolderByNameInParent(
    name,
    folder.parentId,
    ownerId
  );

  if (existingFolder && existingFolder.id !== folderId) {
    const parentFolder = folder.parentId
      ? await FolderService.getFolderById(folder.parentId)
      : null;
    return renderIndex(res, req, {
      errors: {
        name: "A folder with this name already exists",
      },
      folder: parentFolder || undefined,
      formValues: { name },
    });
  }

  try {
    await FolderService.renameFolder(folderId, name, ownerId);
    res.redirect(`/folders/${folderId}`);
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Failed to rename folder";
    const parentFolder = folder.parentId
      ? await FolderService.getFolderById(folder.parentId)
      : null;
    return renderIndex(res, req, {
      errors: {
        name: errorMessage,
      },
      folder: parentFolder || undefined,
      formValues: { name },
    });
  }
}
