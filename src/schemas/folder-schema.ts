import { z } from "zod";

const folderNameValidation = z
  .string()
  .trim()
  .min(1, "Name is required")
  .transform((val) => val.replace(/[<>:"/\\|?*]/g, ""))
  .refine(
    (val) => val.length > 0,
    "Folder name contains only invalid characters"
  );

export const createFolderSchema = z.object({
  folderName: folderNameValidation,
});

export type CreateFolderInput = z.infer<typeof createFolderSchema>;

export const renameFolderSchema = z.object({
  name: folderNameValidation,
});

export type RenameFolderInput = z.infer<typeof renameFolderSchema>;
