import { Router } from "express";
import * as authController from "../controllers/auth-controller";

const router = Router();

router.get("/login", authController.getLogin);
router.get("/register", authController.getRegister);

export default router;
