import prisma from "../prisma";
import { File } from "@prisma/client";

class FileService {
  async getFilesForFolder(folderId: string): Promise<File[]> {
    return await prisma.file.findMany({ where: { folderId } });
  }
}

export default new FileService();
