import { z } from "zod";

export const createFolderSchema = z.object({
  folderName: z
    .string()
    .trim()
    .min(1, "Name is required")
    .transform((val) => val.replace(/[<>:"/\\|?*]/g, ""))
    .refine(
      (val) => val.length > 0,
      "Folder name contains only invalid characters"
    ),
});

export type CreateFolderInput = z.infer<typeof createFolderSchema>;
