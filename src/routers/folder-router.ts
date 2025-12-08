import { Router } from "express";
import { folderController } from "../controllers";

const router = Router();

router.get("/:id", folderController.getFolder);
router.post("/:id/delete", folderController.deleteFolder);
router.post("/:id/rename", folderController.renameFolder);
router.post("/", folderController.createFolder);

export default router;
