import { Request, Response } from "express";
import { File } from "@prisma/client";
import FolderService, {
  FolderNode,
  FolderWithSubfoldersAndFiles,
} from "../services/folder-service";

type RenderIndexOptions = {
  allFolders: FolderNode[];
  folders: FolderWithSubfoldersAndFiles[];
  files: File[];
  folder?: FolderWithSubfoldersAndFiles;
  folderPath?: string[];
  breadcrumbs?: { id: string; name: string }[];
};

export function render<T extends object>(
  view: string,
  res: Response,
  req?: Request,
  options?: T & { status?: number }
) {
  const { status, ...rest } = options || {};

  return res.status(status || 200).render(view, {
    isAuthenticated: req ? req.isAuthenticated() : false,
    user: req ? req.user : null,
    ...rest,
  });
}

export async function renderIndex<T extends object>(
  res: Response,
  req: Request,
  options?: T & { folder?: FolderWithSubfoldersAndFiles }
) {
  const allFolders = await FolderService.getFolderTreeForOwner(
    req.user?.id || ""
  );
  const folders = options?.folder?.subfolders || req.user?.folders || [];
  const files = options?.folder?.files || req.user?.files || [];

  const indexOptions: RenderIndexOptions = {
    allFolders,
    folders,
    files,
  };

  if (options?.folder) {
    const breadcrumbs = await FolderService.getFolderPathWithNames(
      options.folder.id
    );
    const folderPath = breadcrumbs.map((b) => b.id);

    indexOptions.folder = options.folder;
    indexOptions.folderPath = folderPath;
    indexOptions.breadcrumbs = breadcrumbs;
  }

  return render("index", res, req, { ...indexOptions, ...options });
}
