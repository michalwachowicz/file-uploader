import { Router } from "express";
import { rootController } from "../controllers";
import { authMiddleware } from "../middlewares";

const router = Router();

router.get("/", authMiddleware.checkAuth, rootController.getIndex);

export default router;
