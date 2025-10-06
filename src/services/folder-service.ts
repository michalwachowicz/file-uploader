import prisma from "../prisma";
import { Folder } from "@prisma/client";

export type FolderNode = Folder & { subfolders: FolderNode[] };

class FolderService {
  async getFolderTreeForOwner(ownerId: string): Promise<FolderNode[]> {
    const folders = await prisma.folder.findMany({ where: { ownerId } });
    const idToNode = new Map<string, FolderNode>();
    const roots: FolderNode[] = [];

    for (const f of folders) idToNode.set(f.id, { ...f, subfolders: [] });
    for (const f of folders) {
      const node = idToNode.get(f.id);
      if (f.parentId) {
        const parent = idToNode.get(f.parentId);
        if (parent && node) parent.subfolders.push(node);
      } else {
        if (node) roots.push(node);
      }
    }

    const sortRec = (nodes: FolderNode[]) => {
      nodes.sort((a, b) => a.name.localeCompare(b.name));
      nodes.forEach((n) => sortRec(n.subfolders));
    };

    sortRec(roots);
    return roots;
  }

  async getFolderById(id: string): Promise<Folder | null> {
    return await prisma.folder.findUnique({
      where: { id },
      include: { subfolders: true, files: true },
    });
  }
}

export default new FolderService();
