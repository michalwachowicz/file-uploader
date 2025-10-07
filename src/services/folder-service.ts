import prisma from "../prisma";
import { Folder, File } from "@prisma/client";

export type FolderNode = Folder & { subfolders: FolderNode[] };
export type FolderWithSubfoldersAndFiles = Folder & {
  subfolders?: Folder[];
  files?: File[];
};

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

  async getFolderById(
    id: string
  ): Promise<FolderWithSubfoldersAndFiles | null> {
    return await prisma.folder.findUnique({
      where: { id },
      include: {
        subfolders: { where: { parentId: id } },
        files: { where: { folderId: id } },
      },
    });
  }

  async hasValidShareInAncestors(folder: Folder): Promise<boolean> {
    const rows = await prisma.$queryRaw<Array<{ found: boolean }>>`
      WITH RECURSIVE ancestors AS (
        SELECT "id", "parentId", "shareExpiresAt"
        FROM "Folder"
        WHERE "id" = ${folder.id}::uuid
        UNION ALL
        SELECT f."id", f."parentId", f."shareExpiresAt"
        FROM "Folder" f
        JOIN ancestors a ON a."parentId" = f."id"::uuid
      )
      SELECT EXISTS (
        SELECT 1 FROM ancestors
        WHERE "shareExpiresAt" IS NOT NULL AND "shareExpiresAt" > NOW()
      ) AS found;
    `;
    return rows[0]?.found === true;
  }

  async getFolderPathWithNames(
    folderId: string
  ): Promise<Array<{ id: string; name: string }>> {
    const rows = await prisma.$queryRaw<Array<{ id: string; name: string }>>`
      WITH RECURSIVE ancestors AS (
        SELECT "id", "parentId", "name", 0 AS depth
        FROM "Folder"
        WHERE "id" = ${folderId}::uuid
        UNION ALL
        SELECT f."id", f."parentId", f."name", a.depth + 1 AS depth
        FROM "Folder" f
        JOIN ancestors a ON a."parentId" = f."id"::uuid
      )
      SELECT "id", "name", depth
      FROM ancestors
      ORDER BY depth DESC;
    `;
    return rows.map((row) => ({ id: row.id, name: row.name }));
  }
}

export default new FolderService();
