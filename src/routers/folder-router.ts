import { Router } from "express";
import { folderController } from "../controllers";

const router = Router();

router.get("/:id", folderController.getFolder);

export default router;
