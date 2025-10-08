import { Router } from "express";
import { folderController } from "../controllers";

const router = Router();

router.get("/:id", folderController.getFolder);
router.post("/", folderController.createFolder);

export default router;
