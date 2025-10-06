import { Folder, File, User } from "@prisma/client";

export type UserWithFoldersAndFiles = User & {
  folders?: Folder[];
  files?: File[];
};
